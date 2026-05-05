from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q

from .models import User, AuthToken
from .permissions import IsAdmin
from .serializers import (
    UserSerializer, UserBriefSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, UpdateProfileSerializer,
    AdminCreateUserSerializer, AdminUpdateUserSerializer,
)
from .hashers import LaravelBcryptHasher


hasher = LaravelBcryptHasher()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        data = serializer.validated_data
        password_hash = hasher.encode(data['password'])

        user = User(
            name=data['name'],
            email=data['email'],
            password=password_hash,
            phone=data.get('phone'),
            address=data.get('address'),
            role='customer',
            status=True,
        )
        user.save()

        auth_token = AuthToken.create_token(user)

        return Response({
            'access_token': auth_token.token,
            'token_type': 'Bearer',
            'user': UserBriefSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        data = serializer.validated_data
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if not hasher.verify(data['password'], user.password):
            return Response({'message': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.status:
            return Response({'message': 'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)

        auth_token = AuthToken.create_token(user)

        return Response({
            'access_token': auth_token.token,
            'token_type': 'Bearer',
            'user': UserBriefSerializer(user).data,
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete the current token
        if request.auth:
            request.auth.delete()
        return Response({'message': 'Successfully logged out'})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'message': 'Dữ liệu không hợp lệ.',
                'errors': serializer.errors,
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        data = serializer.validated_data
        user = request.user

        if not hasher.verify(data['current_password'], user.password):
            return Response(
                {'message': 'Mật khẩu hiện tại không đúng.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.password = hasher.encode(data['new_password'])
        user.save()

        return Response({'message': 'Đổi mật khẩu thành công.'})


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UpdateProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        user = request.user
        data = serializer.validated_data

        if 'name' in data and data['name']:
            user.name = data['name']
        if 'phone' in data and data['phone']:
            user.phone = data['phone']
        if 'address' in data and data['address']:
            user.address = data['address']

        user.save()

        return Response({
            'message': 'Cập nhật thông tin thành công.',
            'user': UserSerializer(user).data,
        })


# ===== Admin Views =====

class AdminUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.filter(role='customer')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        data = serializer.validated_data
        password_hash = hasher.encode(data['password'])

        user = User(
            name=data['name'],
            email=data['email'],
            password=password_hash,
            phone=data.get('phone'),
            address=data.get('address'),
            role='customer',
        )
        user.save()

        return Response({
            'message': 'Thêm người dùng thành công.',
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUpdateUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        data = serializer.validated_data
        # Check email uniqueness if email is being changed
        if 'email' in data and data['email']:
            if User.objects.filter(email=data['email']).exclude(pk=pk).exists():
                return Response(
                    {'errors': {'email': ['The email has already been taken.']}},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )

        for field in ['name', 'email', 'phone', 'address']:
            if field in data and data[field] is not None:
                setattr(user, field, data[field])

        user.save()

        return Response({
            'message': 'Cập nhật người dùng thành công.',
            'user': UserSerializer(user).data,
        })

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({'message': 'Xóa người dùng thành công.'})


class AdminUserSearchView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        q = request.query_params.get('q', '')
        users = User.objects.filter(
            Q(name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)
        )
        return Response(UserSerializer(users, many=True).data)
