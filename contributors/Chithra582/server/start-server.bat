@echo off
echo ========================================
echo Starting SubSentry API Server
echo ========================================

REM Create .env if not exists
if not exist ".env" (
    echo Creating .env file...
    echo PORT=3000 > .env
    echo NODE_ENV=development >> .env
    echo MONGODB_URI=mongodb://localhost:27017/subsentry_alerts >> .env
    echo JWT_SECRET=SubSentry_Chithra582_Project_Key_2024_!@#$ >> .env
)

echo Starting server...
echo API: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.

npm run dev
