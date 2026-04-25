from django.urls import path
from .views import BatchListCreateView, BatchRetrieveUpdateDestroyView

urlpatterns = [
    path('', BatchListCreateView.as_view(), name='batch-list-create'),
    path('<int:pk>/', BatchRetrieveUpdateDestroyView.as_view(), name='batch-detail'),
]