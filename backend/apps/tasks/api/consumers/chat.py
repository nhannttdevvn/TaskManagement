import json
from channels.generic.websocket import AsyncWebsocketConsumer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Retrieve the room name from the URL route
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join the channel group
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

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        message = data.get("message", "")
        sender_name = data.get("sender_name", "")
        sender_id = data.get("sender_id", "")
        time = data.get("time", "Just now")

        # Broadcast the message to the group channel
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender_name": sender_name,
                "sender_id": sender_id,
                "time": time,
            }
        )

    # Receive message from room group
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
