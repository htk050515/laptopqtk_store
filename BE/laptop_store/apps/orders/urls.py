from django.urls import path
from . import views

urlpatterns = [
    # Customer order routes
    path('orders', views.CustomerOrderView.as_view()),
    path('orders/<int:pk>/cancel', views.CancelOrderView.as_view()),
    # Invoice routes
    path('invoices/<int:pk>', views.CreateInvoiceView.as_view()),
    path('invoices/pay/<int:pk>', views.PayWithVnpayView.as_view()),
    path('invoices/payment-status', views.PaymentStatusView.as_view()),
    # VNPay callback (public)
    path('vnpay-return', views.VnpayReturnView.as_view()),
    # Admin order routes
    path('admin/orders', views.AdminOrderListView.as_view()),
    path('admin/orders/search', views.AdminOrderSearchView.as_view()),
    path('admin/orders/<int:pk>', views.AdminOrderDetailView.as_view()),
    path('admin/orders/<int:pk>/status', views.AdminOrderStatusView.as_view()),
]
