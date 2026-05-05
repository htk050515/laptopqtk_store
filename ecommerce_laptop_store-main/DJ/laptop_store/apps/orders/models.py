from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.catalog.models import Product, ProductVariation


class Order(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    order_number = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_address = models.CharField(max_length=255)
    shipping_phone = models.CharField(max_length=20)
    shipping_name = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, default='pending')
    notes = models.TextField(null=True, blank=True)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'orders'

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', db_column='order_id')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='product_id')
    product_variation = models.ForeignKey(
        ProductVariation, on_delete=models.CASCADE,
        related_name='order_items', db_column='product_variation_id'
    )
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    attributes_snapshot = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'order_items'

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)


class Invoice(models.Model):
    id = models.BigAutoField(primary_key=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='invoice', db_column='order_id')
    invoice_number = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='unpaid')
    payment_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'invoices'

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)
