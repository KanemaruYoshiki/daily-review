from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EntryViewSet, RegisterView, DashboardSummaryView

router = DefaultRouter()
router.register(r"entries", EntryViewSet, basename="entry")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
]

urlpatterns += router.urls