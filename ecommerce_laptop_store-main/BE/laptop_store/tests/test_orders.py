from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, AuthToken
from apps.accounts.hashers import LaravelBcryptHasher
from apps.catalog.models import Category, Product, ProductVariation
from apps.cart.models import CartItem
from apps.orders.models import Order

hasher = LaravelBcryptHasher()


class OrderTestCase(TestCase):
    databases = '__all__'

    def setUp(self):
        self.client = APIClient()
        self.user = User(
            name='User', email='user@test.com',
            password=hasher.encode('pass123'),
            role='customer', status=True,
        )
        self.user.save()
        self.token = AuthToken.create_token(self.user)

        self.admin = User(
            name='Admin', email='admin@test.com',
            password=hasher.encode('admin123'),
            role='admin', status=True,
        )
        self.admin.save()
        self.admin_token = AuthToken.create_token(self.admin)

        self.category = Category(name='Test', slug='test')
        self.category.save()
        self.product = Product(
            name='Phone', slug='phone', category=self.category,
            base_price=10000000, status=True,
        )
        self.product.save()
        self.variation = ProductVariation(
            product=self.product, sku='PH-001',
            price=10000000, stock_quantity=50,
            is_default=True, status=True,
        )
        self.variation.save()

    def _auth_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token.token}')

    def _auth_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token.token}')

    def test_create_order(self):
        self._auth_user()
        cart_item = CartItem(user=self.user, product_variation=self.variation, quantity=2)
        cart_item.save()

        resp = self.client.post('/api/orders', {
            'cart_items': [cart_item.id],
            'shipping_address': '123 Test St',
            'shipping_phone': '0123456789',
            'shipping_name': 'Test User',
            'payment_method': 'cod',
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('order', resp.json())
        # Cart should be cleared
        self.assertEqual(CartItem.objects.filter(user=self.user).count(), 0)
        # Stock should be decremented
        self.variation.refresh_from_db()
        self.assertEqual(self.variation.stock_quantity, 48)

    def test_get_user_orders(self):
        self._auth_user()
        resp = self.client.get('/api/orders')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('orders', resp.json())

    def test_admin_get_orders(self):
        self._auth_admin()
        resp = self.client.get('/api/admin/orders')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('orders', resp.json())
