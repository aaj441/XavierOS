"""
XavierOS - WCAG Machine, eBook Generator & CGP Archetype Engine
Production-ready FastAPI application
"""

import os
import sys
import logging
from typing import Optional, List, Dict
from pathlib import Path

from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import base64

# Get the absolute path to the application directory
BASE_DIR = Path(__file__).resolve().parent

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log startup information
logger.info(f"Starting XavierOS from directory: {BASE_DIR}")
logger.info(f"Python version: {sys.version}")
logger.info(f"Working directory: {os.getcwd()}")

# Import Lucy, Project X, and CGP Engine with error handling
try:
    from lucy import check_wcag_compliance, WCAGReport
    logger.info("✓ Lucy module loaded successfully")
except Exception as e:
    logger.error(f"✗ Failed to load Lucy: {e}")
    raise

try:
    from project_x import (
        create_ebook,
        eBookMetadata,
        Chapter,
        eBookRequest,
        eBookResponse
    )
    logger.info("✓ Project X module loaded successfully")
except Exception as e:
    logger.error(f"✗ Failed to load Project X: {e}")
    raise

try:
    from cgp_engine import (
        CGPArchetypeEngine,
        ArchetypeProfile,
        ArchetypeRecommendation,
        UserArchetypeProfile
    )
    logger.info("✓ CGP Engine module loaded successfully")
except Exception as e:
    logger.error(f"✗ Failed to load CGP Engine: {e}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="XavierOS - WCAG Machine, eBook Generator & CGP Archetype Engine",
    description="Personal WCAG compliance checker, Kindle-friendly eBook generator, and care archetype system",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CGP Archetype Engine with error handling
try:
    cgp_engine = CGPArchetypeEngine()
    logger.info(f"✓ CGP Engine initialized with {len(cgp_engine.archetypes)} archetypes")
except Exception as e:
    logger.error(f"✗ Failed to initialize CGP Engine: {e}")
    cgp_engine = None

# Check if static directory exists
static_dir = BASE_DIR / "static"
if static_dir.exists():
    logger.info(f"✓ Static directory found: {static_dir}")
    # Mount static files BEFORE defining routes
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
else:
    logger.warning(f"✗ Static directory not found: {static_dir}")


# ===========================
# Root & Health Endpoints
# ===========================

@app.get("/", response_class=HTMLResponse)
async def serve_frontend():
    """Serve the frontend UI"""
    index_path = BASE_DIR / "static" / "index.html"

    if index_path.exists():
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                content = f.read()
            logger.info("✓ Serving frontend from static/index.html")
            return HTMLResponse(content=content)
        except Exception as e:
            logger.error(f"Error reading index.html: {e}")

    # Fallback HTML if frontend not found
    logger.warning("Frontend not found, serving fallback HTML")
    return HTMLResponse(content="""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XavierOS - API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .card {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { margin-top: 0; }
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
        a:hover { text-decoration: underline; }
        .endpoints {
            margin-top: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
        }
        .endpoint {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-left: 4px solid #667eea;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🧬 XavierOS v2.0.0</h1>
        <p><strong>WCAG Machine, eBook Generator & CGP Archetype Engine</strong></p>

        <div class="endpoints">
            <h2>Available Endpoints</h2>

            <div class="endpoint">
                <strong>📚 API Documentation</strong><br>
                <a href="/docs">/docs</a> - Interactive Swagger UI
            </div>

            <div class="endpoint">
                <strong>💚 Health Check</strong><br>
                <a href="/health">/health</a> - Service status
            </div>

            <div class="endpoint">
                <strong>✓ Lucy - WCAG Checker</strong><br>
                <code>POST /lucy/check</code> - Check HTML compliance<br>
                <a href="/lucy/info">GET /lucy/info</a> - Lucy capabilities
            </div>

            <div class="endpoint">
                <strong>📖 Project X - eBook Generator</strong><br>
                <code>POST /project-x/generate</code> - Generate eBook<br>
                <a href="/project-x/info">GET /project-x/info</a> - Project X capabilities
            </div>

            <div class="endpoint">
                <strong>🧘 CGP - Archetype Engine</strong><br>
                <a href="/cgp/archetypes">GET /cgp/archetypes</a> - List all archetypes<br>
                <code>POST /cgp/recommend</code> - Get recommendations<br>
                <a href="/cgp/info">GET /cgp/info</a> - CGP capabilities
            </div>
        </div>

        <p style="margin-top: 20px; text-align: center;">
            <a href="/docs">View Full API Documentation →</a>
        </p>
    </div>
</body>
</html>
    """)


@app.get("/api")
async def api_info():
    """API information endpoint"""
    return {
        "name": "XavierOS",
        "description": "WCAG Machine, eBook Generator, and CGP Archetype Engine",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "frontend": "/",
            "health": "/health",
            "documentation": "/docs",
            "lucy": {
                "check": "POST /lucy/check",
                "info": "GET /lucy/info"
            },
            "project_x": {
                "generate": "POST /project-x/generate",
                "download": "POST /project-x/download",
                "info": "GET /project-x/info"
            },
            "cgp": {
                "list": "GET /cgp/archetypes",
                "get": "GET /cgp/archetype/{name}",
                "recommend": "POST /cgp/recommend",
                "pdf": "GET /cgp/pdf/{name}",
                "info": "GET /cgp/info"
            }
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    health_status = {
        "status": "healthy",
        "service": "XavierOS",
        "version": "2.0.0",
        "components": {
            "lucy": "operational",
            "project_x": "operational",
            "cgp_engine": "operational" if cgp_engine else "unavailable",
        }
    }

    if cgp_engine:
        health_status["archetypes_loaded"] = len(cgp_engine.archetypes)

    return health_status


# ===========================
# Lucy - WCAG Compliance Checker
# ===========================

class WCAGCheckRequest(BaseModel):
    """Request for WCAG compliance check"""
    html_content: str
    url: Optional[str] = None


@app.post("/lucy/check", response_model=WCAGReport)
async def check_wcag(request: WCAGCheckRequest = Body(...)):
    """
    Check HTML content for WCAG compliance

    **Lucy** analyzes your HTML and identifies accessibility issues based on WCAG 2.1 guidelines.
    """
    try:
        logger.info(f"Lucy checking WCAG compliance (content length: {len(request.html_content)} chars)")

        if not request.html_content or not request.html_content.strip():
            raise HTTPException(status_code=400, detail="html_content cannot be empty")

        report = check_wcag_compliance(request.html_content)
        logger.info(f"Lucy found {report.total_issues} issues, score: {report.score}")

        return report

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Lucy WCAG check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"WCAG check failed: {str(e)}")


@app.get("/lucy/info")
async def lucy_info():
    """Get information about Lucy - WCAG Compliance Checker"""
    return {
        "name": "Lucy",
        "description": "WCAG 2.1 AA Compliance Checker",
        "version": "1.0",
        "status": "operational",
        "capabilities": [
            "Check images for alt text (WCAG 1.1.1)",
            "Verify heading hierarchy (WCAG 2.4.6)",
            "Validate link accessibility (WCAG 2.4.4)",
            "Check form labels (WCAG 3.3.2)",
            "Verify color contrast (WCAG 1.4.3)",
            "Check page language (WCAG 3.1.1)",
            "Validate page titles (WCAG 2.4.2)",
            "Check keyboard accessibility (WCAG 2.1.1)",
            "Verify table structure (WCAG 1.3.1)",
            "Check multimedia accessibility (WCAG 1.2.1)"
        ],
        "compliance_levels": ["A", "AA", "AAA"]
    }


# ===========================
# Project X - eBook Generator
# ===========================

@app.post("/project-x/generate", response_model=eBookResponse)
async def generate_ebook(request: eBookRequest = Body(...)):
    """
    Generate Kindle-friendly eBook

    **Project X** converts your content into professional eBooks compatible with Kindle.
    """
    try:
        logger.info(f"Project X generating {request.format} eBook: {request.metadata.title}")

        if not request.chapters or len(request.chapters) == 0:
            raise HTTPException(status_code=400, detail="At least one chapter is required")

        result = create_ebook(
            metadata=request.metadata,
            chapters=request.chapters,
            format=request.format,
            enable_toc=request.enable_toc,
            enable_ncx=request.enable_ncx
        )

        if result.success:
            logger.info(f"Project X successfully generated: {result.filename}")
        else:
            logger.error(f"Project X failed: {result.message}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in Project X: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"eBook generation failed: {str(e)}")


@app.post("/project-x/download")
async def download_ebook(request: eBookRequest = Body(...)):
    """Generate and download eBook directly"""
    try:
        logger.info(f"Project X download request: {request.metadata.title}")

        result = create_ebook(
            metadata=request.metadata,
            chapters=request.chapters,
            format=request.format,
            enable_toc=request.enable_toc,
            enable_ncx=request.enable_ncx
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        file_bytes = base64.b64decode(result.file_data)

        return Response(
            content=file_bytes,
            media_type="application/epub+zip",
            headers={
                "Content-Disposition": f"attachment; filename={result.filename}",
                "Content-Length": str(len(file_bytes))
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in download: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@app.get("/project-x/info")
async def project_x_info():
    """Get information about Project X - eBook Generator"""
    return {
        "name": "Project X",
        "description": "Kindle-friendly eBook Generator",
        "version": "1.0",
        "status": "operational",
        "supported_formats": ["epub"],
        "capabilities": [
            "Generate EPUB format eBooks",
            "Automatic table of contents",
            "NCX navigation support",
            "Kindle-optimized CSS styling",
            "Chapter management",
            "Metadata support",
            "Cover image support"
        ]
    }


# ===========================
# CGP - Archetype Engine
# ===========================

class ArchetypeRecommendRequest(BaseModel):
    """Request for archetype recommendation"""
    current_state: str
    concerns: List[str]
    preferences: Dict[str, any] = {}


@app.get("/cgp/archetypes", response_model=List[ArchetypeProfile])
async def list_archetypes():
    """Get all available CGP care archetypes"""
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        archetypes = cgp_engine.get_all_archetypes()
        logger.info(f"Retrieved {len(archetypes)} archetypes")
        return archetypes
    except Exception as e:
        logger.error(f"Error retrieving archetypes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve archetypes: {str(e)}")


@app.get("/cgp/archetype/{name}", response_model=ArchetypeProfile)
async def get_archetype(name: str):
    """Get specific archetype by name"""
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        archetype = cgp_engine.get_archetype(name)
        if not archetype:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        logger.info(f"Retrieved archetype: {name}")
        return archetype
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving archetype {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve archetype: {str(e)}")


@app.post("/cgp/recommend", response_model=List[ArchetypeRecommendation])
async def recommend_archetype(request: ArchetypeRecommendRequest = Body(...)):
    """Get archetype recommendations based on current state and concerns"""
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        recommendations = cgp_engine.recommend_archetype(
            current_state=request.current_state,
            concerns=request.concerns,
            preferences=request.preferences
        )

        logger.info(f"Generated {len(recommendations)} recommendations")
        return recommendations
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@app.get("/cgp/pdf/{name}")
async def download_archetype_pdf(name: str):
    """Download archetype PDF guide"""
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        archetype = cgp_engine.get_archetype(name)
        if not archetype:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        if not archetype.pdf_available:
            raise HTTPException(status_code=404, detail=f"PDF not available for '{name}'")

        pdf_path = BASE_DIR / f"{name}.pdf"
        if not pdf_path.exists():
            raise HTTPException(status_code=404, detail=f"PDF file not found")

        logger.info(f"Serving PDF for archetype: {name}")

        return FileResponse(
            path=str(pdf_path),
            media_type="application/pdf",
            filename=f"{name}.pdf"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving PDF for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to serve PDF: {str(e)}")


@app.get("/cgp/ritual/{name}")
async def get_archetype_ritual(name: str):
    """Get the ritual text for a specific archetype"""
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        ritual = cgp_engine.get_ritual_for_archetype(name)
        if not ritual:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        return {"archetype": name, "ritual": ritual}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving ritual for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve ritual: {str(e)}")


@app.get("/cgp/report/{name}")
async def get_archetype_report(name: str):
    """Get comprehensive archetype report"""
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        report = cgp_engine.generate_archetype_report(name)
        if not report:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        logger.info(f"Generated report for archetype: {name}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@app.get("/cgp/info")
async def cgp_info():
    """Get information about CGP Archetype Engine"""
    if not cgp_engine:
        return {
            "name": "CGP Archetype Engine",
            "status": "unavailable",
            "message": "CGP Engine failed to initialize"
        }

    return {
        "name": "CGP Archetype Engine",
        "description": "Care archetypes for personalized wellness",
        "version": "1.0 (Waltz 4 Expansion)",
        "status": "operational",
        "archetypes": cgp_engine.get_archetype_names(),
        "total_archetypes": len(cgp_engine.archetypes),
        "capabilities": [
            "7 distinct care archetypes",
            "Personalized recommendations",
            "Daily ritual practices",
            "PDF guides for each archetype",
            "Integration with Lucy and Project X"
        ]
    }


# ===========================
# Combined Workflow
# ===========================

class WCAGAndEbookRequest(BaseModel):
    """Request for combined WCAG check + eBook generation"""
    html_content: str
    ebook_request: eBookRequest


@app.post("/workflow/check-and-generate")
async def check_and_generate(request: WCAGAndEbookRequest = Body(...)):
    """Combined workflow: Check WCAG compliance and generate eBook"""
    try:
        logger.info("Starting combined workflow: WCAG check + eBook generation")

        # Step 1: Check WCAG compliance
        wcag_report = check_wcag_compliance(request.html_content)
        logger.info(f"WCAG check complete: {wcag_report.total_issues} issues")

        # Step 2: Generate eBook
        ebook_result = create_ebook(
            metadata=request.ebook_request.metadata,
            chapters=request.ebook_request.chapters,
            format=request.ebook_request.format,
            enable_toc=request.ebook_request.enable_toc,
            enable_ncx=request.ebook_request.enable_ncx
        )
        logger.info(f"eBook generation complete: {ebook_result.filename}")

        return {
            "wcag_report": wcag_report,
            "ebook": ebook_result,
            "workflow_status": "completed"
        }

    except Exception as e:
        logger.error(f"Error in combined workflow: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Workflow failed: {str(e)}")


# ===========================
# Startup & Shutdown Events
# ===========================

@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info("=" * 60)
    logger.info("XavierOS v2.0.0 Starting")
    logger.info("=" * 60)
    logger.info(f"Base directory: {BASE_DIR}")
    logger.info(f"Static directory exists: {static_dir.exists()}")
    logger.info(f"CGP Engine status: {'✓ Loaded' if cgp_engine else '✗ Failed'}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("XavierOS shutting down...")


# ===========================
# Application Entry Point
# ===========================

if __name__ == "__main__":
    import uvicorn

    # Get port from environment variable (Railway provides this)
    port = int(os.getenv("PORT", 8000))

    logger.info(f"Starting server on port {port}")

    # Bind to 0.0.0.0 to accept external connections (required for Railway)
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True
    )
