from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import current_user_payload
from apps.tasks.services.avatars import delete_user_avatar, save_user_avatar


@require_http_methods(["POST"])
def auth_login(request):
    from django.contrib.auth.models import User
    data = payload(request)
    identifier = (data.get("identifier") or data.get("email") or data.get("username") or "").strip()
    password = data.get("password")

    if not identifier or not password:
        return error("Username/email and password are required.", status=400)

    candidates = [identifier]
    email_matches = list(User.objects.filter(email__iexact=identifier).values_list("username", flat=True)[:2])
    username_matches = list(User.objects.filter(username__iexact=identifier).values_list("username", flat=True)[:2])
    for username in email_matches + username_matches:
        if username not in candidates:
            candidates.append(username)

    user = None
    for username in candidates:
        user = authenticate(request, username=username, password=password)
        if user:
            break

    if not user or not user.is_active:
        return error("Invalid username or password.", status=401)
    login(request, user)
    return ok(current_user_payload(user))



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


@require_http_methods(["POST"])
def auth_logout(request):
    logout(request)
    return ok(message="Logged out")


@require_http_methods(["GET", "PATCH"])
def users_me(request):
    if request.method == "PATCH":
        if not request.user.is_authenticated:
            return error("Authentication required.", status=401)
        data = payload(request)
        full_name = data.get("full_name")
        if full_name is not None:
            parts = str(full_name).strip().split(" ", 1)
            request.user.first_name = parts[0] if parts else ""
            request.user.last_name = parts[1] if len(parts) > 1 else ""
        else:
            request.user.first_name = data.get("firstName", request.user.first_name)
            request.user.last_name = data.get("lastName", request.user.last_name)
        request.user.email = data.get("email", request.user.email)
        request.user.save(update_fields=["first_name", "last_name", "email"])
    return ok(current_user_payload(request.user))


@require_http_methods(["POST", "DELETE"])
def users_avatar(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)

    if request.method == "DELETE":
        delete_user_avatar(request.user)
        return ok({"avatar": ""})

    avatar = request.FILES.get("avatar")
    try:
        avatar_url = save_user_avatar(request.user, avatar)
    except ValueError as exc:
        return error(str(exc), status=400, code="invalid_avatar")

    return ok({"avatar": avatar_url})
