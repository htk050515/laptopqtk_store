from rest_framework import serializers
from .models import Review, ReviewReply


class ReviewReplySerializer(serializers.ModelSerializer):
    admin = serializers.SerializerMethodField()

    class Meta:
        model = ReviewReply
        fields = ['id', 'review_id', 'admin_id', 'content', 'created_at', 'updated_at', 'admin']

    def get_admin(self, obj):
        if obj.admin:
            return {'id': obj.admin.id, 'name': obj.admin.name}
        return None


class ReviewUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class ReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)
    replies = ReviewReplySerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_id', 'product_id', 'rating', 'comment', 'status',
                  'created_at', 'updated_at', 'user', 'replies']


class ReviewWithProductSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)
    product = serializers.SerializerMethodField()
    replies = ReviewReplySerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_id', 'product_id', 'rating', 'comment', 'status',
                  'created_at', 'updated_at', 'user', 'product', 'replies']

    def get_product(self, obj):
        if obj.product:
            return {'id': obj.product.id, 'name': obj.product.name}
        return None
