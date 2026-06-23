import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import Q

from apps.tasks.models import ChatMessage, Friendship, Team


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4401)
            return

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        if not await self.can_join_room(self.room_name, self.user.id):
            await self.close(code=4403)
            return

        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the channel group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message = str(data.get("message", "")).strip()
        if not message:
            return
        saved = await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender_name": saved["sender_name"],
                "sender_id": saved["sender_id"],
                "time": saved["time"],
            }
        )

    async def chat_message(self, event):
        message = event["message"]
        sender_name = event["sender_name"]
        sender_id = event["sender_id"]
        time = event["time"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({
                "message": message,
                "sender_name": sender_name,
                "sender_id": sender_id,
                "time": time,
            })
        )

    @database_sync_to_async
    def can_join_room(self, room_name, user_id):
        try:
            room_user_ids = [int(value) for value in str(room_name).split("_")]
        except ValueError:
            return False
        if len(room_user_ids) != 2 or user_id not in room_user_ids:
            return False
        other_user_id = room_user_ids[0] if room_user_ids[1] == user_id else room_user_ids[1]
        friends = Friendship.objects.filter(
            (
                Q(user_sender_id=user_id, user_receiver_id=other_user_id)
                | Q(user_sender_id=other_user_id, user_receiver_id=user_id)
            ),
            status=Friendship.STATUS_ACCEPTED,
        ).exists()
        if friends:
            return True
        return Team.objects.filter(
            Q(owner_id=user_id) | Q(members__user_id=user_id),
            Q(owner_id=other_user_id) | Q(members__user_id=other_user_id),
        ).distinct().exists()

    @database_sync_to_async
    def save_message(self, message):
        saved = ChatMessage.objects.create(
            room_name=self.room_name,
            sender=self.user,
            sender_name=self.user.get_full_name() or self.user.username,
            body=message,
        )
        return {
            "sender_id": str(self.user.id),
            "sender_name": saved.sender_name,
            "time": saved.created_at.strftime("%I:%M %p"),
        }
