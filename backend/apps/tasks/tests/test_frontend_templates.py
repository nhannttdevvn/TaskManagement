from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class FrontendTemplateContractTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="password")

    def test_dashboard_template_exposes_api_contract(self):
        response = self.client.get(reverse("dashboard"))

        self.assertContains(response, 'id="dashboardApp"')
        self.assertContains(response, 'data-dashboard-url="/api/dashboard/data/"')
        self.assertContains(response, "js/core/api.js")
        self.assertContains(response, "js/pages/dashboard/api.js")
        self.assertContains(response, "js/pages/dashboard.js")

    def test_team_template_exposes_api_contract(self):
        response = self.client.get(reverse("team"))

        self.assertContains(response, 'id="teamApp"')
        self.assertContains(response, 'data-team-url="/api/team/data/"')
        self.assertContains(response, 'data-invite-url="/api/teams/1/invitations/"')
        self.assertContains(response, "js/pages/team/api.js")
        self.assertContains(response, "js/pages/team.js")

    def test_timeline_template_exposes_api_contract_and_csrf(self):
        response = self.client.get(reverse("timeline"))

        self.assertContains(response, 'id="timelineApp"')
        self.assertContains(response, 'data-project-url="/api/project/data/"')
        self.assertContains(response, 'data-invite-url="/api/teams/1/invitations/"')
        self.assertContains(response, 'name="csrfmiddlewaretoken"')
        self.assertContains(response, "js/pages/timeline/api.js")
        self.assertContains(response, "js/pages/timeline.js")

    def test_task_pages_can_still_extend_base_shim(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("task_list"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Tasks")
