import logging
from apps.accounts.models import User
from .engine import compute_all_product_similarities, compute_user_recommendations
from .models import UserProductInteraction

logger = logging.getLogger(__name__)

try:
    from celery_app import app

    @app.task
    def recompute_product_similarities():
        """Nightly job: recompute all product similarity scores."""
        logger.info("Starting product similarity computation...")
        compute_all_product_similarities()
        logger.info("Product similarity computation complete.")

    @app.task
    def refresh_user_recommendations():
        """Hourly job: refresh recommendations for active users."""
        # Only recompute for users who have recent interactions
        active_user_ids = UserProductInteraction.objects.values_list(
            'user_id', flat=True
        ).distinct()

        for user_id in active_user_ids:
            try:
                compute_user_recommendations(user_id)
            except Exception as e:
                logger.error(f"Error computing recommendations for user {user_id}: {e}")

        logger.info(f"Refreshed recommendations for {len(active_user_ids)} users")

    @app.task
    def track_interaction_async(user_id, product_id, interaction_type):
        """Record interaction asynchronously."""
        weight = UserProductInteraction.INTERACTION_WEIGHTS.get(interaction_type, 1)
        UserProductInteraction.objects.create(
            user_id=user_id,
            product_id=product_id,
            interaction_type=interaction_type,
            weight=weight,
        )

except ImportError:
    logger.warning("Celery not configured. Background tasks disabled.")
