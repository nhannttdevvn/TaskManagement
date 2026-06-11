import json
from functools import wraps

from django.http import JsonResponse


def payload(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


def ok(data=None, status=200, **extra):
    body = {"ok": True}
    if data is not None:
        body["data"] = data
    body.update(extra)
    return JsonResponse(body, status=status)


def error(message, status=400):
    return JsonResponse({"ok": False, "error": message}, status=status)


def api_login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return error("Authentication required.", status=401)
        return view_func(request, *args, **kwargs)

    return wrapper
