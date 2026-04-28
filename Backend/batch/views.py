from rest_framework import generics, permissions
from .models import Batch
from .serializer import BatchSerializer
from institutes.views import TenantAwareMixin, IsTenantOwnerOrStaff

class BatchListCreateView(TenantAwareMixin, generics.ListCreateAPIView):
    queryset = Batch.objects.all().order_by('-created_at')
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwnerOrStaff]

class BatchRetrieveUpdateDestroyView(TenantAwareMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Batch.objects.all().order_by('-created_at')
    serializer_class = BatchSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwnerOrStaff]