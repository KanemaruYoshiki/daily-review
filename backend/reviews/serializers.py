from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Entry


class EntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Entry
        fields = [
            "id",
            "user",
            "date",
            "title",
            "good",
            "bad",
            "next",
            "mood",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "user"]

    def validate_mood(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("mood must be between 1 and 5.")
        return value

    def validate(self, attrs):
        """
        POST時：同一ユーザー同日が既にある場合、分かりやすいエラーにする。
        PATCH時：自分自身ならOK、別レコードにぶつかるならエラー。
        """
        request = self.context.get("request")
        user = getattr(request, "user", None)

        date = attrs.get("date", getattr(self.instance, "date", None))
        if user and user.is_authenticated and date:
            qs = Entry.objects.filter(user=user, date=date)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"date": "This date already has an entry."})

        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("このユーザー名は既に使われています。")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("このメールアドレスは既に使われています。")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "パスワード確認が一致しません。"}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
        )
        user.set_password(password)
        user.save()

        return user