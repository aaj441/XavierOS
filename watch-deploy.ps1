# Watch Railway Deployment Status
# Monitors and reports when deployment is complete

Write-Host "👁️  Railway Deployment Monitor" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$railwayUrl = Read-Host "Enter your Railway app URL (e.g., https://your-app.up.railway.app)"

if ([string]::IsNullOrWhiteSpace($railwayUrl)) {
    Write-Host "❌ URL required" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Monitoring deployment..." -ForegroundColor Yellow
Write-Host "🔗 App URL: $railwayUrl" -ForegroundColor Cyan
Write-Host ""

$maxAttempts = 60  # 5 minutes (60 * 5 seconds)
$attempt = 0
$deployed = $false

while ($attempt -lt $maxAttempts -and -not $deployed) {
    $attempt++
    $elapsed = $attempt * 5
    
    try {
        $response = Invoke-WebRequest -Uri $railwayUrl -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "🌐 App is live at: $railwayUrl" -ForegroundColor Green
            Write-Host "⏱️  Total time: $elapsed seconds" -ForegroundColor Cyan
            $deployed = $true
            
            # Open in browser
            Start-Process $railwayUrl
            break
        }
    } catch {
        Write-Host "⏳ [$elapsed sec] Still deploying... (Attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if (-not $deployed) {
    Write-Host ""
    Write-Host "⚠️  Deployment taking longer than expected (5+ minutes)" -ForegroundColor Yellow
    Write-Host "💡 Check Railway dashboard for build logs" -ForegroundColor Cyan
    Write-Host "🔗 Opening dashboard..." -ForegroundColor Cyan
    Start-Process "https://railway.app/dashboard"
}

Write-Host ""
Write-Host "✨ Monitor complete" -ForegroundColor Cyan

