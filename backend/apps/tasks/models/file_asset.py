from django.conf import settings
from django.db import models


class FileFolder(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="file_folders",
    )
    name = models.CharField(max_length=120)
    color = models.CharField(max_length=32, default="blue")
    icon = models.CharField(max_length=32, default="folder")
    shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "name"]
        constraints = [
            models.UniqueConstraint(fields=["owner", "name"], name="unique_file_folder_per_owner"),
        ]

    def __str__(self):
        return self.name


class FileAsset(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="file_assets",
    )
    folder = models.ForeignKey(
        FileFolder,
        on_delete=models.SET_NULL,
        related_name="files",
        blank=True,
        null=True,
    )
    name = models.CharField(max_length=255)
    size_mb = models.FloatField(default=0)
    file_type = models.CharField(max_length=40, default="Other")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "name"]

    def __str__(self):
        return self.name
