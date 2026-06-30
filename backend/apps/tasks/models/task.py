from django.contrib.auth.models import User
from django.db import models
from .project import Project


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
        blank=True,
        null=True,
    )
    STATUS_CHOICES = [
        ("todo", "To Do"),
        ("in_progress", "In Progress"),
        ("review", "Review"),
        ("done", "Done"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="todo")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="medium")
    progress = models.PositiveSmallIntegerField(default=0)

    # Kanban and gantt properties
    position = models.PositiveIntegerField(default=0)
    start = models.FloatField(default=9.0)
    duration = models.FloatField(default=1.0)
    row = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=100, default="bg-sky-200 border-sky-300")
    category = models.CharField(max_length=100, default="Project Task")

    # Relations
    assignees = models.ManyToManyField(User, related_name="assigned_tasks", blank=True)
    favorited_by = models.ManyToManyField(User, related_name="favorite_tasks", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ["position", "-priority", "due_date", "-created_at"]
