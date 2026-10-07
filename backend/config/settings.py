import os
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
env = os.environ.get
csv = lambda v: [x.strip() for x in v.split(",") if x.strip()]

DEBUG = env("DJANGO_DEBUG", "0") == "1"
SECRET_KEY = env("DJANGO_SECRET_KEY", "dev-only-change-me" if DEBUG else "")
if not SECRET_KEY:
    raise ImproperlyConfigured("Set DJANGO_SECRET_KEY (or DJANGO_DEBUG=1 for local development).")
ALLOWED_HOSTS = csv(env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1"))
CSRF_TRUSTED_ORIGINS = csv(env("CSRF_TRUSTED_ORIGINS", ""))

INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes", "django.contrib.sessions",
    "django.contrib.messages", "django.contrib.staticfiles", "rest_framework", "corsheaders", "core"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware", "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware", "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware"]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
    "OPTIONS": {"context_processors": ["django.template.context_processors.request",
    "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"

# PostgreSQL. On Cloud Run with Cloud SQL, DB_HOST is the unix socket: /cloudsql/PROJECT:REGION:INSTANCE
DATABASES = {"default": {"ENGINE": "django.db.backends.postgresql", "NAME": env("DB_NAME", "tbb"), "USER": env("DB_USER", "tbb"),
    "PASSWORD": env("DB_PASSWORD", ""), "HOST": env("DB_HOST", "localhost"), "PORT": env("DB_PORT", "5432"),
    "CONN_MAX_AGE": 60, "CONN_HEALTH_CHECKS": True}}
AUTH_PASSWORD_VALIDATORS = [{"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 12}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"}]
LANGUAGE_CODE = "en-gb"; TIME_ZONE = "Africa/Accra"; USE_I18N = True; USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Static files and the built React app (copied to frontend_dist by the Dockerfile)
STATIC_URL = "static/"; STATIC_ROOT = BASE_DIR / "staticfiles"
FRONTEND_DIST = BASE_DIR / "frontend_dist"
WHITENOISE_ROOT = FRONTEND_DIST if FRONTEND_DIST.exists() else None
WHITENOISE_INDEX_FILE = True
WHITENOISE_IMMUTABLE_FILE_TEST = lambda path, url: url.startswith("/assets/")  # Vite hashes these filenames

# Uploaded media (adviser photos). Cloud Run uses Google Cloud Storage; Render uses local filesystem.
STORAGES = {"default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
            "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"}}
MEDIA_URL = "/media/"; MEDIA_ROOT = BASE_DIR / "media"
GS_BUCKET_NAME = env("GS_BUCKET_NAME", "")
if GS_BUCKET_NAME:
    STORAGES["default"] = {"BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
        "OPTIONS": {"bucket_name": GS_BUCKET_NAME, "querystring_auth": False, "default_acl": None}}
    MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/"
# For Render, media files are served locally (will be lost on redeploy - consider S3 for production)
# Set RENDER_MEDIA_PERSISTENT=true and use Render disk mount for persistent storage

# CORS: allow frontend origins. For Render deployment, add your Vercel domain.
default_cors = "http://localhost:5173" if DEBUG else ""
CORS_ALLOWED_ORIGINS = csv(env("CORS_ORIGINS", default_cors))
# Also allow credentials for production
CORS_ALLOW_CREDENTIALS = True
REST_FRAMEWORK = {"DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"enquiry": "5/hour"}}

# Behind Google's load balancer, which terminates TLS
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(env("HSTS_SECONDS", "3600"))  # raise to 31536000 once the site is confirmed stable
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"

EMAIL_BACKEND = env("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", ""); EMAIL_PORT = int(env("EMAIL_PORT", "587"))
EMAIL_HOST_USER = env("EMAIL_HOST_USER", ""); EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", "website@businessbrokers.com.gh")
ENQUIRY_NOTIFY_EMAIL = env("ENQUIRY_NOTIFY_EMAIL", "")  # company address, not yet supplied

LOGGING = {"version": 1, "disable_existing_loggers": False, "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env("LOG_LEVEL", "INFO")}}
