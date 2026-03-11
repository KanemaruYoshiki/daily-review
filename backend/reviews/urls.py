from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import EntryViewSet, RegisterView

router = DefaultRouter()
router.register(r"entries", EntryViewSet, basename="entry")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
]

urlpatterns += router.urls