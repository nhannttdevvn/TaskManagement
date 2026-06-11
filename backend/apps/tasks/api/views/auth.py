from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import current_user_payload


@csrf_exempt
@require_http_methods(["POST"])
def auth_login(request):
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


@csrf_exempt
@require_http_methods(["POST"])
def auth_signup(request):
    data = payload(request)
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name", "")

    if not email or not password:
        return error("Email and password are required.", status=400)

    if User.objects.filter(username=email).exists() or User.objects.filter(email=email).exists():
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
        full_name = data.get("full_name") or data.get("fullName")
        if full_name is not None:
            parts = str(full_name).strip().split(" ", 1)
            request.user.first_name = parts[0] if parts else ""
            request.user.last_name = parts[1] if len(parts) > 1 else ""
        else:
            request.user.first_name = data.get("firstName", request.user.first_name)
            request.user.last_name = data.get("lastName", request.user.last_name)

        email = (data.get("email") or request.user.email or "").strip()
        if email and User.objects.exclude(id=request.user.id).filter(email__iexact=email).exists():
            return error("An account with this email already exists.", status=400)
        request.user.email = email

        new_password = data.get("new_password") or data.get("newPassword")
        if new_password:
            current_password = data.get("current_password") or data.get("currentPassword")
            if not request.user.check_password(current_password or ""):
                return error("Current password is incorrect.", status=400)
            if len(new_password) < 8:
                return error("New password must be at least 8 characters.", status=400)
            request.user.set_password(new_password)

        request.user.save()
        if new_password:
            update_session_auth_hash(request, request.user)
    return ok(current_user_payload(request.user))


@csrf_exempt
def debug_info(request):
    import inspect
    source = inspect.getsource(auth_login)
    from django.contrib.auth.models import User
    users = []
    for u in User.objects.all()[:15]:
        users.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "password_prefix": u.password[:20] if u.password else None,
            "has_usable_password": u.has_usable_password()
        })
    return ok({
        "source": source,
        "users": users
    })
