from django.urls import path

from apps.tasks.api.views import (
    conversation_calls,
    conversation_detail,
    conversation_message_search,
    conversation_messages,
)

urlpatterns = [
    path("<slug:conversation_id>/messages/", conversation_messages, name="api_conversation_messages"),
    path("<slug:conversation_id>/messages/search/", conversation_message_search, name="api_conversation_message_search"),
    path("<slug:conversation_id>/read/", conversation_detail, {"action": "read"}, name="api_conversation_read"),
    path("<slug:conversation_id>/", conversation_detail, name="api_conversation_detail"),
    path("<slug:conversation_id>/calls/", conversation_calls, name="api_conversation_calls"),
]
