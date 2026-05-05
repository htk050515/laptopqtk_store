from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .services import search_products, get_ai_response


class ChatMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(message) > 500:
            return Response(
                {'error': 'Message too long'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        products = search_products(message)
        reply = get_ai_response(message, products)

        product_data = [
            {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'base_price': str(p.base_price),
                'category': p.category.name if p.category else None,
            }
            for p in products[:5]
        ]

        return Response({
            'reply': reply,
            'suggested_products': product_data,
        })
