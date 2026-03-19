import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'laptop_store.settings')

app = Celery('laptop_store')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(['apps.recommendations'])

# Periodic task schedule
app.conf.beat_schedule = {
    'recompute-similarities-nightly': {
        'task': 'apps.recommendations.tasks.recompute_product_similarities',
        'schedule': crontab(hour=2, minute=0),  # 2:00 AM daily
    },
    'refresh-recommendations-hourly': {
        'task': 'apps.recommendations.tasks.refresh_user_recommendations',
        'schedule': crontab(minute=0),  # Every hour
    },
}
