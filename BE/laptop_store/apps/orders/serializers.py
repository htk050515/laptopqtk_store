from rest_framework import serializers
from .models import Order, OrderItem, Invoice
from apps.accounts.serializers import UserSerializer
from apps.catalog.serializers import ProductVariationWithProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    variation = ProductVariationWithProductSerializer(source='product_variation', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order_id', 'product_id', 'product_variation_id',
                  'quantity', 'price', 'discount_price', 'attributes_snapshot',
                  'created_at', 'updated_at', 'variation']


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'order_id', 'invoice_number', 'amount', 'status',
                  'payment_date', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    invoice = InvoiceSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user_id', 'order_number', 'status', 'total_amount',
                  'shipping_address', 'shipping_phone', 'shipping_name',
                  'payment_method', 'payment_status', 'notes', 'shipping_fee',
                  'created_at', 'updated_at', 'items', 'user', 'invoice']


class OrderBriefSerializer(serializers.ModelSerializer):
    """Order without nested relations, for simple responses."""
    class Meta:
        model = Order
        fields = ['id', 'user_id', 'order_number', 'status', 'total_amount',
                  'shipping_address', 'shipping_phone', 'shipping_name',
                  'payment_method', 'payment_status', 'notes', 'shipping_fee',
                  'created_at', 'updated_at']


class LaravelStylePagination:
    """Pagination matching Laravel's paginate() JSON format."""

    def __init__(self, queryset, page, per_page=10):
        self.total = queryset.count()
        self.per_page = per_page
        self.current_page = page
        self.last_page = max(1, -(-self.total // per_page))  # ceil division

        start = (page - 1) * per_page
        end = start + per_page
        self.data = queryset[start:end]

    def get_response_data(self, serializer_class, **kwargs):
        serialized = serializer_class(self.data, many=True, **kwargs).data
        return {
            'current_page': self.current_page,
            'data': serialized,
            'first_page_url': f'?page=1',
            'from': ((self.current_page - 1) * self.per_page) + 1 if self.total > 0 else None,
            'last_page': self.last_page,
            'last_page_url': f'?page={self.last_page}',
            'next_page_url': f'?page={self.current_page + 1}' if self.current_page < self.last_page else None,
            'per_page': self.per_page,
            'prev_page_url': f'?page={self.current_page - 1}' if self.current_page > 1 else None,
            'to': min(self.current_page * self.per_page, self.total) if self.total > 0 else None,
            'total': self.total,
        }
