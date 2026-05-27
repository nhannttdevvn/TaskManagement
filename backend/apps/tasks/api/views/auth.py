from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import current_user_payload


@csrf_exempt
@require_http_methods(["POST"])
def auth_login(request):
    data = payload(request)
    user = authenticate(request, username=data.get("username"), password=data.get("password"))
    if not user:
        return error("Invalid username or password.", status=401)
    login(request, user)
    return ok(current_user_payload(user))


@csrf_exempt
@require_http_methods(["POST"])
def auth_logout(request):
    logout(request)
    return ok(message="Logged out")


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def users_me(request):
    if request.method == "PATCH":
        if not request.user.is_authenticated:
            return error("Authentication required.", status=401)
        data = payload(request)
        request.user.first_name = data.get("firstName", request.user.first_name)
        request.user.last_name = data.get("lastName", request.user.last_name)
        request.user.email = data.get("email", request.user.email)
        request.user.save(update_fields=["first_name", "last_name", "email"])
    return ok(current_user_payload(request.user))
