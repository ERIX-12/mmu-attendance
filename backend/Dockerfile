FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies for Pillow and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput --settings=mmu_attendance.settings.production || true

EXPOSE 8000

CMD ["gunicorn", "mmu_attendance.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--timeout", "120", \
     "--access-logfile", "-"]
