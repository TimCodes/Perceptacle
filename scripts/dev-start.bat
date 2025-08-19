@echo off
REM Docker Development Environment Start Script

echo Starting Perceptacle Development Environment...
echo.

REM Copy environment file if it doesn't exist
if not exist .env (
    if exist .env.example (
        echo Creating .env file from .env.example...
        copy .env.example .env
    ) else (
        echo Warning: No .env file found and no .env.example to copy from
    )
)

REM Start the development environment
echo Starting Docker containers...
docker-compose -f docker-compose.dev.yml --env-file .env.development up --build

echo.
echo Development environment stopped.
pause
