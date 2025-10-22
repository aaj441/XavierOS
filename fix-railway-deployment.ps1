# Fix Railway Deployment - Move XavierOS to Repository Root
Write-Host "🔧 Fixing Railway Deployment Structure..." -ForegroundColor Green

# Check if we're in the right directory
if (Test-Path "A5-Browser-Use-v.0.0.5") {
    Write-Host "✓ Found XavierOS files" -ForegroundColor Green
    
    # Create a backup of current structure
    Write-Host "📦 Creating backup..." -ForegroundColor Yellow
    Copy-Item -Path "A5-Browser-Use-v.0.0.5" -Destination "backup-A5-Browser-Use" -Recurse
    
    # Move XavierOS files to root
    Write-Host "🚀 Moving XavierOS files to repository root..." -ForegroundColor Yellow
    $xavierosPath = "A5-Browser-Use-v.0.0.5\A5-Browser-Use-v.0.0.5\Blue Ocean Explorer"
    
    if (Test-Path $xavierosPath) {
        # Copy all XavierOS files to current directory
        Copy-Item -Path "$xavierosPath\*" -Destination "." -Recurse -Force
        
        Write-Host "✅ XavierOS files moved to repository root!" -ForegroundColor Green
        Write-Host "📝 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Commit and push changes: git add . && git commit -m 'Move XavierOS to root' && git push" -ForegroundColor White
        Write-Host "   2. Redeploy on Railway" -ForegroundColor White
    } else {
        Write-Host "❌ XavierOS path not found: $xavierosPath" -ForegroundColor Red
    }
} else {
    Write-Host "❌ A5-Browser-Use-v.0.0.5 directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the Documents directory" -ForegroundColor Yellow
}