# FORCE DEPLOYMENT - Overwrites Lucy repo with current code
# USE WITH CAUTION: This replaces everything in the Lucy repo

Write-Host ""
Write-Host "FORCE DEPLOYMENT TO LUCY REPO" -ForegroundColor Red
Write-Host "=============================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will REPLACE all content in https://github.com/aaj441/Lucy" -ForegroundColor Yellow
Write-Host "with the current XavierOS/Blue Ocean Explorer code." -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Are you sure you want to continue? Type 'YES' to confirm"

if ($confirm -ne "YES") {
    Write-Host "Cancelled." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Proceeding with force deployment..." -ForegroundColor Red
Write-Host ""

# Check we're in project
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run from project directory!" -ForegroundColor Red
    exit 1
}

# Reset any merge state
Write-Host "[1/5] Cleaning up merge conflicts..." -ForegroundColor Yellow
git merge --abort 2>$null
git rebase --abort 2>$null
git reset --hard HEAD
Write-Host "      Done" -ForegroundColor Green

# Stage all files
Write-Host "[2/5] Staging all files..." -ForegroundColor Yellow
git add -A
Write-Host "      Done" -ForegroundColor Green

# Commit
Write-Host "[3/5] Creating commit..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "XavierOS complete: Lucy + eBook Machine + Bold Modern theme - $timestamp"
Write-Host "      Done" -ForegroundColor Green

# Force push
Write-Host "[4/5] Force pushing to GitHub..." -ForegroundColor Yellow
Write-Host "      WARNING: Overwriting remote repository..." -ForegroundColor Red
git push origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Done!" -ForegroundColor Green
} else {
    Write-Host "      Failed! Check authentication." -ForegroundColor Red
    exit 1
}

Write-Host "[5/5] Triggering Railway deployment..." -ForegroundColor Yellow
Write-Host "      Railway will auto-deploy from GitHub push" -ForegroundColor Green

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "========" -ForegroundColor Green
Write-Host ""
Write-Host "Your code is now deployed to:" -ForegroundColor Cyan
Write-Host "  GitHub: https://github.com/aaj441/Lucy" -ForegroundColor White
Write-Host "  Railway: Building now (3-4 minutes)" -ForegroundColor White
Write-Host ""
Write-Host "CRITICAL: Add PostgreSQL in Railway dashboard!" -ForegroundColor Yellow
Write-Host "  Railway > New > Database > Add PostgreSQL" -ForegroundColor White
Write-Host ""

Start-Process "https://railway.app/dashboard"

Write-Host "Opening Railway dashboard..." -ForegroundColor Cyan
Write-Host ""

