from django.views.decorators.http import require_http_methods
from django.db.models import Q

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.models import ChatMessage, Friendship, Team


def can_access_room(user, room_name):
    if not user.is_authenticated:
        return False
    try:
        room_user_ids = [int(value) for value in str(room_name).split("_")]
    except ValueError:
        return False
    if len(room_user_ids) != 2 or user.id not in room_user_ids:
        return False
    other_user_id = room_user_ids[0] if room_user_ids[1] == user.id else room_user_ids[1]
    if Friendship.objects.filter(
        (
            Q(user_sender_id=user.id, user_receiver_id=other_user_id)
            | Q(user_sender_id=other_user_id, user_receiver_id=user.id)
        ),
        status=Friendship.STATUS_ACCEPTED,
    ).exists():
        return True
    return Team.objects.filter(
        Q(owner_id=user.id) | Q(members__user_id=user.id),
        Q(owner_id=other_user_id) | Q(members__user_id=other_user_id),
    ).distinct().exists()


def conversations(request, team_id):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    team = Team.objects.filter(id=team_id, members__user=request.user).first()
    if not team and not Team.objects.filter(id=team_id, owner=request.user).exists():
        return error("Workspace not found or not accessible.", status=404)
    team = team or Team.objects.get(id=team_id)
    return ok([
        {
            "id": str(member.user_id),
            "teamId": str(team.id),
            "member": {
                "id": str(member.user_id),
                "name": member.user.get_full_name() or member.user.username,
                "role": member.role,
            },
        }
        for member in team.members.select_related("user")
    ])


@require_http_methods(["GET", "POST"])
def conversation_messages(request, conversation_id):
    if not can_access_room(request.user, conversation_id):
        return error("Conversation not found or not accessible.", status=404)
    if request.method == "POST":
        data = payload(request)
        message = ChatMessage.objects.create(
            room_name=str(conversation_id),
            sender=request.user,
            sender_name=request.user.get_full_name() or request.user.username,
            body=data.get("body", ""),
        )
        return ok({"id": message.id, "body": message.body, "time": "Just now"}, status=201)
    messages = ChatMessage.objects.filter(room_name=str(conversation_id)).order_by("created_at")[:50]
    return ok([
        {
            "id": message.id,
            "body": message.body,
            "sender_id": message.sender_id,
            "sender_name": message.sender_name,
            "time": message.created_at.strftime("%I:%M %p"),
        }
        for message in messages
    ])


def conversation_message_search(request, conversation_id):
    if not can_access_room(request.user, conversation_id):
        return error("Conversation not found or not accessible.", status=404)
    q = request.GET.get("q", "").lower()
    messages = ChatMessage.objects.filter(room_name=str(conversation_id), body__icontains=q).order_by("-created_at")[:50]
    return ok([
        {"id": message.id, "body": message.body, "time": message.created_at.strftime("%I:%M %p")}
        for message in messages
    ])


@require_http_methods(["DELETE", "PATCH"])
def conversation_detail(request, conversation_id, action=None):
    return ok(message="Conversation updated")


@require_http_methods(["POST"])
def conversation_calls(request, conversation_id):
    return ok({"id": f"call-{conversation_id}", "conversationId": conversation_id, "status": "ringing"}, status=201)


@require_http_methods(["PATCH"])
def call_end(request, call_id):
    return ok({"id": call_id, "status": "ended"})
