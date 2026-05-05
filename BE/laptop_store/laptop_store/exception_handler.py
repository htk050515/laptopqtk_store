from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied, AuthenticationFailed


def custom_exception_handler(exc, context):
    """Custom exception handler matching Laravel's JSON error format."""
    response = exception_handler(exc, context)

    if isinstance(exc, ValidationError):
        return Response(
            {'message': 'Validation Error', 'errors': exc.detail},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    if isinstance(exc, Http404) or isinstance(exc, NotFound):
        msg = str(exc) if str(exc) else 'Not found'
        return Response(
            {'message': msg, 'error': 'Not found'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, PermissionDenied):
        return Response(
            {'message': str(exc) or 'Unauthorized. Admin access required.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, AuthenticationFailed):
        return Response(
            {'message': 'Unauthenticated.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if response is not None:
        return response

    return None
