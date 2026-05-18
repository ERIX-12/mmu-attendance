@echo off
:: Ensure ANSI escape codes are enabled for beautiful terminal output
chcp 65001 >nul

echo ==========================================================
echo   🚀 MMU Attendance - Git Auto-Commit & Push Helper
echo ==========================================================
echo.
echo 📋 [1/4] Navigating to the project root directory...
cd /d "%~dp0"

echo.
echo ➕ [2/4] Adding backend/requirements.txt...
git add backend/requirements.txt

echo.
echo 💾 [3/4] Committing changes...
git commit -m "fix(deploy): switch backend to psycopg3 (psycopg[binary]) for Python 3.14/Render compatibility"

echo.
echo 📤 [4/4] Pushing changes to GitHub (main branch)...
git push origin main

echo.
echo ==========================================================
echo   ✅ SUCCESS! Local requirements.txt pushed to GitHub.
echo   
echo   👉 Next Steps:
echo   1. Go to your Render Dashboard (https://dashboard.render.com)
echo   2. Pin the PYTHON_VERSION environment variable to "3.11.0"
echo   3. Click "Manual Deploy" -> "Clear Build Cache & Deploy"
echo ==========================================================
echo.
pause
