# Ultra-Quick Deploy Script (No Prompts)
# Automatically deploys with timestamp commit

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"

Write-Host "🚀 Quick Deploy to Railway" -ForegroundColor Cyan
Write-Host ""

# Navigate to project if needed
if (-not (Test-Path "package.json")) {
    Set-Location "A5-Browser-Use-v.0.0.5\A5-Browser-Use-v.0.0.5\Blue Ocean Explorer"
}

# Git workflow
Write-Host "📦 Adding files..." -ForegroundColor Yellow
git add .

Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m "Deploy: XavierOS update $timestamp"

Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployed successfully!" -ForegroundColor Green
    Write-Host "⏳ Railway is building... (~3 mins)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Opening Railway dashboard..." -ForegroundColor Cyan
    Start-Process "https://railway.app/dashboard"
} else {
    Write-Host ""
    Write-Host "❌ Push failed! Check git status" -ForegroundColor Red
}

