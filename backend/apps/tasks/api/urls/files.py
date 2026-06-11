from django.urls import path

from apps.tasks.api.views import file_folders, file_upload, files_collection

urlpatterns = [
    path("", files_collection, name="api_files"),
    path("folders/", file_folders, name="api_file_folders"),
    path("upload/", file_upload, name="api_file_upload"),
]
