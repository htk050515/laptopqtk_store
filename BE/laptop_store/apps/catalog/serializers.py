from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, ProductVariation,
    AttributeType, AttributeValue, VariationAttribute, VariationImage,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'created_at', 'updated_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product_id', 'image_path', 'is_primary', 'created_at', 'updated_at']


class AttributeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeType
        fields = ['id', 'name', 'display_name', 'created_at', 'updated_at']


class AttributeValueSerializer(serializers.ModelSerializer):
    attribute_type = AttributeTypeSerializer(read_only=True)

    class Meta:
        model = AttributeValue
        fields = ['id', 'attribute_type_id', 'value', 'display_value',
                  'created_at', 'updated_at', 'attribute_type']


class AttributeValueBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ['id', 'attribute_type_id', 'value', 'display_value',
                  'created_at', 'updated_at']


class VariationAttributeSerializer(serializers.ModelSerializer):
    attribute_value = AttributeValueSerializer(read_only=True)

    class Meta:
        model = VariationAttribute
        fields = ['id', 'product_variation_id', 'attribute_value_id',
                  'created_at', 'updated_at', 'attribute_value']


class VariationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VariationImage
        fields = ['id', 'product_variation_id', 'image_path', 'is_primary',
                  'created_at', 'updated_at']


class ProductVariationSerializer(serializers.ModelSerializer):
    attributes = VariationAttributeSerializer(many=True, read_only=True)
    images = VariationImageSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariation
        fields = ['id', 'product_id', 'sku', 'price', 'discount_price',
                  'stock_quantity', 'is_default', 'status',
                  'created_at', 'updated_at', 'attributes', 'images']


class ProductBriefSerializer(serializers.ModelSerializer):
    """Minimal product info for nested contexts (cart, orders)."""
    class Meta:
        model = Product
        fields = ['id', 'category_id', 'name', 'slug', 'description',
                  'base_price', 'featured', 'status',
                  'created_at', 'updated_at']


class ProductVariationWithProductSerializer(serializers.ModelSerializer):
    """Variation with nested product (for cart/order responses)."""
    attributes = VariationAttributeSerializer(many=True, read_only=True)
    images = VariationImageSerializer(many=True, read_only=True)
    product = ProductBriefSerializer(read_only=True)

    class Meta:
        model = ProductVariation
        fields = ['id', 'product_id', 'sku', 'price', 'discount_price',
                  'stock_quantity', 'is_default', 'status',
                  'created_at', 'updated_at', 'attributes', 'images', 'product']


class ProductSerializer(serializers.ModelSerializer):
    """Full product serializer matching Laravel's eager-loaded response.

    Laravel model: categories() is belongsTo(Category) but named as plural.
    JSON output uses key 'categories' which is actually a single category object.
    """
    categories = CategorySerializer(source='category', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variations = ProductVariationSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'category_id', 'name', 'slug', 'description',
                  'base_price', 'featured', 'status',
                  'created_at', 'updated_at',
                  'categories', 'images', 'variations']


class AttributeTypeWithValuesSerializer(serializers.ModelSerializer):
    attribute_values = AttributeValueBriefSerializer(many=True, read_only=True)

    class Meta:
        model = AttributeType
        fields = ['id', 'name', 'display_name', 'created_at', 'updated_at',
                  'attribute_values']
