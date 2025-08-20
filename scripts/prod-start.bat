@echo off
REM Docker Production Environment Start Script

echo Starting Perceptacle Production Environment...
echo.

REM Check if production env file exists
if not exist .env.production (
    echo Error: .env.production file not found!
    echo Please create .env.production with your production settings.
    pause
    exit /b 1
)

REM Start the production environment
echo Starting Docker containers in production mode...
docker-compose --env-file .env.production up --build -d

echo.
echo Production environment started in detached mode.
echo Use 'docker-compose logs -f' to view logs.
echo Use 'docker-compose down' to stop the environment.
pause
