# MERGE AND DEPLOY - Keeps both your code and Lucy repo code
# Safer option that preserves existing Lucy repo content

Write-Host ""
Write-Host "MERGE AND DEPLOY" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

# Check we're in project
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run from project directory!" -ForegroundColor Red
    exit 1
}

Write-Host "This will merge your code with existing Lucy repo content." -ForegroundColor Yellow
Write-Host ""

# Resolve conflicts by taking our version
Write-Host "[1/5] Resolving conflicts (using our version)..." -ForegroundColor Yellow

# For each conflicted file, take ours
$conflictedFiles = @(
    "package.json",
    "tailwind.config.mjs",
    "scripts/check-code",
    "scripts/run",
    "scripts/stop"
)

foreach ($file in $conflictedFiles) {
    if (Test-Path $file) {
        git checkout --ours $file
        git add $file
    }
}

Write-Host "      Conflicts resolved" -ForegroundColor Green

# Complete the merge
Write-Host "[2/5] Completing merge..." -ForegroundColor Yellow
git add -A
git commit --no-edit -m "Merge: XavierOS with Lucy repo, resolve conflicts"
Write-Host "      Done" -ForegroundColor Green

# Push
Write-Host "[3/5] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Done!" -ForegroundColor Green
    $pushSuccess = $true
} else {
    Write-Host "      Failed!" -ForegroundColor Red
    $pushSuccess = $false
}

if ($pushSuccess) {
    Write-Host "[4/5] Railway deployment triggered..." -ForegroundColor Yellow
    Write-Host "      Railway building from GitHub" -ForegroundColor Green
    
    Write-Host "[5/5] Opening dashboard..." -ForegroundColor Yellow
    Start-Process "https://railway.app/dashboard"
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Code merged and pushed" -ForegroundColor White
    Write-Host "  Railway deploying (3-4 min)" -ForegroundColor White
    Write-Host ""
    Write-Host "REMINDER: Add PostgreSQL in Railway!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed. Try FORCE_DEPLOY.ps1 instead." -ForegroundColor Yellow
}

