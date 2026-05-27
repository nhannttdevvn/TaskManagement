from django.urls import path

from apps.tasks.api.views import notification_read, notifications

urlpatterns = [
    path("", notifications, name="api_notifications"),
    path("read-all/", notification_read, {"notification_id": "all"}, name="api_notifications_read_all"),
    path("<slug:notification_id>/read/", notification_read, name="api_notification_read"),
]
