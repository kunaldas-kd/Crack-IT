from rest_framework import serializers
from .models import Batch

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = '__all__'
        read_only_fields = ['start_date']
    