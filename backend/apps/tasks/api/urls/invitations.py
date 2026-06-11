from django.urls import path

from apps.tasks.api.views import invitation_accept, invitation_action

urlpatterns = [
    path("<uuid:token>/accept/", invitation_accept, name="api_invitation_accept"),
    path("<int:invitation_id>/resend/", invitation_action, {"action": "resend"}, name="api_invitation_resend"),
    path("<int:invitation_id>/", invitation_action, name="api_invitation_detail"),
]
