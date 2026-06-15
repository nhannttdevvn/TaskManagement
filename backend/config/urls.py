from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from apps.tasks import views as task_views

urlpatterns = [
    path("api/", include("apps.tasks.api.urls")),
    path("accounts/", include("allauth.urls")),
    path("settings/", task_views.SettingsPageView.as_view(), name="settings"),
    path("files/", task_views.FilesPageView.as_view(), name="files"),
    path("login/", task_views.LoginPageView.as_view(), name="login"),
    path("logout/", task_views.LogoutPageView.as_view(), name="logout"),
    path("admin/", admin.site.urls),
    path("", include("apps.tasks.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
