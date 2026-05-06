from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.catalog.views import AISearchView, AIGenerateDescriptionView
from apps.chatbot.views import ChatbotMessageView

urlpatterns = [
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.cart.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.dashboard.urls')),
    path('api/', include('apps.recommendations.urls')),
    # chatbot — đăng ký trực tiếp, KHÔNG include apps.chatbot.urls nữa
    path('api/chatbot/message', ChatbotMessageView.as_view()),
    path('api/products/ai-search', AISearchView.as_view()),
    path('api/admin/product/ai-description', AIGenerateDescriptionView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)