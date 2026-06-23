import json

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from apps.tasks.models import Project, Team, TeamInvitation, TeamInvitationProject, TeamMember


class TeamInvitationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="password")
        self.team = Team.objects.create(name="Owner Workspace", owner=self.user)
        TeamMember.objects.create(
            team=self.team,
            user=self.user,
            role=TeamMember.ROLE_OWNER,
            status=TeamMember.STATUS_ACTIVE,
        )

    def test_invite_team_member_creates_invitation_and_projects(self):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse("team_invite"),
            data=json.dumps(
                {
                    "email": "colleague@example.com",
                    "role": "member",
                    "projects": ["Website Redesign", "Mobile App Development"],
                    "message": "Please join the workspace.",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        invitation = TeamInvitation.objects.get(email="colleague@example.com")
        self.assertEqual(invitation.invited_by, self.user)
        self.assertEqual(invitation.team.owner, self.user)
        self.assertEqual(invitation.team, self.team)
        self.assertEqual(invitation.role, "member")
        self.assertEqual(invitation.message, "Please join the workspace.")
        self.assertEqual(Project.objects.filter(user=self.user).count(), 2)
        self.assertEqual(TeamInvitationProject.objects.filter(invitation=invitation).count(), 2)

    def test_invite_team_member_rejects_invalid_email(self):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse("team_invite"),
            data=json.dumps(
                {
                    "email": "not-an-email",
                    "role": "member",
                    "projects": [],
                    "message": "",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(TeamInvitation.objects.exists())

    def test_api_team_invitation_uses_shared_creation_service(self):
        self.client.force_login(self.user)
        team = Team.objects.create(name="API Workspace", owner=self.user)
        TeamMember.objects.create(
            team=team,
            user=self.user,
            role=TeamMember.ROLE_OWNER,
            status=TeamMember.STATUS_ACTIVE,
        )

        response = self.client.post(
            reverse("api_team_invitations", args=[team.id]),
            data=json.dumps(
                {
                    "email": "api-colleague@example.com",
                    "role": "viewer",
                    "projects": ["API Project"],
                    "message": "Join via API.",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        invitation = TeamInvitation.objects.get(email="api-colleague@example.com")
        self.assertEqual(invitation.invited_by, self.user)
        self.assertEqual(invitation.role, "viewer")
        self.assertEqual(Project.objects.filter(user=self.user, name="API Project").count(), 1)
        self.assertEqual(TeamInvitationProject.objects.filter(invitation=invitation).count(), 1)
