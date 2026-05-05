from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, AuthToken
from apps.accounts.hashers import LaravelBcryptHasher
from apps.catalog.models import Category, Product, ProductVariation
from apps.cart.models import CartItem

hasher = LaravelBcryptHasher()


class CartTestCase(TestCase):
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

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token.token}')

    def test_add_to_cart(self):
        self._auth()
        resp = self.client.post('/api/cart', {
            'product_variation_id': self.variation.id,
            'quantity': 2,
        })
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(CartItem.objects.filter(user=self.user).count(), 1)

    def test_get_cart(self):
        self._auth()
        CartItem(user=self.user, product_variation=self.variation, quantity=3).save()
        resp = self.client.get('/api/cart')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)

    def test_clear_cart(self):
        self._auth()
        CartItem(user=self.user, product_variation=self.variation, quantity=1).save()
        resp = self.client.delete('/api/cart')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(CartItem.objects.filter(user=self.user).count(), 0)
