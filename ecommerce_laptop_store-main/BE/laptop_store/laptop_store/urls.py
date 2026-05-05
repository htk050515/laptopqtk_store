from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.cart.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.dashboard.urls')),
    path('api/', include('apps.recommendations.urls')),
    path('api/', include('apps.chatbot.urls')),
]

# Serve media files (Laravel storage) in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
