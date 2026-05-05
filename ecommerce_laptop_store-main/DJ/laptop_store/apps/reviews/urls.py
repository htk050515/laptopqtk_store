from django.urls import path
from . import views

urlpatterns = [
    # Public
    path('products/<int:pk>/reviews', views.ReviewsByProductView.as_view()),
    # Customer
    path('reviews', views.ReviewCreateView.as_view()),
    path('reviews/<int:pk>', views.ReviewUpdateDeleteView.as_view()),
    # Admin
    path('admin/reviews', views.AdminReviewListView.as_view()),
    path('admin/reviews/<int:pk>/status', views.AdminReviewStatusView.as_view()),
    path('admin/reviews/<int:pk>/reply', views.AdminReviewReplyView.as_view()),
    path('admin/reviews/replies/<int:pk>', views.AdminReplyDetailView.as_view()),
]
