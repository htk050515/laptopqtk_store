from rest_framework import serializers
from apps.catalog.serializers import ProductSerializer


class TrackInteractionSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    interaction_type = serializers.ChoiceField(choices=['view', 'cart', 'purchase', 'review'])
