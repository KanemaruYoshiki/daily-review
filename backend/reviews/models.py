from django.conf import settings
from django.db import models


class Entry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="entries",
    )
    date = models.DateField()

    title = models.CharField(max_length=120, blank=True, default="")
    good = models.TextField(blank=True, default="")
    bad = models.TextField(blank=True, default="")
    next = models.TextField(blank=True, default="")

    mood = models.PositiveSmallIntegerField(default=3)  # 1〜5想定

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "date"], name="unique_user_date_entry")
        ]
        ordering = ["-date", "-updated_at"]

    def __str__(self):
        return f"{self.user} {self.date}"