from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class PageRedirectionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")

    def test_unauthenticated_redirects(self):
        # Unauthenticated users should be redirected to login
        redirect_targets = [
            ("root_redirect", "/login/"),
            ("dashboard", "/login/?next=/dashboard/"),
            ("project", "/login/?next=/project/"),
            ("timeline", "/login/?next=/timeline/"),
            ("team", "/login/?next=/team/"),
            ("settings", "/login/?next=/settings/"),
            ("files", "/login/?next=/files/"),
            ("logout", "/login/?next=/logout/"),
        ]
        for name, expected_redirect in redirect_targets:
            response = self.client.get(reverse(name))
            self.assertEqual(response.status_code, 302, f"Expected 302 for page {name}")
            self.assertIn(expected_redirect, response["Location"], f"Expected redirect target {expected_redirect} for page {name}")

    def test_authenticated_redirects(self):
        self.client.force_login(self.user)
        # Authenticated users should redirect from root/login to dashboard,
        # and be allowed to visit dashboard, project, timeline, team, settings, files, logout.
        response = self.client.get(reverse("root_redirect"))
        self.assertRedirects(response, reverse("dashboard"))

        response = self.client.get(reverse("login"))
        self.assertRedirects(response, reverse("dashboard"))

        allowed_pages = ["dashboard", "project", "timeline", "team", "settings", "files", "logout"]
        for name in allowed_pages:
            response = self.client.get(reverse(name))
            self.assertEqual(response.status_code, 200, f"Expected 200 for allowed page {name}")
