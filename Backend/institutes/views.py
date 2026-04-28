from rest_framework import viewsets, permissions
from .models import Institute
from .serializers import InstituteSerializer

def get_tenant_context(user):
    """Returns (admin_id, institution_id) for the given user, or (None, None)."""
    own_institute = user.institutes.first()
    if own_institute:
        return user.id, own_institute.id
    if hasattr(user, 'userprofile') and user.userprofile.institute:
        return user.userprofile.institute.admin_id, user.userprofile.institute.id
    return None, None

class IsTenantOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'is_superuser', False):
            return True
        admin_id, inst_id = get_tenant_context(request.user)
        return getattr(obj, 'admin_id', None) == admin_id and getattr(obj, 'institution_id', None) == inst_id

class TenantAwareMixin:
    """Mixin for any DRF view to enforce tenant filtering."""
    
    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self.request.user, 'is_superuser', False):
            return qs
        admin_id, inst_id = get_tenant_context(self.request.user)
        if admin_id and inst_id:
            return qs.filter(admin_id=admin_id, institution_id=inst_id)
        return qs.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, 'is_superuser', False):
            serializer.save()
            return
        admin_id, inst_id = get_tenant_context(self.request.user)
        serializer.save(admin_id=admin_id, institution_id=inst_id)

class TenantAwareViewSet(TenantAwareMixin, viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsTenantOwnerOrStaff]

class InstituteViewSet(viewsets.ModelViewSet):
    queryset = Institute.objects.all()
    serializer_class = InstituteSerializer