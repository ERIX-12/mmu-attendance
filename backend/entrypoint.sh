#!/bin/sh
set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn..."
exec gunicorn mmu_attendance.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile -
