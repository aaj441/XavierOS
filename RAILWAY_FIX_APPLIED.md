# ✅ Railway Crash Fixes Applied

## 🔧 Issues Fixed

### 1. **DATABASE_URL Hardcoded** ❌ → ✅ Fixed
**Problem:** Prisma schema had hardcoded database URL that won't work on Railway

**Before:**
```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://postgres:postgres@postgres/app"
}
```

**After:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ✅ Uses Railway's env var
}
```

---

### 2. **Build Script Timing** ❌ → ✅ Fixed
**Problem:** `tsr generate` running in postinstall could timeout

**Before:**
```json
{
  "postinstall": "prisma generate && tsr generate"
}
```

**After:**
```json
{
  "postinstall": "prisma generate",
  "build": "tsr generate && vinxi build"
}
```

---

### 3. **Node Version Not Specified** ❌ → ✅ Fixed
**Problem:** Railway might use wrong Node version

**Added to package.json:**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

---

### 4. **Railway Config Missing** ❌ → ✅ Fixed
**Problem:** No explicit Railway configuration

**Created `railway.json`:**
```json
{
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

### 5. **Package Manager Config** ❌ → ✅ Fixed
**Problem:** pnpm might not be recognized

**Created `.npmrc`:**
```
package-manager=pnpm@8.0.0
shamefully-hoist=true
```

---

## 🚀 Next Steps

### In Railway Dashboard:

#### 1. **Add PostgreSQL Database** (CRITICAL)
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically sets `DATABASE_URL`
3. No configuration needed

#### 2. **Verify Environment Variables**
Go to "Variables" tab and ensure you have:
- ✅ `DATABASE_URL` (auto-added by PostgreSQL)
- ✅ `NODE_ENV=production`
- ✅ `APP_URL=https://your-app.up.railway.app`

Optional (for features):
- `GOOGLE_MAPS_API_KEY` (for Lucy)
- `HUBSPOT_CLIENT_ID` (for Lucy)
- `SENDGRID_API_KEY` (for emails)

#### 3. **Redeploy**
1. Go to "Deployments"
2. Click latest deployment
3. Click "..." → "Redeploy"
4. Or push new code:

```bash
git add .
git commit -m "Fix Railway crash: Use DATABASE_URL env var, optimize build"
git push origin main
```

---

## ✅ Files Modified

1. ✅ `prisma/schema.prisma` - Use env("DATABASE_URL")
2. ✅ `package.json` - Fixed build script, added engines
3. ✅ `railway.json` - Added Railway config (NEW)
4. ✅ `.npmrc` - Added pnpm config (NEW)
5. ✅ `.env.example` - Created for reference (attempted)

---

## 🎯 Expected Result

After redeploying:
- ✅ Build completes successfully
- ✅ Prisma connects to Railway's PostgreSQL
- ✅ App starts without crashing
- ✅ You can access your app URL

---

## 📊 If Still Crashing

Check Railway logs for these specific errors:

**"Cannot connect to database"**
- Make sure you added PostgreSQL in Railway
- Check DATABASE_URL is set

**"Module not found"**
- Check pnpm-lock.yaml is committed
- Verify all dependencies are in package.json

**"Command failed"**
- Check build logs for specific error
- May need to simplify build command

---

## 🚨 Emergency: Minimal Working Config

If above doesn't work, use this minimal package.json:

```json
{
  "scripts": {
    "build": "echo 'Skipping build' && exit 0",
    "start": "echo 'App started' && node -e 'require(\"http\").createServer((req,res)=>{res.writeHead(200);res.end(\"OK\")}).listen(process.env.PORT||3000)'"
  }
}
```

This will at least deploy successfully so you can verify Railway is working.

---

**The main fix was changing the hardcoded DATABASE_URL to use Railway's environment variable. This should resolve the crash!** 🎉

**Push these changes now and redeploy!**

