import bcrypt
from django.contrib.auth.hashers import BasePasswordHasher


class LaravelBcryptHasher(BasePasswordHasher):
    """
    Password hasher compatible with Laravel's bcrypt ($2y$) hashes.
    Converts $2y$ to $2b$ for Python bcrypt compatibility.
    """
    algorithm = 'laravel_bcrypt'

    def salt(self):
        return bcrypt.gensalt(rounds=12)

    def encode(self, password, salt=None):
        if salt is None:
            salt = self.salt()
        if isinstance(password, str):
            password = password.encode('utf-8')
        if isinstance(salt, str):
            salt = salt.encode('utf-8')
        hashed = bcrypt.hashpw(password, salt)
        if isinstance(hashed, bytes):
            hashed = hashed.decode('utf-8')
        return hashed

    def verify(self, password, encoded):
        if isinstance(password, str):
            password = password.encode('utf-8')
        if isinstance(encoded, str):
            # Convert Laravel's $2y$ to Python-compatible $2b$
            if encoded.startswith('$2y$'):
                encoded = '$2b$' + encoded[4:]
            encoded = encoded.encode('utf-8')
        try:
            return bcrypt.checkpw(password, encoded)
        except (ValueError, TypeError):
            return False

    def safe_summary(self, encoded):
        return {
            'algorithm': self.algorithm,
            'hash': encoded[:20] + '...',
        }

    def must_update(self, encoded):
        return False

    def harden_runtime(self, password, encoded):
        pass
