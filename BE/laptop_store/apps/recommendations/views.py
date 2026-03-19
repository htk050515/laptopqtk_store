from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from .models import UserProductInteraction, UserRecommendation
from .serializers import TrackInteractionSerializer
from .engine import get_popular_products, get_similar_products, compute_user_recommendations


class PersonalizedRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        limit = int(request.query_params.get('limit', 10))

        # Try cached recommendations first
        cached = UserRecommendation.objects.filter(
            user=user
        ).select_related('product').order_by('-score')[:limit]

        if cached.exists():
            products = [rec.product for rec in cached]
        else:
            # Compute on the fly
            recs = compute_user_recommendations(user.id)
            if recs:
                product_ids = [pid for pid, _ in recs[:limit]]
                products = list(Product.objects.filter(id__in=product_ids, status=True))
            else:
                # Cold start fallback
                products = get_popular_products(limit)

        serialized = ProductSerializer(products, many=True).data
        return Response({'recommendations': serialized})


class SimilarProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        limit = int(request.query_params.get('limit', 10))
        products = get_similar_products(pk, limit)
        return Response({'products': ProductSerializer(products, many=True).data})


class PopularProductsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        products = get_popular_products(limit)
        return Response({'products': ProductSerializer(products, many=True).data})


class TrackInteractionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TrackInteractionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        data = serializer.validated_data
        product_id = data['product_id']
        interaction_type = data['interaction_type']

        if not Product.objects.filter(id=product_id).exists():
            return Response({'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        weight = UserProductInteraction.INTERACTION_WEIGHTS.get(interaction_type, 1)

        UserProductInteraction.objects.create(
            user=request.user,
            product_id=product_id,
            interaction_type=interaction_type,
            weight=weight,
        )

        return Response({'message': 'Interaction tracked'})
