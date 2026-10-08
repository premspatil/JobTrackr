from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    """Friendly message at http://127.0.0.1:8000/ so you know the server works."""
    return JsonResponse(
        {
            "name": "JobTrackr API",
            "tagline": "Track. Apply. Follow Up. Get Hired.",
            "api": "/api/",
            "admin": "/admin/",
        }
    )


def not_found(request, exception=None):
    return JsonResponse({"detail": "Not found."}, status=404)


def server_error(request):
    return JsonResponse({"detail": "Something went wrong on the server."}, status=500)


# Used when DEBUG=False so errors are JSON instead of HTML pages
handler404 = "jobtrackr.urls.not_found"
handler500 = "jobtrackr.urls.server_error"

urlpatterns = [
    path("", api_root),
    path("admin/", admin.site.urls),
    path("api/", include("applications.urls")),
]
