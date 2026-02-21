# Student Attendance Management System – Mountains of the Moon University (MMU)

A complete, production-ready full-stack application for managing student attendance via QR codes. Built with Django (DRF), React, and Docker.

## Features

- **RBAC**: Three distinct user roles (Admin, Lecturer, Student).
- **QR Attendance**: Lecturers generate session-specific rotating QR codes; students scan to mark attendance.
- **Real-time Dashboards**: Analytics charts, attendance rates, and at-risk student highlighting.
- **Reporting**: Export attendance data as PDF or CSV.
- **Security**: JWT authentication, CSRF protection, and role-based permissions.

## Tech Stack

- **Backend**: Python 3.12, Django 5, Django REST Framework, PostgreSQL
- **Frontend**: React 18, Vite, Material UI (MUI 5), Chart.js
- **DevOps**: Docker, Docker Compose, Nginx (Reverse Proxy)

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- (Optional) Python 3.12 and Node.js 18 if running locally without Docker.

## 🚀 Quick Start (Docker)

This is the recommended way to run the application.

1. **Clone the repository** (if applicable).
2. **Review Environment Variables** (optional):
   - The project comes with a generic `.env.example` in `backend/`.
   - Docker Compose will automatically use `backend/.env` if present, or default values.

3. **Build and Run**:
   ```bash
   docker-compose up --build
   ```
   - This builds the backend and frontend containers.
   - It also spins up a PostgreSQL database.
   - **First run only**: It automatically runs migrations and seeds demo data (`seed_data` command).

4. **Access the Application**:
   - Open your browser to **[http://localhost](http://localhost)**.
   - API is accessible at `http://localhost/api/`.
   - Django Admin at `http://localhost/admin/`.

## 🔑 Demo Credentials

The database is pre-seeded with these accounts:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `Admin@123` |
| **Lecturer** | `lec_okello` | `Lecturer@123` |
| **Student** | `stu_amanya` | `Student@123` |

## 🛠️ Local Development (Manual Setup)

If you prefer running without Docker:

### Backend

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
3. Run migrations and seed data:
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```
4. Start server:
   ```bash
   python manage.py runserver
   ```
   Backend runs at http://localhost:8000.

### Frontend

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
   Frontend runs at http://localhost:5173.

## 🧪 Testing

To run the backend test suite (unit, API, and integration tests):

```bash
# Inside docker container
docker-compose exec backend python manage.py test apps

# Or locally
python manage.py test apps
```

## API Documentation

Key endpoints (prefixed with `/api/`):

- **Auth**: `/auth/token/`, `/auth/users/me/`
- **Courses**: `/courses/`, `/courses/enrollments/`
- **Sessions**: `/sessions/`, `/sessions/{id}/activate/`, `/sessions/{id}/qr_refresh/`
- **Attendance**: `/attendance/mark/` (POST), `/attendance/summary/`
- **Reports**: `/reports/{id}/csv/`, `/reports/{id}/pdf/`
