"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
<<<<<<< HEAD

urlpatterns = [
    path("api/", include("apps.tasks.api.urls")),
    path("admin/", admin.site.urls),
    path("", include("apps.tasks.urls")),
=======
from django.views.generic import TemplateView

urlpatterns = [
    path("api/", include("apps.tasks.api.urls")),
    path("dashboard/", TemplateView.as_view(template_name="dashboard/index.html"), name="dashboard"),
    path("project/", TemplateView.as_view(template_name="timeline/index.html"), name="project"),
    path("timeline/", TemplateView.as_view(template_name="timeline/index.html"), name="timeline"),
    path("team/", TemplateView.as_view(template_name="team/index.html"), name="team"),
    # ── FE: Settings / Files / Auth (added by feature/ui-components) ──
    path("settings/", TemplateView.as_view(template_name="settings/index.html"), name="settings"),
    path("files/", TemplateView.as_view(template_name="files/index.html"), name="files"),
    path("login/", TemplateView.as_view(template_name="auth/login.html"), name="login"),
    path("logout/", TemplateView.as_view(template_name="auth/logout.html"), name="logout"),
    path("", include("apps.tasks.urls")),
    path("admin/", admin.site.urls),
>>>>>>> origin/develop
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
