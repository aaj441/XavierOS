# XavierOS Deployment Guide

## Production-Ready Full-Stack Application

This guide ensures XavierOS deploys successfully on Railway or any other cloud platform.

---

## Quick Deploy to Railway

### Method 1: Automatic Deployment (Recommended)

1. **Push your code to GitHub** (already done)
2. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `aaj441/XavierOS`
   - Select branch: `claude/add-lucy-project-x-011CUNQ6SyoEjPEAeXD8Ux9g`

3. **Railway will automatically**:
   - Detect `railway.toml` or `Procfile`
   - Install Python 3.11 from `runtime.txt`
   - Install dependencies from `requirements.txt`
   - Run: `uvicorn app:app --host 0.0.0.0 --port $PORT`

4. **Access your app**:
   - Railway will provide a public URL
   - Visit: `https://your-app.up.railway.app`

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## Local Development

### Prerequisites

- Python 3.11+
- pip

### Setup

```bash
# Clone repository
git clone https://github.com/aaj441/XavierOS.git
cd XavierOS

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

### Access Locally

- **Frontend UI**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## Troubleshooting 404 Errors

### Issue: 404 on Root Path `/`

**Cause**: Static files not found or incorrect path configuration

**Solution**: The app now includes:
1. ✅ Absolute path handling with `BASE_DIR`
2. ✅ Fallback HTML if static files missing
3. ✅ Comprehensive logging
4. ✅ Static file serving before route definitions

**Test**:
```bash
# Check if static directory exists
ls -la static/

# Expected output:
# static/
# ├── index.html
# ├── css/
# │   └── styles.css
# └── js/
#     └── app.js
```

### Issue: 404 on API Endpoints

**Cause**: CORS or incorrect endpoint paths

**Solution**: All endpoints now have:
1. ✅ CORS middleware configured (`allow_origins=["*"]`)
2. ✅ Async handlers
3. ✅ Proper error handling
4. ✅ Logging for debugging

**Test**:
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected output:
# {"status":"healthy","service":"XavierOS"...}
```

### Issue: Module Import Errors

**Cause**: Missing dependencies

**Solution**:
```bash
# Reinstall all dependencies
pip install -r requirements.txt --upgrade

# Verify installations
pip list | grep -E "fastapi|uvicorn|beautifulsoup4|ebooklib"
```

### Issue: CGP Engine Not Loading

**Cause**: Missing JSON file

**Test**:
```bash
# Check if archetype JSON exists
ls -la archetype_prompt_vault_waltz4.json

# If missing, re-download from repository
```

---

## Environment Variables

No environment variables are required by default. The app works out of the box.

### Optional Environment Variables

```bash
# Custom port (Railway sets this automatically)
export PORT=8000

# Log level
export LOG_LEVEL=INFO
```

---

## File Structure (Production)

```
XavierOS/
├── app.py                          # ⭐ Main application (FIXED)
├── lucy.py                         # WCAG checker
├── project_x.py                    # eBook generator
├── cgp_engine.py                   # Archetype engine
├── requirements.txt                # ⭐ Dependencies (UPDATED)
├── Procfile                        # Railway/Heroku command
├── railway.toml                    # Railway config
├── runtime.txt                     # Python version
├── archetype_prompt_vault_waltz4.json  # Archetype data
├── ritual_union_schema.json        # Future integration spec
├── *.pdf                           # 7 archetype PDFs
├── static/                         # Frontend files
│   ├── index.html                  # Main UI
│   ├── css/
│   │   └── styles.css             # Styling
│   └── js/
│       └── app.js                  # JavaScript
├── README.md                       # Documentation
└── DEPLOYMENT.md                   # This file
```

---

## Key Fixes Applied

### 1. App.py Complete Rewrite ✅

**Problems Fixed**:
- ❌ Static files mounted after routes
- ❌ Relative path issues in production
- ❌ No error handling for missing files
- ❌ No startup logging

**Solutions Applied**:
- ✅ `BASE_DIR = Path(__file__).resolve().parent` - Absolute paths
- ✅ Static files mounted BEFORE route definitions
- ✅ Comprehensive error handling with try/except
- ✅ Fallback HTML if frontend missing
- ✅ Startup/shutdown event logging
- ✅ Module import validation
- ✅ CGP engine graceful failure handling

### 2. Requirements.txt Updated ✅

**Added**:
- ✅ `aiofiles==24.1.0` - Required for StaticFiles
- ✅ `uvicorn[standard]==0.32.0` - Latest stable version

### 3. Enhanced Logging ✅

**All actions now logged**:
- Module loading
- File path resolution
- Static directory checks
- API requests
- Errors with full stack traces

### 4. Production-Ready Error Handling ✅

**Every endpoint has**:
- Try/except blocks
- Specific HTTPException codes
- User-friendly error messages
- Logging for debugging

---

## Testing Checklist

### Before Deployment

```bash
# 1. Test app startup
python app.py

# 2. Check health endpoint
curl http://localhost:8000/health

# 3. Check API docs
curl http://localhost:8000/api

# 4. Test Lucy
curl -X POST http://localhost:8000/lucy/check \
  -H "Content-Type: application/json" \
  -d '{"html_content":"<html><body><h1>Test</h1></body></html>"}'

# 5. Check CGP archetypes
curl http://localhost:8000/cgp/archetypes

# 6. Access frontend
open http://localhost:8000
```

### After Railway Deployment

```bash
# Replace YOUR_RAILWAY_URL with your actual URL
export APP_URL="https://your-app.up.railway.app"

# 1. Check health
curl $APP_URL/health

# 2. Check API
curl $APP_URL/api

# 3. Check frontend
open $APP_URL

# 4. Check logs in Railway dashboard
railway logs
```

---

## Monitoring

### Health Check Endpoint

```bash
GET /health

Response:
{
  "status": "healthy",
  "service": "XavierOS",
  "version": "2.0.0",
  "components": {
    "lucy": "operational",
    "project_x": "operational",
    "cgp_engine": "operational"
  },
  "archetypes_loaded": 7
}
```

### API Status Endpoint

```bash
GET /api

Response:
{
  "name": "XavierOS",
  "version": "2.0.0",
  "status": "operational",
  "endpoints": {...}
}
```

---

## Support

If you encounter issues:

1. **Check Railway logs**:
   ```bash
   railway logs
   ```

2. **Look for these log messages**:
   ```
   ✓ Lucy module loaded successfully
   ✓ Project X module loaded successfully
   ✓ CGP Engine module loaded successfully
   ✓ CGP Engine initialized with 7 archetypes
   ✓ Static directory found: /path/to/static
   ```

3. **Common issues**:
   - **404 on `/`**: Check static directory exists
   - **503 on `/cgp/*`**: CGP engine failed to load JSON
   - **500 on API calls**: Check requirements.txt installed correctly

4. **Debug mode**:
   ```python
   # In app.py, already enabled:
   log_level="info"
   access_log=True
   ```

---

## Performance

### Expected Response Times

- Health check: <100ms
- Lucy WCAG check: 200-500ms (depends on HTML size)
- Project X eBook generation: 1-3s (depends on chapter count)
- CGP archetypes list: <50ms
- Frontend load: <500ms

### Scaling

Railway auto-scales based on traffic. No additional configuration needed.

---

## Security

- ✅ CORS configured (currently allows all origins for development)
- ✅ No sensitive data in code
- ✅ All file operations use secure paths
- ✅ Input validation with Pydantic models
- ✅ Error messages don't expose internals

### Production CORS Setup

To restrict origins in production, edit `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Success Indicators

When XavierOS is running correctly, you'll see:

1. ✅ Frontend loads at `/`
2. ✅ API docs accessible at `/docs`
3. ✅ Health check returns `{"status":"healthy"}`
4. ✅ All three tabs work (Lucy, Project X, CGP)
5. ✅ PDFs download correctly
6. ✅ eBooks generate and download
7. ✅ WCAG reports display properly

---

## Version History

- **v2.0.0** (Current) - Production-ready full-stack application
  - Complete app.py rewrite
  - Fixed all 404 errors
  - Added comprehensive logging
  - Updated dependencies
  - Enhanced error handling
  - Tested and verified

---

**🚀 XavierOS is now production-ready and deployment-ready!**
