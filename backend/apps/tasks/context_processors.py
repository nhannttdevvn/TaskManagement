from django.conf import settings

def google_oauth_status(request):
    google_client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
    google_client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", "")
    return {
        "google_oauth_enabled": bool(google_client_id and google_client_secret)
    }
