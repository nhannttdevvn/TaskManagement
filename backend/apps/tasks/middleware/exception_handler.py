from django.http import JsonResponse


class ApiExceptionMiddleware:
    """Return JSON errors for API failures instead of HTML debug pages."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        if not request.path.startswith("/api/"):
            return None
        return JsonResponse(
            {
                "ok": False,
                "error": "Internal API error.",
                "code": "internal_error",
                "detail": str(exception),
                "details": {"exception": str(exception)},
            },
            status=500,
        )
