"""
API views. Each view is a small class that handles one endpoint.
"""
from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import JobApplication
from .permissions import IsOwner
from .serializers import (
    ApplicationSummarySerializer,
    JobApplicationSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()

# Once an application reaches one of these, a follow-up reminder is pointless
CLOSED_STATUSES = ["selected", "rejected", "withdrawn"]


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    """POST /api/register/ - create a new account."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # anyone may register
    authentication_classes = []


class LoginView(APIView):
    """
    POST /api/login/ - body: {"username": "<username or email>", "password": "..."}
    Returns JWT access + refresh tokens and basic user info.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["username"].strip()
        password = serializer.validated_data["password"]

        # Let the user type either username or email
        if "@" in identifier:
            match = User.objects.filter(email__iexact=identifier).first()
            username = match.username if match else identifier
        else:
            username = identifier

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid username/email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    """
    POST /api/logout/ - body: {"refresh": "<refresh token>"}
    Blacklists the refresh token so it can't be used again.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            # Already expired/blacklisted: the user is effectively logged out anyway
            pass
        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Job applications (CRUD)
# ---------------------------------------------------------------------------
class ApplicationListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/applications/   - list MY applications (with search, filters, paging)
    POST /api/applications/   - create an application for the logged-in user
    """

    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    # Sort options the frontend may request with ?ordering=...
    ALLOWED_ORDERING = {
        "application_date", "-application_date", "company_name", "-company_name",
        "status", "-status", "follow_up_date", "-follow_up_date", "created_at", "-created_at",
    }

    def get_queryset(self):
        # THE SECURITY RULE: start from the logged-in user's applications only.
        queryset = JobApplication.objects.filter(user=self.request.user)
        params = self.request.query_params

        # --- Search: matches company name OR job title OR location -------------
        search = params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search)
                | Q(job_title__icontains=search)
                | Q(location__icontains=search)
            )

        # --- Filters ---------------------------------------------------------
        if params.get("status"):
            queryset = queryset.filter(status=params["status"])
        if params.get("job_type"):
            queryset = queryset.filter(job_type=params["job_type"])
        if params.get("location"):
            queryset = queryset.filter(location__icontains=params["location"].strip())
        # Date range filter on the application date (YYYY-MM-DD)
        if params.get("date_from"):
            queryset = queryset.filter(application_date__gte=params["date_from"])
        if params.get("date_to"):
            queryset = queryset.filter(application_date__lte=params["date_to"])

        ordering = params.get("ordering")
        if ordering in self.ALLOWED_ORDERING:
            queryset = queryset.order_by(ordering, "-created_at")
        return queryset

    def list(self, request, *args, **kwargs):
        # Bad date text such as ?date_from=abc would raise a ValidationError from
        # the ORM; turn that into a clean 400 instead of a server error.
        try:
            return super().list(request, *args, **kwargs)
        except DjangoValidationError:
            return Response(
                {"detail": "Invalid date filter. Use the format YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def perform_create(self, serializer):
        # The owner always comes from the token, never from the request body
        serializer.save(user=self.request.user)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET / PUT / PATCH / DELETE  /api/applications/<id>/
    Because the queryset only contains MY applications, asking for someone
    else's id returns 404 (we don't even reveal that it exists).
    """

    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class DashboardView(APIView):
    """GET /api/dashboard/ - statistics, chart data, recent items, follow-ups."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = JobApplication.objects.filter(user=request.user)

        # ONE database query: SELECT status, COUNT(*) ... GROUP BY status
        counts = {row["status"]: row["total"] for row in applications.values("status").annotate(total=Count("id"))}

        # Build a count for every status (0 when the user has none)
        status_counts = [
            {"status": value, "label": label, "count": counts.get(value, 0)}
            for value, label in JobApplication.STATUS_CHOICES
        ]
        stats = {"total": applications.count()}
        stats.update({item["status"]: item["count"] for item in status_counts})

        recent = applications.order_by("-created_at")[:5]

        today = timezone.localdate()
        upcoming = (
            applications.filter(follow_up_date__gte=today)
            .exclude(status__in=CLOSED_STATUSES)
            .order_by("follow_up_date")[:5]
        )

        return Response(
            {
                "stats": stats,
                "status_counts": status_counts,  # used by the chart
                "recent_applications": ApplicationSummarySerializer(recent, many=True).data,
                "upcoming_followups": ApplicationSummarySerializer(upcoming, many=True).data,
            }
        )


# ---------------------------------------------------------------------------
# Reminders
# ---------------------------------------------------------------------------
class RemindersView(APIView):
    """GET /api/reminders/ - today's, overdue and upcoming follow-ups + interviews."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = JobApplication.objects.filter(user=request.user)
        today = timezone.localdate()  # today's date in the project time zone
        now = timezone.now()
        open_applications = applications.exclude(status__in=CLOSED_STATUSES)

        todays = open_applications.filter(follow_up_date=today).order_by("company_name")
        overdue = open_applications.filter(follow_up_date__lt=today).order_by("follow_up_date")
        upcoming = open_applications.filter(follow_up_date__gt=today).order_by("follow_up_date")
        interviews = (
            applications.filter(interview_date__gte=now)
            .exclude(status__in=["rejected", "withdrawn"])
            .order_by("interview_date")
        )

        def serialize(queryset):
            return ApplicationSummarySerializer(queryset, many=True).data

        return Response(
            {
                "todays_followups": serialize(todays),
                "overdue_followups": serialize(overdue),
                "upcoming_followups": serialize(upcoming),
                "interviews": serialize(interviews),
            }
        )


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------
class ProfileView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/profile/ - the logged-in user's own profile."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
