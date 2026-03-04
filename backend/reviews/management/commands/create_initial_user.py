import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Create initial admin user if not exists (for Render free plan without shell)."

    def handle(self, *args, **options):
        username = os.environ.get("INITIAL_ADMIN_USERNAME")
        password = os.environ.get("INITIAL_ADMIN_PASSWORD")
        email = os.environ.get("INITIAL_ADMIN_EMAIL", "")

        if not username or not password:
            self.stdout.write(self.style.WARNING("INITIAL_ADMIN_* env vars not set. Skipping user creation."))
            return

        User = get_user_model()

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f"User '{username}' already exists. Skipping."))
            return

        user = User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}' successfully."))