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