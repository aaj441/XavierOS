# Universal Railway Deployment Fix Script
# This script fixes the most common Railway deployment issues

Write-Host "🚀 Universal Railway Deployment Fix" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Commit and push current changes
Write-Host "📝 Step 1: Committing XavierOS files to repository..." -ForegroundColor Yellow
git add .
git commit -m "Move XavierOS to repository root for Railway deployment"
git push origin main

Write-Host "✅ XavierOS files committed and pushed!" -ForegroundColor Green

# Step 2: Create Railway configuration files for all apps
Write-Host "🔧 Step 2: Creating Railway configuration files..." -ForegroundColor Yellow

# Create a universal nixpacks.toml
@"
[phases.setup]
nixPkgs = ["python3", "python3-pip"]

[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm prisma generate", "pnpm build"]

[start]
cmd = "pnpm start"
"@ | Out-File -FilePath "nixpacks.toml" -Encoding UTF8

# Create a universal railway.json
@"
{
  "`$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm prisma generate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
"@ | Out-File -FilePath "railway.json" -Encoding UTF8

# Create a universal .railwayrc
@"
# Railway Build Configuration
node_version=20
package_manager=pnpm
build_command=pnpm install && pnpm prisma generate && pnpm build
start_command=pnpm start
"@ | Out-File -FilePath ".railwayrc" -Encoding UTF8

Write-Host "✅ Railway configuration files created!" -ForegroundColor Green

# Step 3: Commit Railway configs
Write-Host "📝 Step 3: Committing Railway configuration..." -ForegroundColor Yellow
git add nixpacks.toml railway.json .railwayrc
git commit -m "Add Railway deployment configuration"
git push origin main

Write-Host "✅ Railway configuration committed!" -ForegroundColor Green

# Step 4: Instructions for Railway Dashboard
Write-Host "🎯 Step 4: Railway Dashboard Setup Instructions" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For EACH of your 8 Railway deployments:" -ForegroundColor White
Write-Host ""
Write-Host "1. Go to Railway Dashboard" -ForegroundColor Yellow
Write-Host "2. Click on each project" -ForegroundColor Yellow
Write-Host "3. Go to Settings > Environment Variables" -ForegroundColor Yellow
Write-Host "4. Add these REQUIRED variables:" -ForegroundColor Yellow
Write-Host "   - NODE_ENV = production" -ForegroundColor White
Write-Host "   - ADMIN_PASSWORD = [your admin password]" -ForegroundColor White
Write-Host "   - JWT_SECRET = [random secret string]" -ForegroundColor White
Write-Host "   - OPENROUTER_API_KEY = [your OpenRouter API key]" -ForegroundColor White
Write-Host ""
Write-Host "5. Go to Settings > Database" -ForegroundColor Yellow
Write-Host "6. Add PostgreSQL database" -ForegroundColor Yellow
Write-Host "7. Click 'Deploy' to trigger new deployment" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ After setup, all 8 deployments should work!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Repository: https://github.com/aaj441/XavierOS" -ForegroundColor Cyan
Write-Host "📋 Branch: main" -ForegroundColor Cyan
