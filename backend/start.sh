#!/bin/sh
set -e

# Run database migrations
python manage.py migrate --noinput

# Seed initial content (safe to re-run, only creates missing records)
python manage.py seed_tbb

# Start gunicorn
exec gunicorn config.wsgi:application --bind :$PORT --workers 2 --threads 4 --timeout 60 --access-logfile -
