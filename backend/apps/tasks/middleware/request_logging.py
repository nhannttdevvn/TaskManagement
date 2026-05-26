import time


class ApiRequestTimingMiddleware:
    """Small API timing hook for future logging/observability."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started_at = time.perf_counter()
        response = self.get_response(request)
        if request.path.startswith("/api/"):
            response["X-API-Duration-ms"] = f"{(time.perf_counter() - started_at) * 1000:.2f}"
        return response
