from django.test import TestCase
from rest_framework.test import APIClient
from apps.accounts.models import User, AuthToken
from apps.accounts.hashers import LaravelBcryptHasher
from apps.catalog.models import Category, Product, ProductVariation
from apps.reviews.models import Review

hasher = LaravelBcryptHasher()


class ReviewTestCase(TestCase):
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

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token.token}')

    def test_create_review(self):
        self._auth()
        resp = self.client.post('/api/reviews', {
            'product_id': self.product.id,
            'rating': 5,
            'comment': 'Great product!',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['review']['rating'], 5)

    def test_get_product_reviews(self):
        review = Review(user=self.user, product=self.product, rating=4, comment='Good')
        review.save()
        resp = self.client.get(f'/api/products/{self.product.id}/reviews')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['reviews']), 1)

    def test_update_review(self):
        self._auth()
        review = Review(user=self.user, product=self.product, rating=3)
        review.save()
        resp = self.client.put(f'/api/reviews/{review.id}', {
            'rating': 5,
            'comment': 'Updated!',
        })
        self.assertEqual(resp.status_code, 200)

    def test_delete_review(self):
        self._auth()
        review = Review(user=self.user, product=self.product, rating=3)
        review.save()
        resp = self.client.delete(f'/api/reviews/{review.id}')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Review.objects.filter(id=review.id).exists())
