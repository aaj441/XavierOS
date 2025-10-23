"""
XavierOS - WCAG Machine, eBook Generator & CGP Archetype Engine
Production-ready FastAPI application
"""

import os
import sys
import logging
from typing import Optional, List, Dict
from pathlib import Path
from datetime import datetime

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
                "export": "POST /export/wcag-report",
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
                "generate_ebook": "POST /cgp/generate-ebook/{name}",
                "info": "GET /cgp/info"
            },
            "batch": {
                "all_archetypes": "POST /batch/archetypes-ebooks"
            },
            "examples": {
                "html_samples": "GET /examples/html-samples",
                "ebook_template": "GET /examples/ebook-template"
            },
            "workflows": {
                "check_and_generate": "POST /workflow/check-and-generate"
            }
        },
        "new_features": [
            "🚀 Auto-generate archetype eBooks",
            "🎁 Batch generate all 7 archetype eBooks",
            "💾 Export WCAG reports as JSON",
            "📋 HTML examples for testing",
            "📖 Ready-to-use eBook templates"
        ]
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
# Enhanced Features & Integrations
# ===========================

@app.post("/cgp/generate-ebook/{name}")
async def generate_archetype_ebook(name: str):
    """
    🚀 AUTO-GENERATE ARCHETYPE EBOOK

    Automatically creates a complete, WCAG-compliant eBook for any archetype.
    Combines CGP + Project X + Lucy for one-click eBook generation.
    """
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        # Get archetype details
        archetype = cgp_engine.get_archetype(name)
        if not archetype:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        logger.info(f"Auto-generating eBook for archetype: {name}")

        # Build chapters from archetype data
        chapters = []

        # Chapter 1: Introduction
        intro_html = f"""
        <h2>Welcome to {name}</h2>
        <p><strong>{archetype.data.narrative}</strong></p>
        <p>This guide will help you understand and embrace the {name} archetype in your personal journey.</p>
        <h3>Your Tone: {archetype.data.tone}</h3>
        <p>This archetype communicates with a {archetype.data.tone} style, creating a safe and supportive space for your growth.</p>
        """
        chapters.append(Chapter(
            title="Introduction",
            content=intro_html,
            order=1
        ))

        # Chapter 2: Core Values
        values_html = f"""
        <h2>Core Values</h2>
        <p>The {name} archetype is guided by these fundamental principles:</p>
        <ul>
        """
        for value in archetype.data.values:
            values_html += f"<li><strong>{value.title()}</strong>: This value guides your decisions and actions.</li>"
        values_html += "</ul>"

        chapters.append(Chapter(
            title="Core Values",
            content=values_html,
            order=2
        ))

        # Chapter 3: Daily Ritual
        ritual_html = f"""
        <h2>Your Daily Ritual</h2>
        <div style="padding: 20px; background-color: #f3f4f6; border-left: 4px solid #6366f1; margin: 20px 0;">
            <p style="font-size: 1.2em; font-style: italic; margin: 0;">
                {archetype.data.ritual}
            </p>
        </div>
        <h3>How to Practice</h3>
        <p>Set aside 5-10 minutes each day for this ritual. Find a quiet space, breathe deeply, and allow these words to guide you.</p>
        <ul>
            <li>Morning: Start your day with intention</li>
            <li>Evening: Reflect and release</li>
            <li>Anytime: When you need grounding</li>
        </ul>
        """
        chapters.append(Chapter(
            title="Daily Ritual Practice",
            content=ritual_html,
            order=3
        ))

        # Chapter 4: Protection & Boundaries
        risks_html = f"""
        <h2>What This Archetype Protects You From</h2>
        <p>The {name} archetype helps you navigate and protect against:</p>
        <ul>
        """
        for risk in archetype.data.risks:
            risks_html += f"<li><strong>{risk.title()}</strong>: Recognizing and avoiding this pattern</li>"
        risks_html += """
        </ul>
        <h3>Building Healthy Boundaries</h3>
        <p>Understanding these risks allows you to set appropriate boundaries and maintain your well-being.</p>
        """
        chapters.append(Chapter(
            title="Protection & Boundaries",
            content=risks_html,
            order=4
        ))

        # Chapter 5: Key Features & Support
        features_html = f"""
        <h2>Key Features of Your Journey</h2>
        <p>The {name} archetype offers these specific forms of support:</p>
        <ul>
        """
        for feature in archetype.data.features:
            features_html += f"<li>{feature}</li>"
        features_html += """
        </ul>
        <h3>Accessing Support</h3>
        <p>Remember that asking for help aligned with your archetype strengthens your journey rather than weakening it.</p>
        """
        chapters.append(Chapter(
            title="Support Features",
            content=features_html,
            order=5
        ))

        # Chapter 6: Integration & Next Steps
        closing_html = f"""
        <h2>Integrating {name} Into Your Life</h2>
        <h3>Daily Practices</h3>
        <ul>
            <li>Morning ritual: Ground yourself with your archetype's values</li>
            <li>Midday check-in: Are you honoring your boundaries?</li>
            <li>Evening reflection: How did your archetype guide you today?</li>
        </ul>
        <h3>Weekly Reflection</h3>
        <p>Set aside time each week to journal about:</p>
        <ul>
            <li>Moments when you felt aligned with your archetype</li>
            <li>Challenges that arose and how you responded</li>
            <li>Growth you're experiencing</li>
        </ul>
        <h3>Next Steps</h3>
        <p>Your journey with the {name} archetype is ongoing. Trust the process, be gentle with yourself, and remember that growth happens in spirals, not straight lines.</p>
        <p style="text-align: center; margin-top: 30px; font-style: italic;">
            May your journey with {name} bring you peace, clarity, and wholeness.
        </p>
        """
        chapters.append(Chapter(
            title="Integration & Next Steps",
            content=closing_html,
            order=6
        ))

        # Create eBook metadata
        metadata = eBookMetadata(
            title=f"The {name} Archetype Guide",
            author="XavierOS CGP System",
            language="en",
            publisher="XavierOS",
            description=f"A comprehensive guide to the {name} care archetype, including daily rituals, core values, and integration practices."
        )

        # Generate eBook
        result = create_ebook(
            metadata=metadata,
            chapters=chapters,
            format="epub",
            enable_toc=True,
            enable_ncx=True
        )

        logger.info(f"Auto-generated eBook for {name}: {result.filename}")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating archetype eBook for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate eBook: {str(e)}")


@app.post("/batch/archetypes-ebooks")
async def generate_all_archetype_ebooks():
    """
    🎁 BATCH GENERATE ALL ARCHETYPE EBOOKS

    Generates eBooks for all 7 archetypes in one request.
    Perfect for offline reading or distribution.
    """
    if not cgp_engine:
        raise HTTPException(status_code=503, detail="CGP Engine not available")

    try:
        logger.info("Batch generating eBooks for all archetypes")

        results = []
        archetype_names = cgp_engine.get_archetype_names()

        for name in archetype_names:
            try:
                # Call the single archetype eBook generator
                result = await generate_archetype_ebook(name)
                results.append({
                    "archetype": name,
                    "success": result.success,
                    "filename": result.filename,
                    "size_bytes": result.size_bytes
                })
            except Exception as e:
                logger.error(f"Failed to generate eBook for {name}: {e}")
                results.append({
                    "archetype": name,
                    "success": False,
                    "error": str(e)
                })

        successful = sum(1 for r in results if r.get("success"))

        logger.info(f"Batch generation complete: {successful}/{len(archetype_names)} successful")

        return {
            "total_archetypes": len(archetype_names),
            "successful": successful,
            "failed": len(archetype_names) - successful,
            "results": results
        }

    except Exception as e:
        logger.error(f"Error in batch generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch generation failed: {str(e)}")


@app.get("/examples/html-samples")
async def get_html_samples():
    """
    📋 HTML EXAMPLES FOR TESTING

    Provides sample HTML content for testing Lucy's WCAG compliance checker.
    """
    return {
        "accessible_html": {
            "title": "✅ Accessible HTML Example",
            "description": "This HTML follows WCAG 2.1 AA guidelines",
            "html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessible Page Example</title>
</head>
<body>
    <header>
        <h1>Welcome to Our Accessible Website</h1>
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article>
            <h2>About Accessibility</h2>
            <p>This page demonstrates proper WCAG 2.1 AA compliance.</p>

            <img src="logo.png" alt="Company logo with blue background">

            <h3>Contact Form</h3>
            <form>
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required aria-required="true">

                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required aria-required="true">

                <button type="submit">Send Message</button>
            </form>
        </article>
    </main>

    <footer>
        <p>&copy; 2024 Accessible Company</p>
    </footer>
</body>
</html>"""
        },
        "inaccessible_html": {
            "title": "❌ Inaccessible HTML Example",
            "description": "This HTML has multiple WCAG violations",
            "html": """<!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>
    <h3>Welcome</h3>
    <img src="logo.png">
    <a href="#">Click here</a>
    <a href="#">Read more</a>
    <input type="text">
    <input type="email">
    <button>Submit</button>
    <table>
        <tr>
            <td>Name</td>
            <td>Email</td>
        </tr>
        <tr>
            <td>John</td>
            <td>john@example.com</td>
        </tr>
    </table>
</body>
</html>"""
        },
        "partially_accessible_html": {
            "title": "⚠️ Partially Accessible HTML",
            "description": "This HTML has some accessibility features but missing others",
            "html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Product Page</title>
</head>
<body>
    <h1>Our Products</h1>
    <div onclick="buyProduct()">
        <h2>Product Name</h2>
        <img src="product.jpg" alt="Product image">
        <p>Click to buy</p>
    </div>

    <h3>Features</h3>
    <h5>Specifications</h5>

    <a href="/buy">here</a>

    <form>
        <input type="text" placeholder="Your name">
        <input type="email" placeholder="Your email">
        <button>Subscribe</button>
    </form>
</body>
</html>"""
        }
    }


@app.get("/examples/ebook-template")
async def get_ebook_template():
    """
    📖 EBOOK TEMPLATE

    Provides a ready-to-use eBook template for quick testing.
    """
    return {
        "metadata": {
            "title": "My First eBook",
            "author": "Your Name",
            "language": "en",
            "description": "A sample eBook created with XavierOS"
        },
        "chapters": [
            {
                "title": "Introduction",
                "content": "<h2>Welcome</h2><p>This is the introduction to my eBook. Here I'll explain what readers can expect.</p>",
                "order": 1
            },
            {
                "title": "Chapter 1: Getting Started",
                "content": "<h2>Getting Started</h2><p>In this chapter, we'll cover the basics...</p><ul><li>Point one</li><li>Point two</li><li>Point three</li></ul>",
                "order": 2
            },
            {
                "title": "Chapter 2: Advanced Topics",
                "content": "<h2>Advanced Topics</h2><p>Now that you understand the basics, let's dive deeper...</p>",
                "order": 3
            },
            {
                "title": "Conclusion",
                "content": "<h2>Conclusion</h2><p>Thank you for reading! Here are the key takeaways...</p>",
                "order": 4
            }
        ],
        "format": "epub",
        "enable_toc": True,
        "enable_ncx": True
    }


@app.post("/export/wcag-report")
async def export_wcag_report(request: WCAGCheckRequest = Body(...)):
    """
    💾 EXPORT WCAG REPORT

    Generates a downloadable WCAG compliance report in JSON format.
    """
    try:
        report = check_wcag_compliance(request.html_content)

        # Create detailed export
        export_data = {
            "report_generated": datetime.now().isoformat(),
            "url": request.url,
            "summary": {
                "total_issues": report.total_issues,
                "compliance_score": report.score,
                "critical_count": report.critical_count,
                "warning_count": report.warning_count,
                "info_count": report.info_count
            },
            "issues": [
                {
                    "level": issue.level,
                    "criterion": issue.criterion,
                    "title": issue.title,
                    "description": issue.description,
                    "element": issue.element,
                    "suggestion": issue.suggestion
                }
                for issue in report.issues
            ],
            "recommendations": [
                "Fix all Level A issues first (critical for accessibility)",
                "Address Level AA issues for enhanced usability",
                "Consider Level AAA for optimal accessibility" if report.info_count > 0 else "Great work on Level AAA compliance!"
            ]
        }

        # Convert to JSON string for download
        import json
        json_data = json.dumps(export_data, indent=2)

        return Response(
            content=json_data,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=wcag_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            }
        )

    except Exception as e:
        logger.error(f"Error exporting WCAG report: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


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
