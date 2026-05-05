import logging
from collections import defaultdict

import numpy as np
from django.db.models import Sum, Count, Q, F

from apps.catalog.models import Product, ProductVariation, AttributeValue, VariationAttribute
from .models import UserProductInteraction, ProductSimilarity, UserRecommendation

logger = logging.getLogger(__name__)


def compute_product_feature_vector(product):
    """Build a feature vector for a product based on category, price range, and attributes."""
    features = {}

    # Category as a feature
    features[f'category_{product.category_id}'] = 1.0

    # Price range buckets (0-5M, 5-10M, 10-20M, 20M+)
    price = float(product.base_price)
    if price < 5_000_000:
        features['price_budget'] = 1.0
    elif price < 10_000_000:
        features['price_mid'] = 1.0
    elif price < 20_000_000:
        features['price_high'] = 1.0
    else:
        features['price_premium'] = 1.0

    # Attribute values from default variation
    default_variation = ProductVariation.objects.filter(
        product=product, is_default=True
    ).first()
    if default_variation:
        attrs = VariationAttribute.objects.filter(
            product_variation=default_variation
        ).select_related('attribute_value')
        for va in attrs:
            features[f'attr_{va.attribute_value_id}'] = 1.0

    return features


def cosine_similarity(vec_a, vec_b):
    """Compute cosine similarity between two sparse feature dicts."""
    common_keys = set(vec_a.keys()) & set(vec_b.keys())
    if not common_keys:
        return 0.0

    dot_product = sum(vec_a[k] * vec_b[k] for k in common_keys)
    mag_a = np.sqrt(sum(v ** 2 for v in vec_a.values()))
    mag_b = np.sqrt(sum(v ** 2 for v in vec_b.values()))

    if mag_a == 0 or mag_b == 0:
        return 0.0

    return dot_product / (mag_a * mag_b)


def compute_all_product_similarities():
    """Recompute content-based similarity scores between all product pairs."""
    products = list(Product.objects.filter(status=True))
    logger.info(f"Computing similarities for {len(products)} products")

    # Build feature vectors
    vectors = {}
    for product in products:
        vectors[product.id] = compute_product_feature_vector(product)

    # Compute pairwise similarities
    similarities = []
    product_ids = list(vectors.keys())

    for i, pid_a in enumerate(product_ids):
        for pid_b in product_ids[i + 1:]:
            score = cosine_similarity(vectors[pid_a], vectors[pid_b])
            if score > 0.1:  # Only store meaningful similarities
                similarities.append(
                    ProductSimilarity(product_a_id=pid_a, product_b_id=pid_b, score=score)
                )
                similarities.append(
                    ProductSimilarity(product_a_id=pid_b, product_b_id=pid_a, score=score)
                )

    # Bulk replace
    ProductSimilarity.objects.all().delete()
    ProductSimilarity.objects.bulk_create(similarities, batch_size=1000)
    logger.info(f"Stored {len(similarities)} similarity pairs")


def get_collaborative_scores(user_id, limit=20):
    """Collaborative filtering: find products liked by similar users."""
    # Get current user's interactions
    user_interactions = UserProductInteraction.objects.filter(
        user_id=user_id
    ).values('product_id').annotate(
        total_weight=Sum('weight')
    )

    if not user_interactions:
        return {}

    user_product_weights = {i['product_id']: i['total_weight'] for i in user_interactions}
    user_product_ids = set(user_product_weights.keys())

    # Find users who interacted with the same products
    similar_users = UserProductInteraction.objects.filter(
        product_id__in=user_product_ids
    ).exclude(user_id=user_id).values('user_id').annotate(
        overlap=Count('product_id', distinct=True)
    ).order_by('-overlap')[:50]

    similar_user_ids = [u['user_id'] for u in similar_users]

    if not similar_user_ids:
        return {}

    # Get products from similar users that current user hasn't seen
    candidate_interactions = UserProductInteraction.objects.filter(
        user_id__in=similar_user_ids
    ).exclude(
        product_id__in=user_product_ids
    ).values('product_id').annotate(
        total_weight=Sum('weight')
    ).order_by('-total_weight')[:limit]

    return {i['product_id']: float(i['total_weight']) for i in candidate_interactions}


def compute_user_recommendations(user_id):
    """Hybrid recommendation: 0.6 * collaborative + 0.4 * content-based."""
    # Collaborative scores
    collab_scores = get_collaborative_scores(user_id)

    # Content-based: find similar products to what user has interacted with
    user_products = UserProductInteraction.objects.filter(
        user_id=user_id
    ).values_list('product_id', flat=True).distinct()

    content_scores = defaultdict(float)
    if user_products:
        similarities = ProductSimilarity.objects.filter(
            product_a_id__in=user_products
        ).exclude(
            product_b_id__in=user_products
        ).values('product_b_id').annotate(
            avg_score=Sum('score')
        ).order_by('-avg_score')[:30]

        for sim in similarities:
            content_scores[sim['product_b_id']] = float(sim['avg_score'])

    # Hybrid merge
    all_products = set(collab_scores.keys()) | set(content_scores.keys())
    hybrid_scores = {}

    # Normalize scores
    max_collab = max(collab_scores.values()) if collab_scores else 1.0
    max_content = max(content_scores.values()) if content_scores else 1.0

    for pid in all_products:
        c_score = collab_scores.get(pid, 0) / max_collab if max_collab else 0
        ct_score = content_scores.get(pid, 0) / max_content if max_content else 0
        hybrid_scores[pid] = 0.6 * c_score + 0.4 * ct_score

    # Sort and cache top recommendations
    sorted_recs = sorted(hybrid_scores.items(), key=lambda x: -x[1])[:20]

    # Clear and store
    UserRecommendation.objects.filter(user_id=user_id).delete()
    recs = [
        UserRecommendation(
            user_id=user_id,
            product_id=pid,
            score=score,
            reason='hybrid',
        )
        for pid, score in sorted_recs
    ]
    UserRecommendation.objects.bulk_create(recs)

    return sorted_recs


def get_popular_products(limit=10):
    """Fallback for cold-start: return popular/trending products."""
    popular = UserProductInteraction.objects.values('product_id').annotate(
        total_weight=Sum('weight'),
        interaction_count=Count('id'),
    ).order_by('-total_weight')[:limit]

    product_ids = [p['product_id'] for p in popular]

    if not product_ids:
        # If no interactions at all, return featured products
        return list(Product.objects.filter(
            status=True, featured=True
        ).order_by('-updated_at')[:limit])

    return list(Product.objects.filter(id__in=product_ids, status=True))


def get_similar_products(product_id, limit=10):
    """Get similar products based on pre-computed similarities."""
    similar = ProductSimilarity.objects.filter(
        product_a_id=product_id
    ).order_by('-score')[:limit]

    product_ids = [s.product_b_id for s in similar]

    if not product_ids:
        # Fallback: same category products
        try:
            product = Product.objects.get(id=product_id)
            return list(Product.objects.filter(
                category_id=product.category_id, status=True
            ).exclude(id=product_id).order_by('-updated_at')[:limit])
        except Product.DoesNotExist:
            return []

    return list(Product.objects.filter(id__in=product_ids, status=True))
