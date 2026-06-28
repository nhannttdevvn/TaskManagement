from pathlib import Path
from tempfile import TemporaryDirectory

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse


class AvatarUploadTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="avatar-user",
            email="avatar@example.com",
            password="password123",
        )
        self.media_dir = TemporaryDirectory()
        self.override = override_settings(
            MEDIA_ROOT=self.media_dir.name,
            AVATAR_UPLOAD_MAX_SIZE=15 * 1024 * 1024,
        )
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        self.media_dir.cleanup()

    def test_user_can_upload_avatar_larger_than_12mb_to_local_media(self):
        self.client.force_login(self.user)
        content = b"\x89PNG\r\n\x1a\n" + (b"0" * (13 * 1024 * 1024))
        avatar = SimpleUploadedFile("avatar.png", content, content_type="image/png")

        response = self.client.post(reverse("api_users_avatar"), {"avatar": avatar})

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]
        self.assertTrue(data["avatar"].startswith("/media/avatars/user_"))
        saved_files = list((Path(self.media_dir.name) / "avatars").glob("user_*.png"))
        self.assertEqual(len(saved_files), 1)
        self.assertGreater(saved_files[0].stat().st_size, 12 * 1024 * 1024)
