from django.conf import settings
from django.db import models


class TaskFavorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="task_favorites")
    task = models.ForeignKey("Task", on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "task"], name="unique_task_favorite"),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.task_id}"


class ProjectFavorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_favorites")
    project = models.ForeignKey("Project", on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "project"], name="unique_project_favorite"),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.project_id}"
