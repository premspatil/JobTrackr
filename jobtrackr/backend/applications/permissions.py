from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Object-level permission: only the user who created the application
    may read or change it.

    This is a second safety net. The views ALSO filter the queryset by
    request.user, so other users' applications are simply "not found".
    """

    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id
