"""
apps/chatbot/views.py
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .services import search_products, get_ai_response

logger = logging.getLogger(__name__)


class ChatbotMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = request.data.get('message', '').strip()
        history = request.data.get('history', [])

        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        if len(message) > 500:
            return Response({'error': 'Message too long'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            products = search_products(message, limit=8)
            ai_text, product_cards = get_ai_response(
                user_message=message,
                products=products,
                conversation_history=history,
            )
            return Response({'reply': ai_text, 'products': product_cards})

        except Exception as e:
            logger.error(f"Chatbot error: {e}")
            return Response({'reply': 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại!', 'products': []})