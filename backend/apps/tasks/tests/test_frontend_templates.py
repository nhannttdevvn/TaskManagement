from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class FrontendTemplateContractTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="password")

    def test_dashboard_template_exposes_api_contract(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("dashboard"))

        self.assertContains(response, 'id="dashboardApp"')
        self.assertContains(response, 'data-dashboard-url="/api/dashboard/data/"')
        self.assertContains(response, "js/core/api.js")
        self.assertContains(response, "js/pages/dashboard/api.js")
        self.assertContains(response, "js/pages/dashboard.js")

    def test_team_template_exposes_api_contract(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("team"))

        self.assertContains(response, 'id="teamApp"')
        self.assertContains(response, 'data-team-url="/api/team/data/"')
        self.assertContains(response, 'data-invite-url=""')
        self.assertContains(response, "js/pages/team/api.js")
        self.assertContains(response, "js/pages/team.js")

    def test_timeline_template_exposes_api_contract_and_csrf(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("timeline"))

        self.assertContains(response, 'id="timelineApp"')
        self.assertContains(response, 'data-project-url="/api/project/data/"')
        self.assertContains(response, 'data-invite-url=""')
        self.assertContains(response, 'name="csrfmiddlewaretoken"')
        self.assertContains(response, "js/pages/timeline/api.js")
        self.assertContains(response, "js/pages/timeline.js")

    def test_task_pages_can_still_extend_base_shim(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("task_list"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Tasks")

    def test_updates_template_is_available_from_sidebar_links(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse("updates"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="updatesApp"')
        self.assertContains(response, "All Updates")

    def test_auth_templates_are_english_only_and_not_cached(self):
        login_response = self.client.get(reverse("login"))

        self.assertEqual(login_response.status_code, 200)
        self.assertContains(login_response, "Sign in to TaskFlow")
        self.assertContains(login_response, "Create your TaskFlow account")
        self.assertContains(login_response, "Forgot password?")
        self.assertContains(login_response, "Do not have an account?")
        self.assertEqual(login_response.headers.get("Cache-Control"), "max-age=0, no-cache, no-store, must-revalidate, private")

        self.client.force_login(self.user)
        logout_response = self.client.get(reverse("logout"))

        self.assertEqual(logout_response.status_code, 200)
        self.assertContains(logout_response, "Sign out of your account?")
        self.assertContains(logout_response, "You are signed out")
        self.assertEqual(logout_response.headers.get("Cache-Control"), "max-age=0, no-cache, no-store, must-revalidate, private")

        blocked_words = [
            "Đăng",
            "đăng",
            "Quên",
            "Chưa",
            "tài khoản",
            "mật khẩu",
            "Một nền tảng",
            "phân cấp",
            "Ä",
            "Ã",
            "á",
            "º",
        ]
        login_html = login_response.content.decode("utf-8")
        logout_html = logout_response.content.decode("utf-8")
        for word in blocked_words:
            self.assertNotIn(word, login_html)
            self.assertNotIn(word, logout_html)
