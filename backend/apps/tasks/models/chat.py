from django.conf import settings
from django.db import models


class ChatMessage(models.Model):
    room_name = models.CharField(max_length=160, db_index=True)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="chat_messages",
    )
    sender_name = models.CharField(max_length=150, blank=True)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.room_name}: {self.sender_name or self.sender_id}"
