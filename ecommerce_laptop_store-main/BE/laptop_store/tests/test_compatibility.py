"""
Contract tests to verify Django API responses match Laravel format.
These tests verify the JSON structure (keys, nesting) matches what
the React frontend expects.
"""
from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, AuthToken
from apps.accounts.hashers import LaravelBcryptHasher
from apps.catalog.models import Category, Product, ProductVariation

hasher = LaravelBcryptHasher()


class ResponseFormatTestCase(TestCase):
    """Test that response JSON matches Laravel format exactly."""
    databases = '__all__'

    def setUp(self):
        self.client = APIClient()
        self.user = User(
            name='Test', email='test@test.com',
            password=hasher.encode('pass123'),
            role='customer', status=True,
        )
        self.user.save()

        self.category = Category(name='Phones', slug='phones')
        self.category.save()
        self.product = Product(
            name='iPhone', slug='iphone', category=self.category,
            base_price=25000000, status=True,
        )
        self.product.save()
        self.variation = ProductVariation(
            product=self.product, sku='IP-001',
            price=25000000, stock_quantity=10,
            is_default=True, status=True,
        )
        self.variation.save()

    def test_login_response_format(self):
        """Login must return {access_token, token_type, user}."""
        resp = self.client.post('/api/auth/login', {
            'email': 'test@test.com', 'password': 'pass123',
        })
        data = resp.json()
        self.assertIn('access_token', data)
        self.assertIn('token_type', data)
        self.assertEqual(data['token_type'], 'Bearer')
        self.assertIn('user', data)
        user = data['user']
        self.assertIn('id', user)
        self.assertIn('name', user)
        self.assertIn('email', user)
        self.assertIn('role', user)

    def test_product_list_format(self):
        """Product list must include 'categories' (singular category as object)."""
        resp = self.client.get('/api/products')
        products = resp.json()
        self.assertIsInstance(products, list)
        p = products[0]
        # Must have 'categories' key (not 'category')
        self.assertIn('categories', p)
        self.assertIsInstance(p['categories'], dict)
        # Must have nested 'variations' and 'images'
        self.assertIn('variations', p)
        self.assertIn('images', p)

    def test_me_response_format(self):
        """GET /auth/me must return {user: {...}}."""
        token = AuthToken.create_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.token}')
        resp = self.client.get('/api/auth/me')
        data = resp.json()
        self.assertIn('user', data)
        self.assertIsInstance(data['user'], dict)

    def test_cart_response_format(self):
        """GET /cart must return array of cart items."""
        token = AuthToken.create_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.token}')
        resp = self.client.get('/api/cart')
        self.assertIsInstance(resp.json(), list)

    def test_orders_response_format(self):
        """GET /orders must return {orders: [...]}."""
        token = AuthToken.create_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.token}')
        resp = self.client.get('/api/orders')
        data = resp.json()
        self.assertIn('orders', data)
        self.assertIsInstance(data['orders'], list)

    def test_category_list_format(self):
        """GET /categories must return array of categories."""
        resp = self.client.get('/api/categories')
        self.assertIsInstance(resp.json(), list)

    def test_attribute_types_format(self):
        """GET /attribute-types must return {data: [...]}."""
        resp = self.client.get('/api/attribute-types')
        data = resp.json()
        self.assertIn('data', data)
        self.assertIsInstance(data['data'], list)

    def test_reviews_by_product_format(self):
        """GET /products/{id}/reviews must return {reviews: [...]}."""
        resp = self.client.get(f'/api/products/{self.product.id}/reviews')
        data = resp.json()
        self.assertIn('reviews', data)
        self.assertIsInstance(data['reviews'], list)
