from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import ok


def notifications(request):
    return ok([
        {"id": "n1", "body": "Aisha mentioned you in UX copy updates.", "read": False},
        {"id": "n2", "body": "Daniel completed responsive review.", "read": False},
    ])


@csrf_exempt
@require_http_methods(["PATCH"])
def notification_read(request, notification_id=None):
    return ok({"notificationId": notification_id, "read": True})
