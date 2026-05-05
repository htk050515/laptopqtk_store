from rest_framework import serializers
from .models import CartItem
from apps.catalog.serializers import ProductVariationWithProductSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_variation = ProductVariationWithProductSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'user_id', 'product_variation_id', 'quantity',
                  'created_at', 'updated_at', 'product_variation']
