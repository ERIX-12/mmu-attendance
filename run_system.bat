@echo off
title MMU Student Attendance System Runner
echo ====================================================================
echo      MMU STUDENT ATTENDANCE SYSTEM - LOCAL DEV STARTUP SCRIPT
echo ====================================================================
echo.

:: Step 1: Start Backend in a new window
echo [1/3] Starting Django backend server...
if exist "backend\venv\Scripts\activate.bat" (
    echo Found virtual environment in backend\venv
    start "MMU Attendance Backend" cmd /k "cd backend && call venv\Scripts\activate && python manage.py migrate && python manage.py runserver"
) else if exist "venv\Scripts\activate.bat" (
    echo Found virtual environment in root venv
    start "MMU Attendance Backend" cmd /k "cd backend && call ..\venv\Scripts\activate && python manage.py migrate && python manage.py runserver"
) else (
    echo [WARNING] Virtual environment not found. Using system python...
    start "MMU Attendance Backend" cmd /k "cd backend && python manage.py migrate && python manage.py runserver"
)

:: Step 2: Start Frontend in a new window
echo [2/3] Starting React frontend dev server...
start "MMU Attendance Frontend" cmd /k "cd frontend && npm run dev"

:: Step 3: Open the browser
echo [3/3] Launching web browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ====================================================================
echo  System is running! 
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://127.0.0.1:8000
echo  - Admin:    http://127.0.0.1:8000/admin
echo.
echo  To stop the servers, close the separate Command Prompt windows.
echo ====================================================================
echo.
pause
