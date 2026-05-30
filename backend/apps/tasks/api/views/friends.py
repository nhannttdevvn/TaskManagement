from django.contrib.auth import get_user_model
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from apps.tasks.api.responses import ok, error, payload
from apps.tasks.models import Friendship

User = get_user_model()


@csrf_exempt
@require_http_methods(["GET"])
def search_users(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return ok([])

    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(email__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).exclude(id=request.user.id)[:15]

    data = []
    for u in users:
        # Check relation
        friendship = Friendship.objects.filter(
            (Q(user_sender=request.user) & Q(user_receiver=u)) |
            (Q(user_sender=u) & Q(user_receiver=request.user))
        ).first()

        status = "none"
        request_id = None
        if friendship:
            if friendship.status == Friendship.STATUS_ACCEPTED:
                status = "friends"
            elif friendship.status == Friendship.STATUS_PENDING:
                if friendship.user_sender == request.user:
                    status = "pending_sent"
                else:
                    status = "pending_received"
                    request_id = friendship.id

        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "name": u.get_full_name() or u.username,
            "friendship_status": status,
            "request_id": request_id,
        })
    return ok(data)


@csrf_exempt
@require_http_methods(["POST"])
def send_friend_request(request):
    req_payload = payload(request)
    receiver_id = req_payload.get("user_id")
    if not receiver_id:
        return error("Receiver ID is required.")

    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return error("User not found.")

    if receiver == request.user:
        return error("You cannot add yourself as a friend.")

    # Check if a friendship already exists
    exists = Friendship.objects.filter(
        (Q(user_sender=request.user) & Q(user_receiver=receiver)) |
        (Q(user_sender=receiver) & Q(user_receiver=request.user))
    ).first()

    if exists:
        if exists.status == Friendship.STATUS_ACCEPTED:
            return error("You are already friends.")
        return error("A friend request is already pending or declined.")

    Friendship.objects.create(
        user_sender=request.user,
        user_receiver=receiver,
        status=Friendship.STATUS_PENDING
    )
    return ok(message="Friend request sent.")


@csrf_exempt
@require_http_methods(["POST"])
def respond_friend_request(request):
    req_payload = payload(request)
    request_id = req_payload.get("request_id")
    action = req_payload.get("action")  # 'accept' or 'decline'

    if not request_id or action not in ["accept", "decline"]:
        return error("Request ID and valid action ('accept' or 'decline') are required.")

    try:
        friendship = Friendship.objects.get(id=request_id)
    except Friendship.DoesNotExist:
        return error("Friend request not found.")

    # Only receiver can accept/decline
    if friendship.user_receiver != request.user:
        return error("You are not authorized to respond to this request.")

    if friendship.status != Friendship.STATUS_PENDING:
        return error("This request is already resolved.")

    if action == "accept":
        friendship.status = Friendship.STATUS_ACCEPTED
        friendship.save()
        return ok(message="Friend request accepted.")
    else:
        friendship.status = Friendship.STATUS_DECLINED
        friendship.save()
        return ok(message="Friend request declined.")


@csrf_exempt
@require_http_methods(["GET"])
def list_friends(request):
    # Accepted friendships where user is sender or receiver
    friendships = Friendship.objects.filter(
        (Q(user_sender=request.user) | Q(user_receiver=request.user)) &
        Q(status=Friendship.STATUS_ACCEPTED)
    ).select_related("user_sender", "user_receiver")

    friends_data = []
    for f in friendships:
        friend = f.user_receiver if f.user_sender == request.user else f.user_sender
        # Mock online status for UI based on ID or system configuration
        online_status = "online" if friend.id % 2 == 0 or friend.is_superuser else "away"
        friends_data.append({
            "id": friend.id,
            "username": friend.username,
            "email": friend.email,
            "name": friend.get_full_name() or friend.username,
            "status": online_status,
            "role": "Collaborator",
            "messages": [
                # Mock history structure, but real chat goes over sockets
                {"body": f"Hi, this is a real-time chat with {friend.first_name or friend.username}!", "time": "System"}
            ],
        })
    return ok(friends_data)


@csrf_exempt
@require_http_methods(["GET"])
def list_pending_requests(request):
    requests = Friendship.objects.filter(
        user_receiver=request.user,
        status=Friendship.STATUS_PENDING
    ).select_related("user_sender")

    data = [
        {
            "request_id": r.id,
            "sender_id": r.user_sender.id,
            "sender_name": r.user_sender.get_full_name() or r.user_sender.username,
            "sender_email": r.user_sender.email,
        }
        for r in requests
    ]
    return ok(data)
