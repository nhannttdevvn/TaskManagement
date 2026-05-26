from django.urls import path

from apps.tasks.api.views import call_end

urlpatterns = [
    path("<slug:call_id>/end/", call_end, name="api_call_end"),
]
