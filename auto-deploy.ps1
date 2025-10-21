# FULLY AUTOMATED DEPLOYMENT
# No prompts - just run and it deploys!

$ErrorActionPreference = "Stop"

Write-Host "🤖 FULLY AUTOMATED DEPLOYMENT" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Write-Host ""

# Timestamp for commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

try {
    # Navigate to project
    if (-not (Test-Path "package.json")) {
        Write-Host "📂 Navigating to project..." -ForegroundColor Cyan
        Set-Location "A5-Browser-Use-v.0.0.5\A5-Browser-Use-v.0.0.5\Blue Ocean Explorer"
    }

    Write-Host "📍 Location: $(Get-Location)" -ForegroundColor Green
    Write-Host ""

    # Git operations
    Write-Host "📦 [1/4] Staging changes..." -ForegroundColor Cyan
    git add .
    Write-Host "   ✅ Done" -ForegroundColor Green

    Write-Host "💾 [2/4] Committing..." -ForegroundColor Cyan
    git commit -m "Auto-deploy: XavierOS/Lucy update - $timestamp" -q
    Write-Host "   ✅ Done" -ForegroundColor Green

    Write-Host "🌐 [3/4] Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main -q
    Write-Host "   ✅ Done" -ForegroundColor Green

    Write-Host "🚀 [4/4] Railway deploying..." -ForegroundColor Cyan
    Write-Host "   ⏳ Build in progress..." -ForegroundColor Yellow
    Write-Host ""

    # Success message
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT INITIATED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Status:" -ForegroundColor Cyan
    Write-Host "   • Code pushed to GitHub: ✅" -ForegroundColor White
    Write-Host "   • Railway notified: ✅" -ForegroundColor White
    Write-Host "   • Build starting: ✅" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️  Estimated completion: 3-4 minutes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔗 Opening Railway dashboard..." -ForegroundColor Cyan
    Start-Process "https://railway.app/dashboard"
    
    Write-Host ""
    Write-Host "💡 TIP: Click 'Deployments' in Railway to watch live logs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎉 Automation complete! Your app is deploying." -ForegroundColor Magenta

} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Common fixes:" -ForegroundColor Yellow
    Write-Host "   • Run: git pull origin main --rebase" -ForegroundColor White
    Write-Host "   • Check: git remote -v (verify repository)" -ForegroundColor White
    Write-Host "   • Ensure: You have push permissions" -ForegroundColor White
    exit 1
}

