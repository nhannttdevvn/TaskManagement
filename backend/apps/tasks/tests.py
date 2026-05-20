import json

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

from .models import Project, Task, Team, TeamInvitation, TeamInvitationProject


class TaskViewsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="password")
        self.other_user = User.objects.create_user(username="other", password="password")

    def test_task_list_requires_login(self):
        response = self.client.get(reverse("task_list"))

        self.assertEqual(response.status_code, 302)
        self.assertIn("/admin/login/", response["Location"])

    def test_task_list_only_shows_current_user_tasks(self):
        owner_task = Task.objects.create(user=self.user, title="Owner task")
        Task.objects.create(user=self.other_user, title="Other task")
        self.client.force_login(self.user)

        response = self.client.get(reverse("task_list"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, owner_task.title)
        self.assertNotContains(response, "Other task")

    def test_task_create_assigns_current_user(self):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse("task_create"),
            {
                "title": "New task",
                "description": "Created from test",
                "status": "todo",
                "priority": "medium",
            },
        )

        self.assertRedirects(response, reverse("task_list"))
        task = Task.objects.get(title="New task")
        self.assertEqual(task.user, self.user)


class TeamInvitationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="password")

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
        self.assertEqual(invitation.role, "member")
        self.assertEqual(invitation.message, "Please join the workspace.")
        self.assertTrue(Team.objects.filter(name="TaskFlow Workspace").exists())
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
