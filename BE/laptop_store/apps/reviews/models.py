from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.catalog.models import Product


class Review(models.Model):
    id         = models.BigAutoField(primary_key=True)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='product_id')
    rating     = models.IntegerField()
    comment    = models.TextField(null=True, blank=True)
    status     = models.CharField(max_length=20, default='pending')
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed  = False
        db_table = 'reviews'

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)


class ReviewReply(models.Model):
    id         = models.BigAutoField(primary_key=True)
    review     = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='replies', db_column='review_id')
    # DB dùng user_id (không phải admin_id) — map đúng tên cột thật
    admin      = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    # DB dùng comment (không phải content) — map đúng tên cột thật
    content    = models.TextField(db_column='comment')
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        managed  = False
        db_table = 'review_replies'

    def save(self, *args, **kwargs):
        now = timezone.now()
        if not self.created_at:
            self.created_at = now
        self.updated_at = now
        super().save(*args, **kwargs)