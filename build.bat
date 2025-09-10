@echo off
ECHO ===================================
ECHO HNSBrowser Build Script
ECHO ===================================

ECHO.
ECHO Step 1: Building Windows application...
ECHO This may take a few minutes.
ECHO.

REM Build Windows app
CALL npm run dist -- --win

ECHO.
ECHO Windows build complete.
ECHO ===================================
ECHO.
ECHO Step 2: Building Linux application using Docker...
ECHO Make sure Docker Desktop is running with Linux containers.
ECHO This may also take a few minutes.
ECHO.

REM Build Docker image for Linux
docker build -t hnsbrowser-builder .

REM Run container and map dist folder to host
docker run --rm -v "%cd%/dist:/app/dist" hnsbrowser-builder

ECHO.
ECHO Linux build complete.
ECHO ===================================
ECHO.
ECHO All builds are finished!
ECHO Check the 'dist' folder for your Windows and Linux builds.
ECHO.

PAUSE
