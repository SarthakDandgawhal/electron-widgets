@echo off
echo Building Win11 Widgets Electron App...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not available.
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        exit /b 1
    )
)

REM Build TypeScript and Vite
echo Building TypeScript and Vite...
npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed
    exit /b 1
)

REM Build Electron app
echo Building Electron app with electron-builder...
npm run dist:win
if %errorlevel% neq 0 (
    echo Error: Electron build failed
    exit /b 1
)

echo.
echo Build completed successfully!
echo Output files are in the 'release' directory:
for /r release %%f in (*.exe) do (
    echo   %%f
)