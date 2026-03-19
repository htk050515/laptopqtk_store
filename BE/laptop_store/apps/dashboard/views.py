from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsAdmin
from apps.accounts.models import User
from apps.catalog.models import Product, ProductVariation
from apps.orders.models import Order, Invoice


class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        now = timezone.now()

        # Orders
        total_orders = Order.objects.count()
        completed_orders = Order.objects.filter(status='completed').count()
        canceled_orders = Order.objects.filter(status='canceled').count()

        # Revenue from paid invoices
        total_revenue = Invoice.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0

        monthly_revenue = Invoice.objects.filter(
            status='paid',
            payment_date__month=now.month,
            payment_date__year=now.year,
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Weekly revenue
        start_of_week = now - timezone.timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_week = start_of_week + timezone.timedelta(days=6, hours=23, minutes=59, seconds=59)
        weekly_revenue = Invoice.objects.filter(
            status='paid',
            payment_date__range=(start_of_week, end_of_week),
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Invoices
        total_invoices = Invoice.objects.count()
        total_paid_invoices = Invoice.objects.filter(status='paid').aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Products
        total_products = Product.objects.count()
        active_products = Product.objects.filter(status=True).count()

        # Variants
        total_variants = ProductVariation.objects.count()
        total_stock = ProductVariation.objects.aggregate(total=Sum('stock_quantity'))['total'] or 0
        out_of_stock = ProductVariation.objects.filter(stock_quantity=0).count()
        in_stock = ProductVariation.objects.filter(stock_quantity__gt=0).count()
        discounted_products = ProductVariation.objects.filter(discount_price__isnull=False).count()

        # Users
        total_users = User.objects.count()

        return Response({
            'orders': {
                'total': total_orders,
                'completed': completed_orders,
                'canceled': canceled_orders,
            },
            'revenue': {
                'total': total_revenue,
                'monthly': monthly_revenue,
                'weekly': weekly_revenue,
            },
            'invoices': {
                'total': total_invoices,
                'total_paid': total_paid_invoices,
            },
            'products': {
                'total': total_products,
                'active': active_products,
            },
            'variants': {
                'total': total_variants,
                'stock_quantity': total_stock,
                'out_of_stock': out_of_stock,
                'in_stock': in_stock,
                'discounted': discounted_products,
            },
            'users': {
                'total': total_users,
            },
        })
