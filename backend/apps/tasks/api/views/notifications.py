from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok
from apps.tasks.api.serializers import notification_payload
from apps.tasks.models import Notification
from apps.tasks.services.notifications import mark_notification_read


def notifications(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    return ok([
        notification_payload(notification)
        for notification in Notification.objects.filter(recipient=request.user).order_by("-created_at")[:50]
    ])


@require_http_methods(["PATCH"])
def notification_read(request, notification_id=None):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    notification = Notification.objects.filter(id=notification_id, recipient=request.user).first()
    if not notification:
        return error("Notification not found.", status=404)
    mark_notification_read(notification, request.user)
    return ok(notification_payload(notification))
