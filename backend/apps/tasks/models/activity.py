from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_TASK = "task"
    TYPE_PROJECT = "project"
    TYPE_TEAM = "team"
    TYPE_CHAT = "chat"

    TYPE_CHOICES = [
        (TYPE_TASK, "Task"),
        (TYPE_PROJECT, "Project"),
        (TYPE_TEAM, "Team"),
        (TYPE_CHAT, "Chat"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="notifications_sent",
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_TASK)
    body = models.CharField(max_length=255)
    target_type = models.CharField(max_length=40, blank=True)
    target_id = models.CharField(max_length=80, blank=True)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.body


class TaskActivity(models.Model):
    task = models.ForeignKey("Task", on_delete=models.CASCADE, related_name="activities")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="task_activities",
    )
    action = models.CharField(max_length=80)
    body = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.body
