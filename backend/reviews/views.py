from datetime import timedelta
from django.utils import timezone
from django.db.models import Avg
from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Entry
from .serializers import EntrySerializer, RegisterSerializer


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Entry.objects.filter(user=self.request.user).order_by("-date", "-updated_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "message": "User registered successfully.",
            },
            status=status.HTTP_201_CREATED,
        )

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()

        entries = Entry.objects.filter(user=user)

        # 今週の開始（月曜）
        start_of_week = today - timedelta(days=today.weekday())

        # 今月の開始
        start_of_month = today.replace(day=1)

        entries_this_week_qs = entries.filter(date__gte=start_of_week, date__lte=today)
        entries_this_month_qs = entries.filter(date__gte=start_of_month, date__lte=today)

        average_mood_this_week = entries_this_week_qs.aggregate(avg=Avg("mood"))["avg"]
        if average_mood_this_week is not None:
            average_mood_this_week = round(float(average_mood_this_week), 1)

        # 継続日数
        entry_dates = set(entries.values_list("date", flat=True))
        current_streak = 0
        cursor = today

        while cursor in entry_dates:
            current_streak += 1
            cursor -= timedelta(days=1)

        return Response(
            {
                "current_streak": current_streak,
                "entries_this_week": entries_this_week_qs.count(),
                "entries_this_month": entries_this_month_qs.count(),
                "average_mood_this_week": average_mood_this_week,
            }
        )