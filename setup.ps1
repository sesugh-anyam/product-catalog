# Product Catalog Setup Script for Windows PowerShell
# This script helps set up the development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Product Catalog - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
    
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 20) {
        Write-Host "⚠ Warning: Node.js 20+ is required. Please upgrade." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check pnpm
Write-Host "Checking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✓ pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ pnpm is not installed. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✓ pnpm installed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Running: pnpm install" -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Setup environment files
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Environment Files" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Backend .env
$backendEnvPath = "packages\backend\.env"
if (-not (Test-Path $backendEnvPath)) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item "packages\backend\.env.example" $backendEnvPath
    Write-Host "✓ Created $backendEnvPath" -ForegroundColor Green
    Write-Host "⚠ IMPORTANT: Edit $backendEnvPath with your MongoDB URI and JWT secret!" -ForegroundColor Yellow
} else {
    Write-Host "✓ Backend .env already exists" -ForegroundColor Green
}

# Frontend .env
$frontendEnvPath = "packages\frontend\.env"
if (-not (Test-Path $frontendEnvPath)) {
    Write-Host "Creating frontend .env file..." -ForegroundColor Yellow
    Copy-Item "packages\frontend\.env.example" $frontendEnvPath
    Write-Host "✓ Created $frontendEnvPath" -ForegroundColor Green
} else {
    Write-Host "✓ Frontend .env already exists" -ForegroundColor Green
}

Write-Host ""

# Build shared package
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Shared Package" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building shared package..." -ForegroundColor Yellow
Set-Location packages\shared
pnpm run build
Set-Location ..\..

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build shared package" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Shared package built successfully" -ForegroundColor Green
Write-Host ""

# Final instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure your environment variables:" -ForegroundColor White
Write-Host "   - Edit packages\backend\.env with your MongoDB URI" -ForegroundColor Gray
Write-Host "   - Edit packages\backend\.env with a secure JWT_SECRET" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get MongoDB URI:" -ForegroundColor White
Write-Host "   - Go to https://www.mongodb.com/cloud/atlas" -ForegroundColor Gray
Write-Host "   - Create a free cluster" -ForegroundColor Gray
Write-Host "   - Get connection string and add to .env" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start development server:" -ForegroundColor White
Write-Host "   pnpm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed setup instructions, see SETUP.md" -ForegroundColor Yellow
Write-Host "For quick reference, see QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
