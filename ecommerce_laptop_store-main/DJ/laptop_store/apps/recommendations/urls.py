from django.urls import path
from . import views

urlpatterns = [
    path('recommendations', views.PersonalizedRecommendationsView.as_view()),
    path('recommendations/similar/<int:pk>', views.SimilarProductsView.as_view()),
    path('recommendations/popular', views.PopularProductsView.as_view()),
    path('recommendations/track', views.TrackInteractionView.as_view()),
]
