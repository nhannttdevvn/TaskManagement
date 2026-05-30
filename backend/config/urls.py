from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path("api/", include("apps.tasks.api.urls")),
    path("accounts/", include("allauth.urls")),
    path("settings/", TemplateView.as_view(template_name="settings/index.html"), name="settings"),
    path("files/", TemplateView.as_view(template_name="files/index.html"), name="files"),
    path("login/", TemplateView.as_view(template_name="auth/login.html"), name="login"),
    path("logout/", TemplateView.as_view(template_name="auth/logout.html"), name="logout"),
    path("admin/", admin.site.urls),
    path("", include("apps.tasks.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
