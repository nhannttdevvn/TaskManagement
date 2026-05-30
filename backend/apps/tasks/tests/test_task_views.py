from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from apps.tasks.models import Task


class TaskViewsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="password")
        self.other_user = User.objects.create_user(username="other", password="password")

    def test_task_list_requires_login(self):
        response = self.client.get(reverse("dashboard"))

        self.assertEqual(response.status_code, 302)
        self.assertIn("/login/", response["Location"])

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

        self.assertRedirects(response, reverse("dashboard"))
        task = Task.objects.get(title="New task")
        self.assertEqual(task.user, self.user)
