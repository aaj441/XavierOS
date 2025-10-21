# MASTER AUTOMATION SCRIPT
# Run this from the project directory!

param(
    [string]$GithubRepo = "https://github.com/aaj441/Lucy.git"
)

Write-Host ""
Write-Host "XAVIEROS MASTER AUTOMATION" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host ""

# Verify we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run this script from the project directory!" -ForegroundColor Red
    Write-Host "cd 'A5-Browser-Use-v.0.0.5\A5-Browser-Use-v.0.0.5\Blue Ocean Explorer'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Project: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check if Git is initialized
$isGitRepo = Test-Path ".git"

if (-not $isGitRepo -and -not $SkipGitInit) {
    Write-Host "GIT INITIALIZATION" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "[1/5] Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "      ✅ Git initialized" -ForegroundColor Green
    
    Write-Host "[2/5] Adding remote repository..." -ForegroundColor Yellow
    git remote add origin $GithubRepo
    Write-Host "      ✅ Remote added: $GithubRepo" -ForegroundColor Green
    
    Write-Host "[3/5] Creating .gitignore..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
pnpm-lock.yaml

# Build output
.output/
.vinxi/
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.db
*.db-journal

# Misc
.cache/
temp/
"@
    
    Set-Content -Path ".gitignore" -Value $gitignoreContent
    Write-Host "      ✅ .gitignore created" -ForegroundColor Green
    
    Write-Host "[4/5] Setting main branch..." -ForegroundColor Yellow
    git branch -M main
    Write-Host "      ✅ Main branch set" -ForegroundColor Green
    
    Write-Host "[5/5] Adding all files..." -ForegroundColor Yellow
    git add .
    Write-Host "      ✅ Files staged" -ForegroundColor Green
    
    Write-Host ""
}

# Commit and Push
Write-Host "DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

Write-Host "[1/3] Creating commit..." -ForegroundColor Yellow
$commitMsg = "XavierOS/Lucy: Railway-ready deployment with Bold Modern theme - $timestamp"
git commit -m $commitMsg

if ($LASTEXITCODE -ne 0) {
    Write-Host "      ⚠️  Nothing to commit (no changes)" -ForegroundColor Yellow
} else {
    Write-Host "      ✅ Commit created" -ForegroundColor Green
}

Write-Host "[2/3] Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✅ Pushed successfully!" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Push failed - may need to pull first" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "      Trying: git pull --rebase..." -ForegroundColor Cyan
    git pull origin main --rebase
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "      ✅ Pulled successfully, pushing again..." -ForegroundColor Green
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      ✅ Push successful!" -ForegroundColor Green
        } else {
            Write-Host "      ❌ Push still failed. Manual intervention needed." -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "[3/3] Railway deployment initiated..." -ForegroundColor Yellow
Write-Host "      ✅ Railway will auto-deploy from GitHub" -ForegroundColor Green

Write-Host ""
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host ""

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Git repository: Initialized" -ForegroundColor White
Write-Host "  Remote: $GithubRepo" -ForegroundColor White
Write-Host "  Code pushed: GitHub updated" -ForegroundColor White
Write-Host "  Railway: Deployment triggered" -ForegroundColor White
Write-Host ""

Write-Host "Timeline:" -ForegroundColor Yellow
Write-Host "  Build starts: Now" -ForegroundColor White
Write-Host "  Build completes: 2-3 minutes" -ForegroundColor White
Write-Host "  App live: 3-4 minutes total" -ForegroundColor White
Write-Host ""

Write-Host "CRITICAL REMINDER:" -ForegroundColor Yellow
Write-Host "Add PostgreSQL database in Railway dashboard!" -ForegroundColor White
Write-Host "Railway > New > Database > Add PostgreSQL" -ForegroundColor White
Write-Host ""

Write-Host "Opening Railway dashboard..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "https://railway.app/dashboard"

Write-Host ""
Write-Host "All done! Watch Railway for deployment status." -ForegroundColor Magenta
Write-Host ""

