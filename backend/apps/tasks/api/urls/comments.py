from django.urls import path

from apps.tasks.api.views import comment_detail

urlpatterns = [
    path("<slug:comment_id>/", comment_detail, name="api_comment_detail"),
]
