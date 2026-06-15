from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    team = models.ForeignKey(
        "Team",
        on_delete=models.CASCADE,
        related_name="projects",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "name"], name="unique_project_name_per_user"),
        ]


class ProjectMember(models.Model):
    ROLE_MANAGER = "manager"
    ROLE_MEMBER = "member"
    ROLE_VIEWER = "viewer"

    ROLE_CHOICES = [
        (ROLE_MANAGER, "Manager"),
        (ROLE_MEMBER, "Member"),
        (ROLE_VIEWER, "Viewer"),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["project", "user"], name="unique_project_member"),
        ]

    def __str__(self):
        return f"{self.user} - {self.project}"
