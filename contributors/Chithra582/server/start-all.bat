@echo off
echo ========================================
echo Starting Complete SubSentry System
echo ========================================

echo [1] Starting MongoDB...
start cmd /k "cd /d %cd% && start-mongodb.bat"

timeout /t 3

echo [2] Starting API Server...
start cmd /k "cd /d %cd% && start-server.bat"

echo.
echo ✅ Both servers starting...
echo.
echo 📍 MongoDB:    localhost:27017
echo 📍 API Server: http://localhost:3000
echo.
echo 📚 Test endpoints:
echo    Health:    http://localhost:3000/health
echo    Rules:     http://localhost:3000/api/alerts/rules
echo.
pause