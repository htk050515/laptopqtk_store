import json
import uuid
import logging

from django.db import transaction
from django.db.models import Q, F
from django.shortcuts import redirect
from django.conf import settings
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.accounts.permissions import IsAdmin
from apps.cart.models import CartItem
from apps.catalog.models import ProductVariation
from .models import Order, OrderItem, Invoice
from .serializers import (
    OrderSerializer, OrderBriefSerializer, InvoiceSerializer, LaravelStylePagination,
    OrderItemSerializer,
)
from .vnpay import build_vnpay_url

logger = logging.getLogger(__name__)

VALID_STATUS_TRANSITIONS = {
    'pending': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [],
    'cancelled': [],
}

STATUS_TRANSLATIONS = {
    'pending': 'Đang chờ xác nhận',
    'processing': 'Đang chờ vận chuyển',
    'shipped': 'Đã vận chuyển',
    'delivered': 'Đã giao thành công',
    'cancelled': 'Đã hủy',
}


# ===== Customer Order Views =====

class CustomerOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Create order from selected cart items."""
        cart_item_ids = request.data.get('cart_items', [])
        if not cart_item_ids:
            return Response(
                {'cart_items': ['The cart items field is required.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        errors = {}
        if not request.data.get('shipping_address'):
            errors['shipping_address'] = ['The shipping address field is required.']
        if not request.data.get('shipping_phone'):
            errors['shipping_phone'] = ['The shipping phone field is required.']
        if not request.data.get('shipping_name'):
            errors['shipping_name'] = ['The shipping name field is required.']
        if not request.data.get('payment_method'):
            errors['payment_method'] = ['The payment method field is required.']
        if errors:
            return Response(errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        cart_items = CartItem.objects.filter(
            user=request.user, id__in=cart_item_ids
        ).select_related(
            'product_variation__product',
        ).prefetch_related(
            'product_variation__images',
            'product_variation__attributes',
        )

        if not cart_items.exists():
            return Response(
                {'message': 'Không có sản phẩm hợp lệ để đặt hàng'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                # Calculate total
                total_amount = sum(
                    (item.product_variation.discount_price or item.product_variation.price) * item.quantity
                    for item in cart_items
                )
                shipping_fee = 35000
                total_amount += shipping_fee

                order = Order(
                    user=request.user,
                    order_number=str(uuid.uuid4()),
                    total_amount=total_amount,
                    shipping_address=request.data['shipping_address'],
                    shipping_phone=request.data['shipping_phone'],
                    shipping_name=request.data['shipping_name'],
                    payment_method=request.data['payment_method'],
                    payment_status='pending',
                    status='pending',
                    notes=request.data.get('notes'),
                    shipping_fee=shipping_fee,
                )
                order.save()

                # Create order items and decrement stock
                for cart_item in cart_items:
                    pv = cart_item.product_variation
                    # Serialize attributes for snapshot
                    attrs = list(pv.attributes.select_related('attribute_value').values(
                        'id', 'product_variation_id', 'attribute_value_id',
                        'created_at', 'updated_at',
                    ))

                    OrderItem(
                        order=order,
                        product_id=pv.product_id,
                        product_variation=pv,
                        quantity=cart_item.quantity,
                        price=pv.price,
                        discount_price=pv.discount_price,
                        attributes_snapshot=json.dumps(attrs, default=str),
                    ).save()

                    # Decrement stock
                    ProductVariation.objects.filter(id=pv.id).update(
                        stock_quantity=F('stock_quantity') - cart_item.quantity
                    )

                # Delete checked-out cart items
                CartItem.objects.filter(id__in=cart_item_ids).delete()

                return Response({
                    'message': 'Đặt hàng thành công',
                    'order': OrderBriefSerializer(order).data,
                })

            except Exception as e:
                logger.error("Order creation error: %s", str(e))
                return Response(
                    {'message': 'Có lỗi xảy ra', 'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

    def get(self, request):
        """Get user's orders."""
        orders = Order.objects.filter(user=request.user).prefetch_related(
            'items__product_variation__product',
            'items__product_variation__images',
            'items__product_variation__attributes',
            'items__product_variation__attributes__attribute_value',
        ).order_by('-created_at')
        return Response({'orders': OrderSerializer(orders, many=True).data})


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        cancellation_reason = request.data.get('cancellation_reason')
        if not cancellation_reason:
            return Response(
                {'cancellation_reason': ['The cancellation reason field is required.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'message': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)

        if order.status in ('shipped', 'delivered'):
            return Response(
                {'message': 'Không thể hủy đơn hàng đã vận chuyển'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                order.status = 'cancelled'
                order.payment_status = 'refunded' if order.payment_status == 'paid' else 'pending'
                order.notes = cancellation_reason
                order.save()

                # Restore stock
                for item in order.items.select_related('product_variation'):
                    ProductVariation.objects.filter(id=item.product_variation_id).update(
                        stock_quantity=F('stock_quantity') + item.quantity
                    )

                return Response({'message': 'Đơn hàng đã bị hủy thành công'})
            except Exception as e:
                return Response(
                    {'message': 'Lỗi khi hủy đơn hàng', 'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )


# ===== Invoice Views =====

class CreateInvoiceView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'message': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)

        # Check if invoice already exists
        try:
            existing = Invoice.objects.get(order=order)
            return Response({
                'message': 'Hóa đơn đã tồn tại',
                'invoice': InvoiceSerializer(existing).data,
            })
        except Invoice.DoesNotExist:
            pass

        invoice = Invoice(
            order=order,
            invoice_number=str(uuid.uuid4()),
            amount=order.total_amount,
            status='unpaid',
        )
        invoice.save()

        return Response({
            'message': 'Hóa đơn đã được tạo',
            'invoice': InvoiceSerializer(invoice).data,
        })


class PayWithVnpayView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            invoice = Invoice.objects.get(id=pk)
        except Invoice.DoesNotExist:
            return Response({'message': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

        redirect_url = build_vnpay_url(invoice)
        return Response({'redirect_url': redirect_url})


class VnpayReturnView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client_url = settings.DOMAIN_CLIENT
        txn_ref = request.query_params.get('vnp_TxnRef')
        response_code = request.query_params.get('vnp_ResponseCode')

        try:
            invoice = Invoice.objects.get(invoice_number=txn_ref)
        except Invoice.DoesNotExist:
            return redirect(f'{client_url}/check-payment-status?status=error&message=Hóa đơn không tồn tại')

        if response_code == '00':
            invoice.status = 'paid'
            invoice.payment_date = timezone.now()
            invoice.save()

            try:
                order = Order.objects.get(id=invoice.order_id)
                order.payment_status = 'paid'
                order.save()
            except Order.DoesNotExist:
                pass

            return redirect(f'{client_url}/check-payment-status?invoice_number={invoice.invoice_number}')
        else:
            invoice.status = 'cancelled'
            invoice.save()

            try:
                order = Order.objects.get(id=invoice.order_id)
                order.payment_status = 'failed'
                order.save()
            except Order.DoesNotExist:
                pass

            return redirect(f'{client_url}/check-payment-status?invoice_number={invoice.invoice_number}')


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoice_number = request.query_params.get('invoice_number')
        try:
            invoice = Invoice.objects.get(invoice_number=invoice_number)
        except Invoice.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Hóa đơn không tồn tại',
            }, status=status.HTTP_404_NOT_FOUND)

        if invoice.status == 'paid':
            return Response({'status': 'success', 'message': 'Thanh toán thành công'})
        elif invoice.status == 'failed':
            return Response({'status': 'failed', 'message': 'Thanh toán thất bại'})
        else:
            return Response({'status': 'pending', 'message': 'Chưa thanh toán'})


# ===== Admin Order Views =====

class AdminOrderListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        orders = Order.objects.select_related('user').prefetch_related(
            'items__product_variation__product',
            'items__product_variation__images',
            'items__product_variation__attributes',
            'items__product_variation__attributes__attribute_value',
        ).order_by('-created_at')
        return Response({'orders': OrderSerializer(orders, many=True).data})


class AdminOrderSearchView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        qs = Order.objects.select_related('user').prefetch_related(
            'items__product_variation__product',
        )

        keyword = request.query_params.get('keyword')
        if keyword:
            qs = qs.filter(
                Q(shipping_name__icontains=keyword) |
                Q(shipping_phone__icontains=keyword) |
                Q(shipping_address__icontains=keyword) |
                Q(user__name__icontains=keyword) |
                Q(user__email__icontains=keyword)
            )

        order_status = request.query_params.get('status')
        if order_status:
            qs = qs.filter(status=order_status)

        date_from = request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        order_number = request.query_params.get('order_number')
        if order_number:
            qs = qs.filter(order_number__icontains=order_number)

        qs = qs.order_by('-created_at')

        # Laravel-style pagination
        page = int(request.query_params.get('page', 1))
        paginator = LaravelStylePagination(qs, page, per_page=10)

        return Response({'orders': paginator.get_response_data(OrderSerializer)})


class AdminOrderDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        try:
            order = Order.objects.select_related('user').prefetch_related(
                'items__product_variation__product',
                'items__product_variation__images',
                'items__product_variation__attributes',
                'items__product_variation__attributes__attribute_value',
            ).get(pk=pk)
        except Order.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'order': OrderSerializer(order).data})

    def put(self, request, pk):
        """Admin: Update order shipping/payment info."""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            update_fields = {}
            for field in ['shipping_address', 'shipping_phone', 'shipping_name',
                         'payment_method', 'payment_status', 'notes']:
                val = request.data.get(field)
                if val is not None and val != '':
                    update_fields[field] = val

            for k, v in update_fields.items():
                setattr(order, k, v)
            order.save()

            return Response({
                'message': 'Cập nhật đơn hàng thành công',
                'order': OrderBriefSerializer(order).data,
            })
        except Exception as e:
            return Response(
                {'message': 'Lỗi khi cập nhật đơn hàng', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, pk):
        """Admin: Delete order, restore inventory if not delivered."""
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            try:
                if order.status != 'delivered':
                    for item in order.items.select_related('product_variation'):
                        ProductVariation.objects.filter(id=item.product_variation_id).update(
                            stock_quantity=F('stock_quantity') + item.quantity
                        )

                OrderItem.objects.filter(order=order).delete()
                order.delete()
                return Response({'message': 'Đơn hàng đã được xóa thành công'})
            except Exception as e:
                return Response(
                    {'message': 'Lỗi khi xóa đơn hàng', 'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )


class AdminOrderStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        """Admin: Change order status with validation."""
        new_status = request.data.get('status')
        if not new_status:
            return Response(
                {'status': ['The status field is required.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        valid_transitions = VALID_STATUS_TRANSITIONS.get(order.status, [])
        if new_status not in valid_transitions:
            from_text = STATUS_TRANSLATIONS.get(order.status, order.status)
            to_text = STATUS_TRANSLATIONS.get(new_status, new_status)
            return Response(
                {'message': f'Không thể chuyển trạng thái từ {from_text} sang {to_text}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                update_data = {'status': new_status}

                notes = request.data.get('notes')
                if notes:
                    update_data['notes'] = notes

                if new_status == 'cancelled' and order.payment_status == 'paid':
                    update_data['payment_status'] = 'refunded'

                # Restore stock on cancellation
                if new_status == 'cancelled' and order.status != 'cancelled':
                    for item in order.items.select_related('product_variation'):
                        ProductVariation.objects.filter(id=item.product_variation_id).update(
                            stock_quantity=F('stock_quantity') + item.quantity
                        )

                for k, v in update_data.items():
                    setattr(order, k, v)
                order.save()

                return Response({
                    'message': 'Cập nhật trạng thái đơn hàng thành công',
                    'order': OrderBriefSerializer(order).data,
                })
            except Exception as e:
                return Response(
                    {'message': 'Lỗi khi cập nhật trạng thái đơn hàng', 'error': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
