@echo off
REM Start Personal Trainer Application (React + Flask)

echo ==========================================
echo Personal Trainer - Starting Application
echo ==========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.10+
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found. Please install Node.js 16+
    exit /b 1
)

REM Start Flask backend in new window
echo Starting Flask API server (port 5000)...
start "Flask Backend" python run.py

REM Wait for Flask to start
timeout /t 3 /nobreak >nul

REM Start React frontend in new window
echo Starting React frontend (port 3000)...
cd frontend
start "React Frontend" npm run dev

echo.
echo ==========================================
echo Application started successfully!
echo ==========================================
echo Flask Backend:  http://localhost:5000
echo React Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each window to stop servers
echo ==========================================

REM Keep this window open
pause
