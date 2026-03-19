from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, AuthToken
from apps.accounts.hashers import LaravelBcryptHasher
from apps.catalog.models import (
    Category, Product, ProductImage, ProductVariation,
    AttributeType, AttributeValue, VariationAttribute,
)

hasher = LaravelBcryptHasher()


class CatalogTestCase(TestCase):
    databases = '__all__'

    def setUp(self):
        self.client = APIClient()

        # Create admin user
        self.admin = User(
            name='Admin', email='admin@test.com',
            password=hasher.encode('admin123'),
            role='admin', status=True,
        )
        self.admin.save()
        self.admin_token = AuthToken.create_token(self.admin)

        # Create category
        self.category = Category(name='Phones', slug='phones', description='Phone category')
        self.category.save()

        # Create product
        self.product = Product(
            name='iPhone 15', slug='iphone-15',
            category=self.category, base_price=25000000,
            status=True, featured=True,
        )
        self.product.save()

        # Create variation
        self.variation = ProductVariation(
            product=self.product, sku='IP15-128',
            price=25000000, stock_quantity=10,
            is_default=True, status=True,
        )
        self.variation.save()

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token.token}')

    def test_product_list(self):
        resp = self.client.get('/api/products')
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.json(), list)
        self.assertEqual(len(resp.json()), 1)
        # Check 'categories' key exists (Laravel compatibility)
        product = resp.json()[0]
        self.assertIn('categories', product)
        self.assertEqual(product['categories']['name'], 'Phones')

    def test_product_detail(self):
        resp = self.client.get(f'/api/products/{self.product.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'iPhone 15')

    def test_product_not_found(self):
        resp = self.client.get('/api/products/99999')
        self.assertEqual(resp.status_code, 404)

    def test_product_search(self):
        resp = self.client.get('/api/products/search?name=iPhone')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)

    def test_products_by_category(self):
        resp = self.client.get(f'/api/products/category/{self.category.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()), 1)

    def test_products_by_category_slug(self):
        resp = self.client.get(f'/api/products/category/slug/phones')
        self.assertEqual(resp.status_code, 200)

    def test_category_list(self):
        resp = self.client.get('/api/categories')
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.json(), list)

    def test_category_detail(self):
        resp = self.client.get(f'/api/categories/{self.category.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Phones')

    def test_admin_create_category(self):
        self._auth()
        resp = self.client.post('/api/admin/categories', {
            'name': 'Laptops',
            'description': 'Laptop category',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['category']['name'], 'Laptops')

    def test_admin_delete_product(self):
        self._auth()
        resp = self.client.delete(f'/api/admin/products/{self.product.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Product.objects.filter(id=self.product.id).exists())
