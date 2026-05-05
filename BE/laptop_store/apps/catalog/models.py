from django.db import models
from django.utils import timezone


class TimestampMixin:
    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)


class Category(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    image = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'categories'


class Product(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='category_id')
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    base_price = models.DecimalField(max_digits=12, decimal_places=2)
    featured = models.BooleanField(default=False)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'products'


class ProductImage(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_path = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'product_images'


class ProductVariation(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variations')
    sku = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock_quantity = models.IntegerField(default=0)
    is_default = models.BooleanField(default=False)
    status = models.BooleanField(default=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'product_variations'


class AttributeType(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    display_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'attribute_types'


class AttributeValue(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    attribute_type = models.ForeignKey(
        AttributeType, on_delete=models.CASCADE,
        related_name='attribute_values', db_column='attribute_type_id'
    )
    value = models.CharField(max_length=255)
    display_value = models.CharField(max_length=255)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'attribute_values'


class VariationAttribute(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    product_variation = models.ForeignKey(
        ProductVariation, on_delete=models.CASCADE,
        related_name='attributes', db_column='product_variation_id'
    )
    attribute_value = models.ForeignKey(
        AttributeValue, on_delete=models.CASCADE,
        db_column='attribute_value_id'
    )
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'variation_attributes'


class VariationImage(TimestampMixin, models.Model):
    id = models.BigAutoField(primary_key=True)
    product_variation = models.ForeignKey(
        ProductVariation, on_delete=models.CASCADE,
        related_name='images', db_column='product_variation_id'
    )
    image_path = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'variation_images'
