# XavierOS/Lucy Automated Railway Deployment Script
# PowerShell version for Windows

Write-Host "🚀 XavierOS/Lucy Automated Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$ProjectDir = "A5-Browser-Use-v.0.0.5\A5-Browser-Use-v.0.0.5\Blue Ocean Explorer"
$CurrentDir = Get-Location

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "⚠️  Not in project directory. Navigating..." -ForegroundColor Yellow
    Set-Location $ProjectDir
}

Write-Host "📂 Project Directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 1: Check Git status
Write-Host "🔍 Step 1: Checking Git status..." -ForegroundColor Cyan
git status --short

Write-Host ""
$continue = Read-Host "Continue with deployment? (Y/n)"
if ($continue -eq "n" -or $continue -eq "N") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

# Step 2: Add all changes
Write-Host ""
Write-Host "📦 Step 2: Staging all changes..." -ForegroundColor Cyan
git add .
Write-Host "✅ Files staged" -ForegroundColor Green

# Step 3: Commit
Write-Host ""
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy: XavierOS updates with Bold Modern theme $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "💾 Step 3: Creating commit..." -ForegroundColor Cyan
git commit -m "$commitMessage"
Write-Host "✅ Commit created" -ForegroundColor Green

# Step 4: Push to remote
Write-Host ""
Write-Host "🌐 Step 4: Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    Write-Host "💡 Try: git pull origin main --rebase" -ForegroundColor Yellow
    exit 1
}

# Step 5: Wait and monitor
Write-Host ""
Write-Host "⏳ Step 5: Railway is now deploying..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Deployment Timeline:" -ForegroundColor Yellow
Write-Host "   • Railway detects push: ~10 seconds" -ForegroundColor White
Write-Host "   • Build starts: Immediately" -ForegroundColor White
Write-Host "   • Build completes: ~2-3 minutes" -ForegroundColor White
Write-Host "   • App starts: ~10-20 seconds" -ForegroundColor White
Write-Host "   • Total: ~3-4 minutes" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Go to Railway dashboard" -ForegroundColor White
Write-Host "   2. Click 'Deployments' to watch build logs" -ForegroundColor White
Write-Host "   3. Wait for ✅ 'Deployed' status" -ForegroundColor White
Write-Host "   4. Visit your app URL" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  CRITICAL: Ensure PostgreSQL database is added in Railway!" -ForegroundColor Yellow
Write-Host "   Railway → New → Database → Add PostgreSQL" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Deployment initiated successfully!" -ForegroundColor Green
Write-Host "🌐 Your app will be live in ~3-4 minutes" -ForegroundColor Green
Write-Host ""

# Optional: Open Railway dashboard
$openDashboard = Read-Host "Open Railway dashboard in browser? (Y/n)"
if ($openDashboard -ne "n" -and $openDashboard -ne "N") {
    Start-Process "https://railway.app/dashboard"
}

Write-Host ""
Write-Host "✨ Done! Watch Railway for deployment status." -ForegroundColor Cyan

