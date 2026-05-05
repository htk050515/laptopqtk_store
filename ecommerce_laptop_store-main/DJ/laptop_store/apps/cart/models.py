from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.catalog.models import ProductVariation


class CartItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    product_variation = models.ForeignKey(
        ProductVariation, on_delete=models.CASCADE,
        db_column='product_variation_id'
    )
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'cart_items'

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)
