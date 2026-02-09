@echo off
echo ========================================
echo   Oftisoft Backend - Quick Start
echo ========================================
echo.

echo [1/3] Checking PostgreSQL database...
psql -U postgres -lqt | findstr oftisoft_db >nul 2>&1
if %errorlevel% neq 0 (
    echo Database not found. Creating oftisoft_db...
    psql -U postgres -c "CREATE DATABASE oftisoft_db;"
    if %errorlevel% equ 0 (
        echo ✓ Database created successfully!
    ) else (
        echo ✗ Failed to create database. Please create manually:
        echo   psql -U postgres -c "CREATE DATABASE oftisoft_db;"
    )
) else (
    echo ✓ Database already exists!
)

echo.
echo [2/3] Installing dependencies...
call npm install

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo   Backend running at: http://localhost:5000
echo   API endpoints at: http://localhost:5000/api
echo ========================================
echo.

call npm run start:dev
