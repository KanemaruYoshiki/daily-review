from rest_framework import viewsets, permissions
from .models import Entry
from .serializers import EntrySerializer


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Entry.objects.filter(user=self.request.user).order_by("-date", "-updated_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
