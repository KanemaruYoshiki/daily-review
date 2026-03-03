from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Entry
from datetime import date

User = get_user_model()


class EntryAPITest(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="pass123")
        self.user2 = User.objects.create_user(username="user2", password="pass123")
        self.url = reverse("entry-list")

    # 🔐 JWT認証ヘルパー
    def authenticate(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

    # ① 未ログインは401
    def test_requires_authentication(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ② 自分のデータだけ取得できる
    def test_user_only_sees_own_entries(self):
        Entry.objects.create(user=self.user1, date=date.today(), title="u1")
        Entry.objects.create(user=self.user2, date=date.today(), title="u2")

        self.authenticate(self.user1)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "u1")

    # ③ 同日POSTは400
    def test_duplicate_date_returns_400(self):
        self.authenticate(self.user1)

        data = {
            "date": date.today(),
            "title": "first entry",
            "good": "",
            "bad": "",
            "next": "",
            "mood": 3,
        }

        # 1回目は成功
        response1 = self.client.post(self.url, data)
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # 2回目（同日）は400
        response2 = self.client.post(self.url, data)
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

    # ④ 他人のentryは更新できない
    def test_cannot_patch_other_users_entry(self):
        entry = Entry.objects.create(
            user=self.user1,
            date=date.today(),
            title="secret"
        )

        self.authenticate(self.user2)

        url = reverse("entry-detail", args=[entry.id])
        response = self.client.patch(url, {"title": "hacked"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ⑤ moodが6なら400
    def test_invalid_mood_returns_400(self):
        self.authenticate(self.user1)

        data = {
            "date": date.today(),
            "title": "bad mood",
            "good": "",
            "bad": "",
            "next": "",
            "mood": 6,
        }

        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ⑥ DELETEできる
    def test_delete_entry(self):
        self.authenticate(self.user1)

        entry = Entry.objects.create(
            user=self.user1,
            date=date.today(),
            title="to delete"
        )

        url = reverse("entry-detail", args=[entry.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Entry.objects.filter(id=entry.id).exists())