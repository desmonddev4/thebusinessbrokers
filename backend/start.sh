#!/bin/sh
set -e

# Run database migrations
python manage.py migrate --noinput

# Create superuser if environment variables are set
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py create_admin
fi

# Create media directory with proper permissions
mkdir -p /app/media || true

# Seed initial content (safe to re-run, only creates missing records)
# Skip photos if media directory is not writable
python manage.py seed_tbb || echo "Seed command failed (likely photo permissions), continuing anyway..."

# Start gunicorn
exec gunicorn config.wsgi:application --bind :$PORT --workers 2 --threads 4 --timeout 60 --access-logfile -
