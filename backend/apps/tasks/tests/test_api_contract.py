import json

from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.test import TestCase, TransactionTestCase
from django.urls import reverse

from apps.tasks.models import (
    Notification,
    Project,
    Task,
    TaskActivity,
    TaskAttachment,
    TaskComment,
    TaskFavorite,
    Team,
    TeamMember,
)


class ApiContractTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="password")
        self.other = User.objects.create_user(username="other", password="password")

    def post_json(self, url, data):
        return self.client.post(url, data=json.dumps(data), content_type="application/json")

    def patch_json(self, url, data):
        return self.client.patch(url, data=json.dumps(data), content_type="application/json")

    def test_frontend_data_gets_do_not_create_default_workspace(self):
        self.client.force_login(self.owner)

        dashboard = self.client.get(reverse("api_dashboard_data"))
        project = self.client.get(reverse("api_project_data"))
        team = self.client.get(reverse("api_team_data"))

        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(project.status_code, 200)
        self.assertEqual(team.status_code, 200)
        self.assertEqual(Team.objects.count(), 0)
        self.assertEqual(dashboard.json()["data"]["projects"], [])
        self.assertEqual(project.json()["data"]["projects"], [])
        self.assertIsNone(team.json()["data"]["team"])

    def test_project_create_requires_workspace_when_none_exists(self):
        self.client.force_login(self.owner)

        response = self.post_json(reverse("api_projects"), {"title": "No workspace project"})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["code"], "workspace_required")
        self.assertEqual(Project.objects.count(), 0)
        self.assertEqual(Team.objects.count(), 0)

    def test_viewer_cannot_create_project_in_workspace(self):
        team = Team.objects.create(name="Workspace", owner=self.owner)
        TeamMember.objects.create(team=team, user=self.owner, role=TeamMember.ROLE_OWNER)
        TeamMember.objects.create(team=team, user=self.other, role=TeamMember.ROLE_VIEWER)
        self.client.force_login(self.other)

        response = self.post_json(reverse("api_projects"), {"title": "Viewer project", "workspace_id": team.id})

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["code"], "permission_denied")
        self.assertFalse(Project.objects.filter(name="Viewer project").exists())

    def test_other_user_cannot_edit_private_task(self):
        task = Task.objects.create(user=self.owner, title="Private task")
        self.client.force_login(self.other)

        response = self.patch_json(reverse("api_task_status", args=[task.id]), {"status": "Done"})

        self.assertEqual(response.status_code, 404)
        task.refresh_from_db()
        self.assertEqual(task.status, "todo")

    def test_task_mutations_persist_activity_favorite_comment_and_attachment(self):
        team = Team.objects.create(name="Workspace", owner=self.owner)
        TeamMember.objects.create(team=team, user=self.owner, role=TeamMember.ROLE_OWNER)
        TeamMember.objects.create(team=team, user=self.other, role=TeamMember.ROLE_ADMIN)
        project = Project.objects.create(name="Project", user=self.owner, team=team)
        self.client.force_login(self.owner)

        create_response = self.post_json(
            reverse("api_project_tasks", args=[project.id]),
            {"title": "Persisted task", "status": "To Do", "priority": "High", "due_date": "2026-06-22"},
        )
        self.assertEqual(create_response.status_code, 201)
        task_id = create_response.json()["data"]["id"]

        self.client.force_login(self.other)
        status_response = self.patch_json(reverse("api_task_status", args=[task_id]), {"status": "Review"})
        favorite_response = self.client.post(reverse("api_task_favorite", args=[task_id]))
        comment_response = self.post_json(reverse("api_task_comments", args=[task_id]), {"body": "Looks good."})
        attachment_response = self.post_json(
            reverse("api_task_attachments", args=[task_id]),
            {"name": "brief.pdf", "size": "2 MB"},
        )

        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(favorite_response.status_code, 200)
        self.assertEqual(comment_response.status_code, 201)
        self.assertEqual(attachment_response.status_code, 201)
        task = Task.objects.get(id=task_id)
        self.assertEqual(task.status, "review")
        self.assertTrue(TaskFavorite.objects.filter(user=self.other, task=task).exists())
        self.assertTrue(TaskComment.objects.filter(task=task, body="Looks good.").exists())
        self.assertTrue(TaskAttachment.objects.filter(task=task, name="brief.pdf").exists())
        self.assertGreaterEqual(TaskActivity.objects.filter(task=task).count(), 4)
        self.assertTrue(Notification.objects.filter(recipient=self.owner, target_id=str(task.id)).exists())


class ChatSocketContractTests(TransactionTestCase):
    def test_unauthenticated_socket_is_rejected(self):
        try:
            from config.asgi import application
        except ImportError as exc:
            self.skipTest(f"ASGI websocket dependencies are not importable: {exc}")

        communicator = WebsocketCommunicator(application, "/ws/chat/1_2/")
        connected, _ = async_to_sync(communicator.connect)()

        self.assertFalse(connected)
