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
        inst_param = self.request.query_params.get('institution')
        
        if getattr(self.request.user, 'is_superuser', False):
            if inst_param:
                qs = qs.filter(institution_id=inst_param)
            return qs

        # If user is an admin of institutes, let them see data for all their institutes
        if self.request.user.institutes.exists():
            qs = qs.filter(admin_id=self.request.user.id)
            if inst_param:
                qs = qs.filter(institution_id=inst_param)
            return qs
            
        # If user is a staff member (has a profile linked to one institute)
        if hasattr(self.request.user, 'userprofile') and self.request.user.userprofile.institute:
            inst = self.request.user.userprofile.institute
            qs = qs.filter(admin_id=inst.admin_id, institution_id=inst.id)
            if inst_param and str(inst_param) != str(inst.id):
                return qs.none() # Cannot request data for an institute they don't belong to
            return qs
            
        return qs.none()

    def perform_create(self, serializer):
        provided_inst = self.request.data.get('institution')
        
        # If an institution was explicitly provided, find its admin to ensure data continuity
        final_inst_id = None
        final_admin_id = None
        
        if provided_inst:
            try:
                inst = Institute.objects.get(id=provided_inst)
                final_inst_id = inst.id
                final_admin_id = inst.admin_id
            except Institute.DoesNotExist:
                pass
                
        # If not provided or invalid, fallback to the logged-in user's context
        if not final_inst_id:
            final_admin_id, final_inst_id = get_tenant_context(self.request.user)
            
        if getattr(self.request.user, 'is_superuser', False):
            # Superusers can save without context if they don't provide an institution
            if final_inst_id:
                serializer.save(admin_id=final_admin_id, institution_id=final_inst_id)
            else:
                serializer.save()
            return
        
        serializer.save(admin_id=final_admin_id, institution_id=final_inst_id)

class TenantAwareViewSet(TenantAwareMixin, viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsTenantOwnerOrStaff]

class InstituteViewSet(viewsets.ModelViewSet):
    queryset = Institute.objects.all()
    serializer_class = InstituteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Institute.objects.none()
        if user.is_superuser:
            return Institute.objects.all().order_by('id')
        # Each admin only sees their own institutes
        return Institute.objects.filter(admin=user).order_by('id')

    def perform_create(self, serializer):
        # Automatically set the logged-in user as the institute admin
        serializer.save(admin=self.request.user)