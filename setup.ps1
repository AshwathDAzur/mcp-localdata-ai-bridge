# PowerShell setup script for MCP SQL Server Server
# Run this script to set up the project

Write-Host "MCP SQL Server Server Setup" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion) {
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version
if ($dockerVersion) {
    Write-Host "Docker: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Dependencies installed successfully" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "Setting up environment file..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created from .env.example" -ForegroundColor Green
} else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

# Build the project
Write-Host ""
Write-Host "Building TypeScript project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "Build completed successfully" -ForegroundColor Green

# Start Docker container
Write-Host ""
Write-Host "Starting SQL Server container..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start Docker container" -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for SQL Server to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check if container is running
$containerRunning = docker ps --filter "name=mcp-sqlserver" --format "{{.Names}}"
if ($containerRunning) {
    Write-Host "SQL Server container is running" -ForegroundColor Green
} else {
    Write-Host "WARNING: SQL Server container may not be running. Check with: docker ps" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure Cursor IDE with the MCP server (see README.md)" -ForegroundColor White
Write-Host "2. Restart Cursor IDE" -ForegroundColor White
Write-Host "3. Start asking questions about your database!" -ForegroundColor White
Write-Host ""
Write-Host "To view SQL Server logs: docker logs mcp-sqlserver" -ForegroundColor Gray
Write-Host "To stop SQL Server: docker-compose down" -ForegroundColor Gray

