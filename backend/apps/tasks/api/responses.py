import json

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


def error(message, status=400, code=None, details=None):
    default_codes = {
        400: "bad_request",
        401: "authentication_required",
        403: "permission_denied",
        404: "not_found",
        409: "conflict",
        500: "internal_error",
    }
    return JsonResponse(
        {
            "ok": False,
            "error": message,
            "code": code or default_codes.get(status, "api_error"),
            "details": details or {},
        },
        status=status,
    )
