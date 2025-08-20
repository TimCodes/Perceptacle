@echo off
REM Docker Health Check Script

echo Checking Docker installation and status...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo [OK] Docker is installed
docker --version

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running
    echo Please start Docker Desktop and try again
    echo.
    echo Troubleshooting tips:
    echo 1. Open Docker Desktop application
    echo 2. Wait for Docker to fully start (look for green status)
    echo 3. If issues persist, restart Docker Desktop
    pause
    exit /b 1
)

echo [OK] Docker daemon is running
echo [OK] Docker Compose is available
docker-compose --version

echo.
echo Docker environment is ready!
echo You can now run: npm run docker:dev
pause
