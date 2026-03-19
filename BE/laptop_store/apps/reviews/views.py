from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.accounts.permissions import IsAdmin
from apps.catalog.models import Product
from .models import Review, ReviewReply
from .serializers import (
    ReviewSerializer, ReviewWithProductSerializer, ReviewReplySerializer,
)
from apps.orders.serializers import LaravelStylePagination


# ===== Customer Review Views =====

class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment')

        errors = {}
        if not product_id:
            errors['product_id'] = ['The product id field is required.']
        elif not Product.objects.filter(id=product_id).exists():
            errors['product_id'] = ['The selected product id is invalid.']
        if not rating:
            errors['rating'] = ['The rating field is required.']
        elif not (1 <= int(rating) <= 5):
            errors['rating'] = ['The rating must be between 1 and 5.']
        if errors:
            return Response(errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        review = Review(
            user=request.user,
            product_id=int(product_id),
            rating=int(rating),
            comment=comment,
        )
        review.save()

        return Response({
            'message': 'Đánh giá đã được thêm',
            'review': ReviewSerializer(review).data,
        }, status=status.HTTP_201_CREATED)


class ReviewUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'message': 'Đánh giá không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        if review.user_id != request.user.id:
            return Response(
                {'message': 'Bạn không có quyền chỉnh sửa đánh giá này'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if 'rating' in request.data:
            review.rating = int(request.data['rating'])
        if 'comment' in request.data:
            review.comment = request.data['comment']
        if 'status' in request.data:
            review.status = request.data['status']

        review.save()

        return Response({
            'message': 'Đánh giá đã được cập nhật',
            'review': ReviewSerializer(review).data,
        })

    def delete(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'message': 'Đánh giá không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        if review.user_id != request.user.id:
            return Response(
                {'message': 'Bạn không có quyền xóa đánh giá này'},
                status=status.HTTP_403_FORBIDDEN,
            )

        review.delete()
        return Response({'message': 'Đánh giá đã được xóa'})


class ReviewsByProductView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        reviews = Review.objects.filter(product_id=pk).select_related('user').prefetch_related(
            'replies'
        ).order_by('-created_at')
        return Response({'reviews': ReviewSerializer(reviews, many=True).data})


# ===== Admin Review Views =====

class AdminReviewListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        qs = Review.objects.select_related('user', 'product').prefetch_related('replies')

        review_status = request.query_params.get('status')
        if review_status:
            qs = qs.filter(status=review_status)

        product_id = request.query_params.get('product_id')
        if product_id:
            qs = qs.filter(product_id=product_id)

        qs = qs.order_by('-created_at')

        page = int(request.query_params.get('page', 1))
        paginator = LaravelStylePagination(qs, page, per_page=10)

        return Response({
            'reviews': paginator.get_response_data(ReviewWithProductSerializer),
        })


class AdminReviewStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'message': 'Đánh giá không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if not new_status or new_status not in ('pending', 'approved', 'rejected'):
            return Response(
                {'status': ['The status field is required and must be pending, approved, or rejected.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        review.status = new_status
        review.save()

        return Response({
            'message': 'Trạng thái đánh giá đã được cập nhật',
            'review': ReviewSerializer(review).data,
        })


class AdminReviewReplyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            review = Review.objects.get(pk=pk)
        except Review.DoesNotExist:
            return Response({'message': 'Đánh giá không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content')
        if not content:
            return Response(
                {'content': ['The content field is required.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        reply = ReviewReply(
            review=review,
            admin=request.user,
            content=content,
        )
        reply.save()

        # Load admin relation for response
        reply = ReviewReply.objects.select_related('admin').get(pk=reply.pk)

        return Response({
            'message': 'Đã trả lời đánh giá thành công',
            'reply': ReviewReplySerializer(reply).data,
        }, status=status.HTTP_201_CREATED)


class AdminReplyDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            reply = ReviewReply.objects.get(pk=pk)
        except ReviewReply.DoesNotExist:
            return Response({'message': 'Phản hồi không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content')
        if not content:
            return Response(
                {'content': ['The content field is required.']},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        reply.content = content
        reply.save()

        return Response({
            'message': 'Đã cập nhật phản hồi thành công',
            'reply': ReviewReplySerializer(reply).data,
        })

    def delete(self, request, pk):
        try:
            reply = ReviewReply.objects.get(pk=pk)
        except ReviewReply.DoesNotExist:
            return Response({'message': 'Phản hồi không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        reply.delete()
        return Response({'message': 'Đã xóa phản hồi thành công'})
