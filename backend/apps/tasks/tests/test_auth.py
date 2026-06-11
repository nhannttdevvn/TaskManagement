import json

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class UserAuthApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="password123",
            first_name="John",
            last_name="Doe"
        )

    def test_login_successful(self):
        response = self.client.post(
            reverse("api_auth_login"),
            data=json.dumps({
                "username": "test@example.com",
                "password": "password123"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertTrue(res_data["ok"])
        self.assertEqual(res_data["data"]["email"], "test@example.com")
        self.assertEqual(res_data["data"]["name"], "John Doe")
        self.assertTrue(res_data["data"]["isAuthenticated"])

    def test_login_invalid_credentials(self):
        response = self.client.post(
            reverse("api_auth_login"),
            data=json.dumps({
                "username": "test@example.com",
                "password": "wrongpassword"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)
        res_data = response.json()
        self.assertFalse(res_data["ok"])
        self.assertEqual(res_data["error"], "Invalid username or password.")

    def test_signup_successful(self):
        response = self.client.post(
            reverse("api_auth_signup"),
            data=json.dumps({
                "email": "newuser@example.com",
                "password": "newpassword123",
                "full_name": "Alice Smith"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertTrue(res_data["ok"])
        self.assertEqual(res_data["data"]["email"], "newuser@example.com")
        self.assertEqual(res_data["data"]["name"], "Alice Smith")
        self.assertTrue(res_data["data"]["isAuthenticated"])
        
        # Verify user is created in database
        self.assertTrue(User.objects.filter(username="newuser@example.com").exists())
        new_user = User.objects.get(username="newuser@example.com")
        self.assertEqual(new_user.first_name, "Alice")
        self.assertEqual(new_user.last_name, "Smith")

    def test_signup_missing_fields(self):
        response = self.client.post(
            reverse("api_auth_signup"),
            data=json.dumps({
                "email": "",
                "password": "newpassword123",
                "full_name": "Alice Smith"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        res_data = response.json()
        self.assertFalse(res_data["ok"])
        self.assertEqual(res_data["error"], "Email and password are required.")

    def test_signup_duplicate_email(self):
        response = self.client.post(
            reverse("api_auth_signup"),
            data=json.dumps({
                "email": "test@example.com",  # Already exists from setUp
                "password": "newpassword123",
                "full_name": "Alice Smith"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        res_data = response.json()
        self.assertFalse(res_data["ok"])
        self.assertEqual(res_data["error"], "An account with this email already exists.")

    def test_logout(self):
        self.client.force_login(self.user)
        response = self.client.post(reverse("api_auth_logout"))
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertTrue(res_data["ok"])
        self.assertEqual(res_data["message"], "Logged out")

    def test_login_by_email_with_different_username(self):
        # Create a user where username is not equal to email
        different_user = User.objects.create_user(
            username="different_user",
            email="different@example.com",
            password="password123",
            first_name="Jane",
            last_name="Doe"
        )
        # Login using email instead of username
        response = self.client.post(
            reverse("api_auth_login"),
            data=json.dumps({
                "email": "different@example.com",
                "password": "password123"
            }),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        res_data = response.json()
        self.assertTrue(res_data["ok"])
        self.assertEqual(res_data["data"]["email"], "different@example.com")
        self.assertEqual(res_data["data"]["username"], "different_user")
