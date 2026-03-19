from django.urls import path
from . import views

urlpatterns = [
    path('chatbot/message', views.ChatMessageView.as_view()),
]
