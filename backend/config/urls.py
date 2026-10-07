from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from core.views import spa
urlpatterns = [path("admin/", admin.site.urls), path("api/", include("core.urls"))] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    re_path(r"^(?!api/|admin/|static/|media/)(?P<path>.*)$", spa)]  # React routes
