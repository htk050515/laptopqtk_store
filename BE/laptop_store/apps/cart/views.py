from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import CartItem
from .serializers import CartItemSerializer
from apps.catalog.models import ProductVariation


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's cart items with product relations."""
        items = CartItem.objects.filter(user=request.user).select_related(
            'product_variation__product',
        ).prefetch_related(
            'product_variation__images',
        )
        return Response(CartItemSerializer(items, many=True).data)

    def post(self, request):
        """Add item to cart or increment quantity."""
        pv_id = request.data.get('product_variation_id')
        quantity = request.data.get('quantity')

        errors = {}
        if not pv_id:
            errors['product_variation_id'] = ['The product variation id field is required.']
        elif not ProductVariation.objects.filter(id=pv_id).exists():
            errors['product_variation_id'] = ['The selected product variation id is invalid.']
        if not quantity or int(quantity) < 1:
            errors['quantity'] = ['The quantity field is required and must be at least 1.']
        if errors:
            return Response(errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        quantity = int(quantity)
        cart_item = CartItem.objects.filter(
            user=request.user, product_variation_id=pv_id
        ).first()

        if cart_item:
            cart_item.quantity += quantity
            cart_item.save()
        else:
            cart_item = CartItem(
                user=request.user,
                product_variation_id=int(pv_id),
                quantity=quantity,
            )
            cart_item.save()

        return Response({
            'message': 'Sản phẩm đã được thêm vào giỏ hàng',
            'cartItem': CartItemSerializer(cart_item).data,
        })

    def delete(self, request):
        """Clear all user's cart items."""
        CartItem.objects.filter(user=request.user).delete()
        return Response({'message': 'Đã xóa toàn bộ giỏ hàng'})


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_cart_item(self, request, pk):
        try:
            item = CartItem.objects.get(pk=pk)
        except CartItem.DoesNotExist:
            return None, Response({'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        # Ownership check
        if item.user_id != request.user.id:
            return None, Response({'message': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        return item, None

    def put(self, request, pk):
        """Update cart item quantity."""
        item, error = self._get_cart_item(request, pk)
        if error:
            return error

        quantity = request.data.get('quantity')
        if quantity is None:
            return Response(
                {'quantity': ['The quantity field is required.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        quantity = int(quantity)
        if quantity == 0:
            item.delete()
            return Response({'message': 'Sản phẩm đã được xóa khỏi giỏ hàng'})

        item.quantity = quantity
        item.save()

        return Response({
            'message': 'Cập nhật số lượng thành công',
            'cartItem': CartItemSerializer(item).data,
        })

    def delete(self, request, pk):
        """Remove cart item."""
        item, error = self._get_cart_item(request, pk)
        if error:
            return error

        item.delete()
        return Response({'message': 'Xóa sản phẩm khỏi giỏ hàng thành công'})
