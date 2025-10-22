# XavierOS Deployment Guide

## Overview
XavierOS is a FastAPI application that provides WCAG compliance checking (Lucy) and eBook generation (Project X) services.

## Deployment Issues Fixed

### 1. Dependency Management
- **Issue**: Version conflicts and missing system dependencies for lxml
- **Fix**: 
  - Updated `requirements.txt` with flexible version ranges
  - Added `nixpacks.toml` to install system dependencies (libxml2, libxslt)
  - Pinned ebooklib to version 0.18 for stability

### 2. Python Version
- **Issue**: Runtime.txt had incomplete Python version
- **Fix**: Updated to `python-3.11.10` (specific patch version)

### 3. Environment Variables
- **Issue**: Potential missing PORT variable
- **Fix**: Application correctly reads PORT from environment with fallback to 8000

### 4. EPUB Generation
- **Issue**: "Document is empty" error with ebooklib
- **Fix**: 
  - Ensured lxml is installed (required by ebooklib)
  - Fixed spine configuration in EPUB generation
  - Added proper error handling and logging

## Deployment Configuration

### Files Required for Deployment:
1. `app.py` - Main FastAPI application
2. `lucy.py` - WCAG compliance checker module
3. `project_x.py` - eBook generator module
4. `requirements.txt` - Python dependencies
5. `runtime.txt` - Python version specification
6. `Procfile` - Process file for deployment
7. `railway.toml` - Railway-specific configuration
8. `nixpacks.toml` - System dependencies configuration

### Railway Deployment Steps:
1. Push code to GitHub repository
2. Connect Railway to the repository
3. Railway will automatically:
   - Detect Python application
   - Use nixpacks.toml to install system dependencies
   - Install Python dependencies from requirements.txt
   - Start the application using the Procfile command

### Environment Variables:
- `PORT` - Automatically provided by Railway

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health status

### Lucy (WCAG Checker)
- `POST /lucy/check` - Check HTML for WCAG compliance
- `GET /lucy/info` - Lucy capabilities

### Project X (eBook Generator)
- `POST /project-x/generate` - Generate eBook
- `POST /project-x/download` - Generate and download eBook
- `GET /project-x/info` - Project X capabilities

### Combined Workflow
- `POST /workflow/check-and-generate` - Check WCAG and generate eBook

## Testing

Run the health check locally:
```bash
python3 healthcheck.py
```

Test the API locally:
```bash
PORT=8000 python3 app.py
```

## Troubleshooting

### If lxml installation fails:
- Ensure nixpacks.toml is present and includes libxml2, libxslt
- Railway should automatically install these system dependencies

### If EPUB generation fails:
- Check that ebooklib version is 0.18
- Ensure lxml is properly installed
- Check server logs for detailed error messages

### If deployment fails:
1. Check Railway build logs
2. Verify all required files are present
3. Ensure Python version in runtime.txt is valid
4. Check that requirements.txt has no syntax errors

## Production URLs
Once deployed, your application will be available at:
- `https://your-app-name.up.railway.app/`
- Health check: `https://your-app-name.up.railway.app/health`

## Monitoring
- Monitor application logs in Railway dashboard
- Use the `/health` endpoint for uptime monitoring
- Check error logs for any WCAG or eBook generation issues