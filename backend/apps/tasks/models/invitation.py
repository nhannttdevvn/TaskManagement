import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from .project import Project
from .team import Team


def default_invitation_expiry():
    return timezone.now() + timedelta(days=7)


default_invitation_expiry.__module__ = "apps.tasks.models"


class TeamInvitation(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_EXPIRED = "expired"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_EXPIRED, "Expired"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
        ("viewer", "Viewer"),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="invitations")
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_team_invitations",
    )
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="accepted_team_invitations",
        blank=True,
        null=True,
    )
    message = models.TextField(blank=True, null=True)
    expires_at = models.DateTimeField(default=default_invitation_expiry)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(blank=True, null=True)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.email} -> {self.team}"


class TeamInvitationProject(models.Model):
    invitation = models.ForeignKey(
        TeamInvitation,
        on_delete=models.CASCADE,
        related_name="invited_projects",
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="team_invitations",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["invitation", "project"],
                name="unique_invitation_project",
            ),
        ]

    def __str__(self):
        return f"{self.invitation.email} - {self.project.name}"
