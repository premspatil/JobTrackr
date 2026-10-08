"""
Serializers convert model objects <-> JSON and validate incoming data.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import JobApplication

User = get_user_model()


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})
    confirm_password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "username", "password", "confirm_password"]

    def validate_email(self, value):
        # Case-insensitive duplicate check (we allow login with email, so it must be unique)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        # Runs Django's password rules (length, too common, ...)
        candidate = User(
            username=attrs.get("username", ""),
            email=attrs.get("email", ""),
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        try:
            validate_password(attrs["password"], user=candidate)
        except Exception as exc:  # DjangoValidationError
            raise serializers.ValidationError({"password": list(getattr(exc, "messages", [str(exc)]))})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        # create_user() hashes the password; never store plain passwords!
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Accepts a username OR an email in the 'username' field."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})


class UserSerializer(serializers.ModelSerializer):
    """Used for the profile page (read + update)."""

    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "username", "email"]

    def validate_username(self, value):
        # exclude(pk=...) so a user can keep their own username
        if User.objects.filter(username__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()


# ---------------------------------------------------------------------------
# Job applications
# ---------------------------------------------------------------------------
class JobApplicationSerializer(serializers.ModelSerializer):
    # Human readable labels for the frontend (read-only, computed from choices)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    job_type_display = serializers.CharField(source="get_job_type_display", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id", "company_name", "job_title", "job_type", "job_type_display",
            "location", "job_url", "application_date", "status", "status_display",
            "salary", "recruiter_name", "recruiter_email", "interview_date",
            "follow_up_date", "notes", "created_at", "updated_at",
        ]
        # 'user' is deliberately NOT a field: it is always set from the logged-in
        # user on the server, so a client can never create data for someone else.
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_company_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Company name is required.")
        return value

    def validate_job_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Job title is required.")
        return value


class ApplicationSummarySerializer(serializers.ModelSerializer):
    """Smaller version used in dashboard / reminder lists."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id", "company_name", "job_title", "location", "application_date",
            "status", "status_display", "follow_up_date", "interview_date",
        ]
