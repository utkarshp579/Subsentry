@echo off
echo ========================================
echo Starting MongoDB
echo ========================================

REM Create data directory if it doesn't exist
if not exist "C:\data\db" (
    echo Creating C:\data\db directory...
    mkdir C:\data\db
)

echo Starting MongoDB on port 27017...
echo Data directory: C:\data\db
echo.
echo Press Ctrl+C to stop MongoDB
echo.

mongod --dbpath "C:\data\db"