# DEPLOYMENT VERIFICATION SCRIPT
# Checks if everything deployed correctly

Write-Host ""
Write-Host "DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "[1/5] Git Status..." -ForegroundColor Yellow
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "      WARNING: Uncommitted changes" -ForegroundColor Yellow
    Write-Host $gitStatus
} else {
    Write-Host "      OK - All changes committed" -ForegroundColor Green
}

# Check remote
Write-Host ""
Write-Host "[2/5] Git Remote..." -ForegroundColor Yellow
$remote = git remote get-url origin
if ($remote -like "*aaj441/Lucy*") {
    Write-Host "      OK - Connected to Lucy repo" -ForegroundColor Green
    Write-Host "      $remote" -ForegroundColor White
} else {
    Write-Host "      WARNING: Unexpected remote" -ForegroundColor Yellow
    Write-Host "      $remote" -ForegroundColor White
}

# Check last commit
Write-Host ""
Write-Host "[3/5] Last Commit..." -ForegroundColor Yellow
$lastCommit = git log --oneline -1
Write-Host "      $lastCommit" -ForegroundColor White

# Check if pushed
Write-Host ""
Write-Host "[4/5] Push Status..." -ForegroundColor Yellow
$localCommit = git rev-parse main
$remoteCommit = git rev-parse origin/main

if ($localCommit -eq $remoteCommit) {
    Write-Host "      OK - Local and remote are in sync" -ForegroundColor Green
} else {
    Write-Host "      WARNING: Local ahead of remote" -ForegroundColor Yellow
    Write-Host "      Run: git push origin main" -ForegroundColor Cyan
}

# Check files exist
Write-Host ""
Write-Host "[5/5] Key Files..." -ForegroundColor Yellow

$keyFiles = @(
    "package.json",
    "prisma/schema.prisma",
    "railway.json",
    "src/routes/lucy/index.tsx",
    "src/routes/ebook-machine/index.tsx",
    "src/server/services/googleMapsService.ts",
    "src/server/services/hubspotService.ts",
    "src/server/services/emailService.ts"
)

$allPresent = $true
foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        Write-Host "      OK - $file" -ForegroundColor Green
    } else {
        Write-Host "      MISSING - $file" -ForegroundColor Red
        $allPresent = $false
    }
}

# Final verdict
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
if ($allPresent -and ($localCommit -eq $remoteCommit) -and ($remote -like "*aaj441/Lucy*")) {
    Write-Host "VERDICT: READY FOR RAILWAY" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your code is on GitHub and Railway is deploying!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Add PostgreSQL in Railway dashboard" -ForegroundColor White
    Write-Host "2. Wait 3-4 minutes for build" -ForegroundColor White
    Write-Host "3. Visit your Railway app URL" -ForegroundColor White
    Write-Host ""
    
    $openDashboard = Read-Host "Open Railway dashboard? (Y/n)"
    if ($openDashboard -ne "n" -and $openDashboard -ne "N") {
        Start-Process "https://railway.app/dashboard"
    }
} else {
    Write-Host "VERDICT: NEEDS ATTENTION" -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Some issues detected. Review above." -ForegroundColor Yellow
}

Write-Host ""

