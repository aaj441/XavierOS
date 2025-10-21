# 🤖 Automated Deployment Scripts

## Three Deployment Options

### 1. **Quick Deploy** (Recommended)
**File:** `quick-deploy.ps1`

**What it does:**
- Automatic git add/commit/push
- No prompts
- Auto-opens Railway dashboard
- Takes 10 seconds

**Usage:**
```powershell
.\quick-deploy.ps1
```

---

### 2. **Interactive Deploy**
**File:** `deploy.ps1`

**What it does:**
- Shows git status first
- Asks for confirmation
- Custom commit message option
- More control

**Usage:**
```powershell
.\deploy.ps1
```

---

### 3. **Full Auto Deploy**
**File:** `auto-deploy.ps1`

**What it does:**
- Complete automation
- Error handling
- Status reporting
- Opens Railway dashboard

**Usage:**
```powershell
.\auto-deploy.ps1
```

---

### 4. **Watch Deployment**
**File:** `watch-deploy.ps1`

**What it does:**
- Monitors Railway URL
- Reports when live
- Auto-opens app when ready
- 5-minute timeout

**Usage:**
```powershell
.\watch-deploy.ps1
# Enter your Railway URL when prompted
```

---

## 🚀 Complete Workflow (Fully Automated)

### One-Command Deploy + Monitor:

```powershell
# Deploy
.\auto-deploy.ps1

# Then immediately run (in new terminal)
.\watch-deploy.ps1
```

**Result:**
- Deploys in terminal 1
- Monitors in terminal 2
- Opens app automatically when live
- Total hands-off: 3-4 minutes

---

## ⚡ Ultra-Fast Deploy (10 Seconds)

```powershell
.\quick-deploy.ps1
```

**Done!** Railway is deploying. Visit dashboard to watch.

---

## 🔄 Continuous Deployment (Git Hooks)

### Auto-deploy on every commit:

**Create:** `.git/hooks/post-commit`

```bash
#!/bin/bash
echo "🚀 Auto-pushing to Railway..."
git push origin main
echo "✅ Deployed!"
```

**Make executable:**
```bash
chmod +x .git/hooks/post-commit
```

**Now every commit auto-deploys!**

---

## 📋 Deployment Checklist

All scripts check for:
- ✅ Git repository exists
- ✅ Changes are staged
- ✅ Commit created
- ✅ Push succeeds
- ✅ Railway notified

They will:
- ⚠️ Warn if issues found
- ❌ Stop if errors occur
- 💡 Suggest fixes
- 🔗 Open relevant dashboards

---

## 🎯 Which Script to Use?

**For daily development:**
```powershell
.\quick-deploy.ps1
```

**For important releases:**
```powershell
.\deploy.ps1
# (allows custom commit message)
```

**For automation/CI:**
```powershell
.\auto-deploy.ps1
```

**To monitor status:**
```powershell
.\watch-deploy.ps1
```

---

## 🐛 Troubleshooting

### "Script cannot be loaded"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Git push failed"
```powershell
git pull origin main --rebase
.\auto-deploy.ps1
```

### "Not in git repository"
```powershell
git init
git remote add origin https://github.com/aaj441/Lucy.git
git branch -M main
.\auto-deploy.ps1
```

---

## 🎨 Cursor Integration

In Cursor, you can just say:

```
@cursor Run quick-deploy.ps1 to deploy to Railway
```

Or create a task:
```
@cursor Deploy latest changes to Railway
```

Cursor will execute the script automatically!

---

## ⚙️ Advanced: Railway CLI (Optional)

Install Railway CLI for even more automation:

```powershell
# Install
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy directly
railway up

# Watch logs
railway logs
```

---

## 📊 Deployment Status Codes

Scripts report these statuses:

- ✅ `Success` - All operations completed
- ⏳ `In Progress` - Railway building
- ⚠️ `Warning` - Non-critical issue
- ❌ `Failed` - Critical error, deployment stopped

---

## 🎯 Pro Tips

1. **Before deploying:**
   - Test locally: `pnpm dev`
   - Check for errors: `pnpm typecheck`

2. **After deploying:**
   - Watch Railway logs
   - Test all routes
   - Check console for errors

3. **If deployment fails:**
   - Check Railway dashboard logs
   - Verify PostgreSQL database added
   - Check environment variables
   - Review RAILWAY_FIX_APPLIED.md

---

**All scripts are ready to use! Just run `.\auto-deploy.ps1` for fully automated deployment.** 🤖🚀

