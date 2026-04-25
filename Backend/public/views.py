from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .serializers import ContactMessageSerializer

class HomeView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({
            "message": "Welcome to the Crack-IT Public API.",
            "version": "v1.0.0",
            "environment": "Development" if settings.DEBUG else "Production"
        }, status=status.HTTP_200_OK)

class AboutView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({
            "company": "Dooars Prajukti",
            "product": "Crack-IT",
            "description": "Crack-IT is a comprehensive SaaS platform by Dooars Prajukti designed to streamline workflows and provide scalable solutions.",
            "contact_email": "support@dooarsprajukti.com"
        }, status=status.HTTP_200_OK)

class ContactView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Thank you for contacting us. We will get back to you shortly."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
