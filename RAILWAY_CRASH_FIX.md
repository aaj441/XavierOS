# Railway Crash Troubleshooting Guide

## 🚨 Common Railway Crash Causes & Fixes

### Issue #1: Prisma Migration Failure (MOST COMMON)

**Error in logs:**
```
Error: P1001: Can't reach database server at `...`
or
Prisma schema not found
```

**Fix:**
Railway needs environment variable for database:

1. In Railway dashboard, click your project
2. Go to "Variables" tab
3. Add a PostgreSQL database:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-sets `DATABASE_URL`
4. Redeploy

---

### Issue #2: PostInstall Script Failure

**Error in logs:**
```
prisma generate failed
or
tsr generate failed
```

**Fix - Option A: Simplify postinstall**

Edit `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "tsr generate && vinxi build",
  }
}
```

**Fix - Option B: Remove postinstall entirely**

```json
{
  "scripts": {
    "build": "prisma generate && tsr generate && vinxi build",
    "start": "vinxi start"
  }
}
```

---

### Issue #3: Missing Dependencies

**Error in logs:**
```
Cannot find module '@tailwindcss/forms'
or
Module not found
```

**Fix:**

Ensure Tailwind plugins are in `dependencies` not `devDependencies`:

```json
{
  "dependencies": {
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.16",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1"
  }
}
```

---

### Issue #4: Node Version Mismatch

**Error in logs:**
```
Unsupported engine
or
Node version incompatible
```

**Fix:**

Add to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

### Issue #5: Build Command Not Found

**Error in logs:**
```
pnpm: command not found
```

**Fix:**

Create `pnpm-lock.yaml` in root (you already have this)

Or add to root directory:

**.npmrc**
```
package-manager=pnpm@8.0.0
```

---

## 🔍 How to Diagnose

### Step 1: Check Railway Logs

1. Go to Railway dashboard
2. Click your project
3. Click "Deployments"
4. Click the failed deployment
5. Read the **build logs** and **deploy logs**
6. Look for the error message

### Step 2: Look for These Keywords

- **"Prisma"** → Database issue
- **"Cannot find module"** → Missing dependency
- **"postinstall"** → Script failure
- **"ELIFECYCLE"** → Build script error
- **"port"** → Port binding issue

---

## ✅ Quick Fix: Minimal Railway Config

Create this file to ensure Railway knows how to build:

**File:** `railway.json` (new file in root)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
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
```

---

## 🚀 Nuclear Option: Simplified Build

If nothing works, simplify the build process:

**Edit `package.json`:**

```json
{
  "scripts": {
    "build": "vinxi build",
    "start": "vinxi start",
    "dev": "vinxi dev"
  }
}
```

**Remove or comment out in `app.config.ts` any Prisma references temporarily**

---

## 📋 Post the Error Here

**To help you fix it, I need to see:**

1. **Railway build logs** (copy/paste the error section)
2. **Railway deploy logs** (if it got that far)
3. **Specific error message**

**Or tell me:**
- "Error mentions Prisma"
- "Error mentions cannot find module"
- "Error mentions port"
- "Error mentions build failed"

I'll give you the exact fix!

---

## 🔧 Emergency Rollback

If you need to rollback the Bold Modern changes:

```bash
# In Railway dashboard
# Go to "Deployments"
# Find the last working deployment
# Click "..." → "Redeploy"
```

This will restore the previous working version while we fix the issue.

---

**What error are you seeing in the Railway logs?** 📊

