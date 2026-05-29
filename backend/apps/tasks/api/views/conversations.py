from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import ok, payload


def conversations(request, team_id):
    return ok([
        {"id": member["id"], "teamId": team_id, "member": member}
        for member in mock_data.clone(mock_data.TEAM_MEMBERS)
    ])


@csrf_exempt
@require_http_methods(["GET", "POST"])
def conversation_messages(request, conversation_id):
    member = next((item for item in mock_data.TEAM_MEMBERS if item["id"] == conversation_id), mock_data.TEAM_MEMBERS[0])
    if request.method == "POST":
        return ok({"id": "message-new", "body": payload(request).get("body", ""), "time": "Just now"}, status=201)
    return ok(mock_data.clone(member["messages"]))


def conversation_message_search(request, conversation_id):
    q = request.GET.get("q", "").lower()
    member = next((item for item in mock_data.TEAM_MEMBERS if item["id"] == conversation_id), mock_data.TEAM_MEMBERS[0])
    return ok([message for message in member["messages"] if q in message["body"].lower()])


@csrf_exempt
@require_http_methods(["DELETE", "PATCH"])
def conversation_detail(request, conversation_id, action=None):
    return ok(message="Conversation updated")


@csrf_exempt
@require_http_methods(["POST"])
def conversation_calls(request, conversation_id):
    return ok({"id": f"call-{conversation_id}", "conversationId": conversation_id, "status": "ringing"}, status=201)


@csrf_exempt
@require_http_methods(["PATCH"])
def call_end(request, call_id):
    return ok({"id": call_id, "status": "ended"})
