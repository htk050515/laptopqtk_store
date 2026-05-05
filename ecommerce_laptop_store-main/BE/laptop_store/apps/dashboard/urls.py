from django.urls import path
from . import views

urlpatterns = [
    path('admin/dashboard', views.DashboardView.as_view()),
]
