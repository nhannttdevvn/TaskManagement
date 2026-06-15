from django.test import SimpleTestCase
from django.urls import reverse


class RouteCompatibilityTests(SimpleTestCase):
    def test_page_route_names_still_resolve(self):
        self.assertEqual(reverse("dashboard"), "/dashboard/")
        self.assertEqual(reverse("project"), "/project/")
        self.assertEqual(reverse("timeline"), "/timeline/")
        self.assertEqual(reverse("team"), "/team/")
        self.assertEqual(reverse("task_list"), "/tasks/")
        self.assertEqual(reverse("root_redirect"), "/")

    def test_frontend_api_route_names_still_resolve(self):
        self.assertEqual(reverse("api_dashboard_data"), "/api/dashboard/data/")
        self.assertEqual(reverse("api_project_data"), "/api/project/data/")
        self.assertEqual(reverse("api_team_data"), "/api/team/data/")
        self.assertEqual(reverse("api_team_invitations", args=[1]), "/api/teams/1/invitations/")

    def test_domain_api_route_names_still_resolve(self):
        self.assertEqual(reverse("api_auth_login"), "/api/auth/login/")
        self.assertEqual(reverse("api_projects"), "/api/projects/")
        self.assertEqual(reverse("api_project_tasks", args=["alpha"]), "/api/projects/alpha/tasks/")
        self.assertEqual(reverse("api_task_status", args=["task-1"]), "/api/tasks/task-1/status/")
        self.assertEqual(reverse("api_notifications"), "/api/notifications/")
