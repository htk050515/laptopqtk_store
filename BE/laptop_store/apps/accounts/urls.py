from django.urls import path
from . import views

urlpatterns = [
    # Public auth
    path('auth/register', views.RegisterView.as_view()),
    path('auth/login', views.LoginView.as_view()),
    # Protected auth
    path('auth/me', views.MeView.as_view()),
    path('auth/logout', views.LogoutView.as_view()),
    path('auth/change-password', views.ChangePasswordView.as_view()),
    # User profile
    path('user/profile', views.UpdateProfileView.as_view()),
    # Admin user management
    path('admin/users', views.AdminUserView.as_view()),
    path('admin/users/search', views.AdminUserSearchView.as_view()),
    path('admin/users/<int:pk>', views.AdminUserDetailView.as_view()),
]
