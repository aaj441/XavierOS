#!/bin/bash
# XavierOS/Lucy Automated Railway Deployment Script
# Bash version for Mac/Linux

echo "🚀 XavierOS/Lucy Automated Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Not in project directory. Please cd to project root${NC}"
    exit 1
fi

echo -e "${GREEN}📂 Project Directory: $(pwd)${NC}"
echo ""

# Step 1: Check Git status
echo -e "${CYAN}🔍 Step 1: Checking Git status...${NC}"
git status --short

echo ""
read -p "Continue with deployment? (Y/n): " continue
if [ "$continue" = "n" ] || [ "$continue" = "N" ]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 0
fi

# Step 2: Add all changes
echo ""
echo -e "${CYAN}📦 Step 2: Staging all changes...${NC}"
git add .
echo -e "${GREEN}✅ Files staged${NC}"

# Step 3: Commit
echo ""
read -p "Enter commit message (or press Enter for default): " commitMessage
if [ -z "$commitMessage" ]; then
    commitMessage="Deploy: XavierOS updates with Bold Modern theme $(date +'%Y-%m-%d %H:%M')"
fi

echo -e "${CYAN}💾 Step 3: Creating commit...${NC}"
git commit -m "$commitMessage"
echo -e "${GREEN}✅ Commit created${NC}"

# Step 4: Push to remote
echo ""
echo -e "${CYAN}🌐 Step 4: Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "${RED}❌ Git push failed!${NC}"
    echo -e "${YELLOW}💡 Try: git pull origin main --rebase${NC}"
    exit 1
fi

# Step 5: Deployment info
echo ""
echo -e "${CYAN}⏳ Step 5: Railway is now deploying...${NC}"
echo ""
echo -e "${YELLOW}📊 Deployment Timeline:${NC}"
echo -e "   • Railway detects push: ~10 seconds"
echo -e "   • Build starts: Immediately"
echo -e "   • Build completes: ~2-3 minutes"
echo -e "   • App starts: ~10-20 seconds"
echo -e "   • Total: ~3-4 minutes"
echo ""

echo -e "${YELLOW}🔗 Next Steps:${NC}"
echo -e "   1. Go to Railway dashboard"
echo -e "   2. Click 'Deployments' to watch build logs"
echo -e "   3. Wait for ✅ 'Deployed' status"
echo -e "   4. Visit your app URL"
echo ""

echo -e "${YELLOW}⚠️  CRITICAL: Ensure PostgreSQL database is added in Railway!${NC}"
echo -e "   Railway → New → Database → Add PostgreSQL"
echo ""

echo -e "${GREEN}🎉 Deployment initiated successfully!${NC}"
echo -e "${GREEN}🌐 Your app will be live in ~3-4 minutes${NC}"
echo ""

# Optional: Open Railway dashboard
read -p "Open Railway dashboard in browser? (Y/n): " openBrowser
if [ "$openBrowser" != "n" ] && [ "$openBrowser" != "N" ]; then
    if command -v open &> /dev/null; then
        open "https://railway.app/dashboard"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://railway.app/dashboard"
    else
        echo "Please open: https://railway.app/dashboard"
    fi
fi

echo ""
echo -e "${CYAN}✨ Done! Watch Railway for deployment status.${NC}"

