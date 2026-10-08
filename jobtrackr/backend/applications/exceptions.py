"""
Custom error handling so the frontend always receives clean JSON
and users never see Python stack traces.
"""
import logging

from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    # Let DRF handle the errors it knows (validation, 401, 403, 404 ...)
    response = exception_handler(exc, context)
    if response is not None:
        return response

    # Anything else is an unexpected bug: log it for the developer and
    # send a safe, generic message to the client.
    logger.exception("Unhandled server error", exc_info=exc)
    return Response(
        {"detail": "Something went wrong on the server. Please try again later."},
        status=500,
    )
