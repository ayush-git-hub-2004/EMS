@echo off
echo ==================================================
echo   Employee Management System - Quick Start
echo   (Backend in Docker + Frontend Local)
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Docker is not installed!
    echo Backend will run locally instead.
    set DOCKER_AVAILABLE=false
) else (
    echo Docker is available
    set DOCKER_AVAILABLE=true
)
echo.

echo Setting up the project...
echo.

REM Setup Backend
if "%DOCKER_AVAILABLE%"=="true" (
    echo Starting backend server in Docker...
    start "Backend Docker" cmd /k docker run --rm -v "%cd%":/app -w /app/backend -p 5000:5000 node:20-alpine sh -c "npm install && npm run dev"
) else (
    echo Installing backend dependencies...
    cd backend
    call npm install
    echo.
    
    echo Seeding database with sample data...
    call npm run seed
    echo.
    
    echo Starting backend server...
    start "Backend Server" cmd /k npm run dev
    cd ..
)

timeout /t 3 /nobreak >nul

REM Setup Frontend
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
echo.

echo Starting frontend server...
start "Frontend Server" cmd /k npm run dev
cd ..

echo.
echo ==================================================
echo   Application is starting!
echo ==================================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Health:   http://localhost:5000/api/health
echo.
echo Login Credentials:
echo   Admin:    admin@company.com / admin123
echo   Manager:  john.manager@company.com / manager123
echo   Employee: sarah.smith@company.com / employee123
echo.
if "%DOCKER_AVAILABLE%"=="true" (
    echo New windows will open for frontend and Docker backend.
    echo Close those windows to stop the servers.
) else (
    echo Two new windows will open for frontend and backend.
    echo Close those windows to stop the servers.
)
echo ==================================================
echo.

pause
