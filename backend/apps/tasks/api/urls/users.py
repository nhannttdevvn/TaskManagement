from django.urls import path

from apps.tasks.api.views import user_presence, users_avatar, users_me

urlpatterns = [
    path("me/", users_me, name="api_users_me"),
    path("me/avatar/", users_avatar, name="api_users_avatar"),
    path("me/presence/", user_presence, name="api_user_presence"),
]
