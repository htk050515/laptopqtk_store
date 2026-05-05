from django.db import models
from apps.accounts.models import User
from apps.catalog.models import Product


class UserProductInteraction(models.Model):
    """Tracks user behavior for collaborative filtering."""
    INTERACTION_TYPES = [
        ('view', 'View'),
        ('cart', 'Add to Cart'),
        ('purchase', 'Purchase'),
        ('review', 'Review'),
    ]
    INTERACTION_WEIGHTS = {
        'view': 1,
        'cart': 3,
        'purchase': 5,
        'review': 4,
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='interactions')
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_TYPES)
    weight = models.FloatField(default=1.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = True
        db_table = 'user_product_interactions'
        indexes = [
            models.Index(fields=['user', 'product']),
            models.Index(fields=['product', 'interaction_type']),
        ]


class ProductSimilarity(models.Model):
    """Pre-computed cosine similarity between product pairs."""
    product_a = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='similarities_as_a')
    product_b = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='similarities_as_b')
    score = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'product_similarities'
        unique_together = ('product_a', 'product_b')
        indexes = [
            models.Index(fields=['product_a', '-score']),
        ]


class UserRecommendation(models.Model):
    """Cached personalized recommendations per user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    score = models.FloatField()
    reason = models.CharField(max_length=50, default='hybrid')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'user_recommendations'
        unique_together = ('user', 'product')
        indexes = [
            models.Index(fields=['user', '-score']),
        ]
