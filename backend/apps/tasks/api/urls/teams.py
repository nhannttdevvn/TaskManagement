from django.urls import path

from apps.tasks.api.views import conversations, team_detail, team_invitations, team_members, team_presence, teams_collection

urlpatterns = [
    path("", teams_collection, name="api_teams"),
    path("<int:team_id>/", team_detail, name="api_team_detail"),
    path("<int:team_id>/members/", team_members, name="api_team_members"),
    path("<int:team_id>/members/<slug:member_id>/", team_members, name="api_team_member_detail"),
    path("<int:team_id>/invitations/", team_invitations, name="api_team_invitations"),
    path("<int:team_id>/conversations/", conversations, name="api_team_conversations"),
    path("<int:team_id>/presence/", team_presence, name="api_team_presence"),
]
