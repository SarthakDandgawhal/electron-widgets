<# 
.SYNOPSIS
    Build script for Win11 Widgets Electron app

.DESCRIPTION
    Builds the Electron app for Windows (NSIS installer + Portable)

.PARAMETER Target
    Build target: 'win', 'mac', 'linux', 'all'

.PARAMETER Configuration
    Build configuration: 'Release' (default) or 'Debug'

.EXAMPLE
    .\build.ps1
    .\build.ps1 -Target win
    .\build.ps1 -Target all -Configuration Debug
#>

param(
    [ValidateSet('win', 'mac', 'linux', 'all')]
    [string]$Target = 'win',
    
    [ValidateSet('Release', 'Debug')]
    [string]$Configuration = 'Release'
)

Write-Host "Building Win11 Widgets Electron App..." -ForegroundColor Cyan
Write-Host "Target: $Target" -ForegroundColor Gray
Write-Host "Configuration: $Configuration" -ForegroundColor Gray

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not available. Please install Node.js which includes npm."
    exit 1
}

$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Gray

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

# Build TypeScript and Vite
Write-Host "Building TypeScript and Vite..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
}

# Build Electron app
Write-Host "Building Electron app with electron-builder..." -ForegroundColor Yellow

switch ($Target) {
    'win' {
        npm run dist:win
    }
    'mac' {
        npm run dist:mac
    }
    'linux' {
        npm run dist:linux
    }
    'all' {
        npm run dist
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Electron build failed"
    exit 1
}

Write-Host "`nBuild completed successfully!" -ForegroundColor Green
Write-Host "Output files are in the 'release' directory:" -ForegroundColor Gray

Get-ChildItem -Path "release" -Recurse -File | Where-Object { $_.Extension -in @('.exe', '.dmg', '.AppImage', '.msi') } | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 1)
    Write-Host "  $($_.FullName) ($size MB)" -ForegroundColor Cyan
}