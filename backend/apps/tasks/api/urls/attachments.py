from django.urls import path

from apps.tasks.api.views import attachment_detail

urlpatterns = [
    path("<slug:attachment_id>/", attachment_detail, name="api_attachment_detail"),
]
