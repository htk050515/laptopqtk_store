from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from apps.accounts.models import User, AuthToken
from apps.accounts.hashers import LaravelBcryptHasher


hasher = LaravelBcryptHasher()


class AuthTestCase(TestCase):
    databases = '__all__'

    def setUp(self):
        self.client = APIClient()
        self.user = User(
            name='Test User',
            email='test@example.com',
            password=hasher.encode('password123'),
            role='customer',
            status=True,
        )
        self.user.save()

    def test_register(self):
        resp = self.client.post('/api/auth/register', {
            'name': 'New User',
            'email': 'new@example.com',
            'password': 'password123',
            'password_confirmation': 'password123',
        })
        self.assertEqual(resp.status_code, 201)
        self.assertIn('access_token', resp.json())
        self.assertEqual(resp.json()['token_type'], 'Bearer')

    def test_login(self):
        resp = self.client.post('/api/auth/login', {
            'email': 'test@example.com',
            'password': 'password123',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access_token', resp.json())

    def test_login_wrong_password(self):
        resp = self.client.post('/api/auth/login', {
            'email': 'test@example.com',
            'password': 'wrongpassword',
        })
        self.assertEqual(resp.status_code, 401)

    def test_me(self):
        token = AuthToken.create_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.token}')
        resp = self.client.get('/api/auth/me')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['user']['email'], 'test@example.com')

    def test_logout(self):
        token = AuthToken.create_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.token}')
        resp = self.client.post('/api/auth/logout')
        self.assertEqual(resp.status_code, 200)
        # Token should be deleted
        self.assertFalse(AuthToken.objects.filter(token=token.token).exists())

    def test_change_password(self):
        token = AuthToken.create_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.token}')
        resp = self.client.post('/api/auth/change-password', {
            'current_password': 'password123',
            'new_password': 'newpassword123',
            'new_password_confirmation': 'newpassword123',
        })
        self.assertEqual(resp.status_code, 200)

    def test_unauthenticated_me(self):
        resp = self.client.get('/api/auth/me')
        self.assertEqual(resp.status_code, 401)


class LaravelBcryptHasherTestCase(TestCase):
    def test_encode_and_verify(self):
        password = 'testpassword'
        hashed = hasher.encode(password)
        self.assertTrue(hasher.verify(password, hashed))

    def test_verify_laravel_hash(self):
        """Test that $2y$ Laravel hashes can be verified."""
        import bcrypt
        password = 'testpassword'
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
        # Simulate Laravel's $2y$ prefix
        laravel_hash = '$2y$' + hashed[4:]
        self.assertTrue(hasher.verify(password, laravel_hash))
