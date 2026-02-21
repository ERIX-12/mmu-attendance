# Backend Deployment Guide

## 1. Production Server Setup

### Using Gunicorn (Recommended)
```bash
# Install Gunicorn
pip install gunicorn

# Create production settings file
cp mmu_attendance/settings.py mmu_attendance/production_settings.py

# Edit production_settings.py
DEBUG = False
ALLOWED_HOSTS = ['*']  # or your domain
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

### 2. Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### 3. Run Production Server
```bash
# Using Gunicorn
gunicorn --bind 0.0.0.0:8000 mmu_attendance.wsgi:application

# Using Gunicorn with workers
gunicorn --workers 3 --bind 0.0.0.0:8000 mmu_attendance.wsgi:application
```

### 4. Database Migration
```bash
python manage.py migrate
python manage.py createsuperuser
```

## 2. Docker Deployment

### Create Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "mmu_attendance.wsgi:application"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mmu_attendance
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mmu_attendance
      - DEBUG=False
```

## 3. Cloud Deployment Options

### Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: gunicorn mmu_attendance.wsgi:application --bind 0.0.0.0:$PORT" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### DigitalOcean
```bash
# Use DigitalOcean App Platform
# Connect GitHub repository
# Configure environment variables
# Deploy automatically
```

### AWS Elastic Beanstalk
```bash
# Install EB CLI
eb init mmu-attendance
eb create production
eb deploy
```

## 4. Environment Variables
```
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

## 5. Security Checklist
- [ ] DEBUG=False
- [ ] Strong SECRET_KEY
- [ ] HTTPS enabled
- [ ] Database credentials secure
- [ ] CORS properly configured
- [ ] Firewall rules set
- [ ] Regular backups
