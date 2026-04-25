from rest_framework import viewsets
from .models import Institute
from .serializers import InstituteSerializer


class InstituteViewSet(viewsets.ModelViewSet):
    queryset = Institute.objects.all()
    serializer_class = InstituteSerializer