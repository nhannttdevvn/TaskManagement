from django.urls import path
from apps.tasks.api.views import (
    search_users,
    send_friend_request,
    respond_friend_request,
    list_friends,
    list_pending_requests,
)

urlpatterns = [
    path("search/", search_users, name="api_friends_search"),
    path("request/", send_friend_request, name="api_friends_request"),
    path("respond/", respond_friend_request, name="api_friends_respond"),
    path("list/", list_friends, name="api_friends_list"),
    path("requests/", list_pending_requests, name="api_friends_pending_requests"),
]
