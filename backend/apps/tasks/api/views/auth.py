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
def auth_signup(request):
    from django.contrib.auth.models import User
    data = payload(request)
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name", "")

    if not email or not password:
        return error("Email and password are required.", status=400)

    if User.objects.filter(username=email).exists():
        return error("An account with this email already exists.", status=400)

    # Split full name into first and last name
    parts = full_name.strip().split(" ", 1)
    first_name = parts[0] if parts else ""
    last_name = parts[1] if len(parts) > 1 else ""

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
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
