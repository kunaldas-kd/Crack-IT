from rest_framework import serializers
from django.db.models import Count
from .models import Batch

class BatchSerializer(serializers.ModelSerializer):
    enrolled = serializers.SerializerMethodField()
    end_date  = serializers.DateField(read_only=True)  # computed by model.save()

    class Meta:
        model  = Batch
        fields = [
            'id', 'name', 'start_date', 'end_date',
            'duration_weeks', 'max_students', 'status',
            'enrolled', 'admin', 'institution',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['start_date', 'end_date', 'enrolled', 'admin']

    def get_enrolled(self, obj):
        return obj.students.count()
