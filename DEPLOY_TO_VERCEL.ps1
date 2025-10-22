# AUTOMATED VERCEL DEPLOYMENT
# Connects your Lucy/XavierOS code to Vercel

Write-Host ""
Write-Host "VERCEL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""

# Check we're in project
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run from project directory!" -ForegroundColor Red
    exit 1
}

Write-Host "Project: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Install Vercel CLI if not present
Write-Host "[1/5] Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "      Installing Vercel CLI..." -ForegroundColor Cyan
    npm install -g vercel
    Write-Host "      Done" -ForegroundColor Green
} else {
    Write-Host "      Already installed" -ForegroundColor Green
}

# Login to Vercel
Write-Host ""
Write-Host "[2/5] Vercel login..." -ForegroundColor Yellow
Write-Host "      Opening browser for authentication..." -ForegroundColor Cyan
vercel login

# Link to existing project
Write-Host ""
Write-Host "[3/5] Linking to xavier-os project..." -ForegroundColor Yellow
vercel link --project xavier-os --yes

# Deploy
Write-Host ""
Write-Host "[4/5] Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Done!" -ForegroundColor Green
    $deploySuccess = $true
} else {
    Write-Host "      Failed!" -ForegroundColor Red
    $deploySuccess = $false
}

# Summary
Write-Host ""
Write-Host "[5/5] Deployment complete!" -ForegroundColor Yellow

if ($deploySuccess) {
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "========" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is deployed to Vercel!" -ForegroundColor White
    Write-Host ""
    Write-Host "Visit: https://xavier-os.vercel.app" -ForegroundColor Cyan
    Write-Host "Or your custom domain shown above" -ForegroundColor White
    Write-Host ""
    
    Start-Process "https://vercel.com/aaron-johnsons-projects-d46f160a/xavier-os"
} else {
    Write-Host ""
    Write-Host "Deployment had issues. Check Vercel dashboard." -ForegroundColor Yellow
    Start-Process "https://vercel.com/aaron-johnsons-projects-d46f160a/xavier-os"
}

