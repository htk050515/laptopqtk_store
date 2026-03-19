from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    message = 'Unauthorized. Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin()
        )
