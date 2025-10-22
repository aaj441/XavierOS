"""
XavierOS - WCAG Machine and eBook Generator
Main FastAPI application with Lucy (WCAG Checker) and Project X (eBook Formatter)
"""

import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import base64

# Import Lucy, Project X, and CGP Engine
from lucy import check_wcag_compliance, WCAGReport
from project_x import (
    create_ebook,
    eBookMetadata,
    Chapter,
    eBookRequest,
    eBookResponse
)
from cgp_engine import (
    CGPArchetypeEngine,
    ArchetypeProfile,
    ArchetypeRecommendation,
    UserArchetypeProfile
)
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="XavierOS - WCAG Machine, eBook Generator & CGP Archetype Engine",
    description="Personal WCAG compliance checker, Kindle-friendly eBook generator, and care archetype system",
    version="2.0.0"
)

# Initialize CGP Archetype Engine
cgp_engine = CGPArchetypeEngine()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# ===========================
# Health Check Endpoints
# ===========================

@app.get("/", response_class=HTMLResponse)
def read_root():
    """Serve the frontend UI"""
    try:
        with open("static/index.html", "r") as f:
            return f.read()
    except Exception:
        return """
        <html>
            <body>
                <h1>XavierOS - v2.0.0</h1>
                <p>WCAG Machine, eBook Generator, and CGP Archetype Engine</p>
                <p><a href="/docs">API Documentation</a></p>
            </body>
        </html>
        """


@app.get("/api")
def api_info():
    """API information endpoint"""
    return {
        "name": "XavierOS",
        "description": "WCAG Machine, eBook Generator, and CGP Archetype Engine for personal use",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
            "frontend": "/",
            "lucy": {
                "check_wcag": "/lucy/check",
                "description": "WCAG compliance checker"
            },
            "project_x": {
                "generate_ebook": "/project-x/generate",
                "description": "Kindle-friendly eBook generator"
            },
            "cgp": {
                "list_archetypes": "/cgp/archetypes",
                "get_archetype": "/cgp/archetype/{name}",
                "recommend": "/cgp/recommend",
                "download_pdf": "/cgp/pdf/{name}",
                "description": "CGP Archetype Engine for personalized care rituals"
            }
        }
    }


@app.get("/health")
def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "service": "XavierOS",
        "lucy": "operational",
        "project_x": "operational",
        "cgp_engine": "operational",
        "archetypes_loaded": len(cgp_engine.archetypes)
    }


# ===========================
# Lucy - WCAG Compliance Checker
# ===========================

class WCAGCheckRequest(BaseModel):
    """Request for WCAG compliance check"""
    html_content: str
    url: Optional[str] = None  # Optional URL for reference


@app.post("/lucy/check", response_model=WCAGReport)
async def check_wcag(request: WCAGCheckRequest = Body(...)):
    """
    Check HTML content for WCAG compliance

    **Lucy** analyzes your HTML and identifies accessibility issues based on WCAG 2.1 guidelines.

    - **html_content**: HTML string to check
    - **url**: (Optional) URL for reference

    Returns a detailed compliance report with:
    - Total issues count
    - Issues categorized by severity (A, AA, AAA)
    - Compliance score (0-100)
    - Specific suggestions for fixing each issue
    """
    try:
        logger.info(f"Lucy checking WCAG compliance for content (length: {len(request.html_content)} chars)")

        if not request.html_content or not request.html_content.strip():
            raise HTTPException(status_code=400, detail="html_content cannot be empty")

        report = check_wcag_compliance(request.html_content)

        logger.info(f"Lucy found {report.total_issues} issues, compliance score: {report.score}")

        return report

    except Exception as e:
        logger.error(f"Error in Lucy WCAG check: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"WCAG check failed: {str(e)}")


@app.get("/lucy/info")
def lucy_info():
    """Get information about Lucy - WCAG Compliance Checker"""
    return {
        "name": "Lucy",
        "description": "WCAG 2.1 AA Compliance Checker",
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
        "compliance_levels": ["A", "AA", "AAA"],
        "output": {
            "total_issues": "Number of issues found",
            "critical_count": "Level A issues",
            "warning_count": "Level AA issues",
            "info_count": "Level AAA issues",
            "score": "Compliance score (0-100)",
            "issues": "Detailed list of all issues with suggestions"
        }
    }


# ===========================
# Project X - eBook Generator
# ===========================

@app.post("/project-x/generate", response_model=eBookResponse)
async def generate_ebook(request: eBookRequest = Body(...)):
    """
    Generate Kindle-friendly eBook

    **Project X** converts your content into professional eBooks compatible with Kindle and other readers.

    - **metadata**: Book information (title, author, language, etc.)
    - **chapters**: List of chapters with title and HTML content
    - **format**: Output format (epub, mobi, azw3)
    - **enable_toc**: Include table of contents
    - **enable_ncx**: Include navigation

    Returns base64-encoded eBook file ready for download.
    """
    try:
        logger.info(f"Project X generating {request.format} eBook: {request.metadata.title}")

        if not request.chapters or len(request.chapters) == 0:
            raise HTTPException(status_code=400, detail="At least one chapter is required")

        # Generate eBook
        result = create_ebook(
            metadata=request.metadata,
            chapters=request.chapters,
            format=request.format,
            enable_toc=request.enable_toc,
            enable_ncx=request.enable_ncx
        )

        if result.success:
            logger.info(f"Project X successfully generated eBook: {result.filename}")
        else:
            logger.error(f"Project X failed: {result.message}")

        return result

    except Exception as e:
        logger.error(f"Error in Project X eBook generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"eBook generation failed: {str(e)}")


@app.post("/project-x/download")
async def download_ebook(request: eBookRequest = Body(...)):
    """
    Generate and download eBook directly

    Same as /project-x/generate but returns the file as a download attachment.
    """
    try:
        logger.info(f"Project X generating eBook for download: {request.metadata.title}")

        result = create_ebook(
            metadata=request.metadata,
            chapters=request.chapters,
            format=request.format,
            enable_toc=request.enable_toc,
            enable_ncx=request.enable_ncx
        )

        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)

        # Decode base64 file data
        file_bytes = base64.b64decode(result.file_data)

        # Return as downloadable file
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
        logger.error(f"Error in Project X download: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"eBook download failed: {str(e)}")


@app.get("/project-x/info")
def project_x_info():
    """Get information about Project X - eBook Generator"""
    return {
        "name": "Project X",
        "description": "Kindle-friendly eBook Generator",
        "capabilities": [
            "Generate EPUB format eBooks",
            "Support for MOBI/AZW3 (via EPUB + conversion)",
            "Automatic table of contents",
            "NCX navigation support",
            "Kindle-optimized CSS styling",
            "Chapter management",
            "Metadata support (title, author, ISBN, etc.)",
            "Cover image support",
            "HTML content formatting"
        ],
        "supported_formats": {
            "epub": "Standard eBook format (fully supported)",
            "mobi": "Kindle format (via EPUB + Calibre conversion)",
            "azw3": "Enhanced Kindle format (via EPUB + Calibre conversion)"
        },
        "metadata_fields": [
            "title (required)",
            "author",
            "language",
            "publisher",
            "description",
            "cover_image (base64)",
            "isbn"
        ],
        "output": {
            "success": "Boolean indicating success",
            "message": "Status message",
            "file_data": "Base64 encoded eBook file",
            "filename": "Generated filename",
            "format": "Output format",
            "size_bytes": "File size in bytes"
        }
    }


# ===========================
# CGP Archetype Engine
# ===========================

from typing import List, Dict

class ArchetypeRecommendRequest(BaseModel):
    """Request for archetype recommendation"""
    current_state: str
    concerns: List[str]
    preferences: Dict[str, any] = {}


@app.get("/cgp/archetypes", response_model=List[ArchetypeProfile])
async def list_archetypes():
    """
    Get all available CGP care archetypes

    **CGP Archetype Engine** provides personalized care archetypes
    for wellness and ritual experiences.

    Returns a list of all 7 archetypes:
    - Griefwalker
    - Fighter
    - Self-Protector
    - Seeker
    - Solo Architect
    - Connector
    - Nurturer
    """
    try:
        archetypes = cgp_engine.get_all_archetypes()
        logger.info(f"Retrieved {len(archetypes)} archetypes")
        return archetypes
    except Exception as e:
        logger.error(f"Error retrieving archetypes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve archetypes: {str(e)}")


@app.get("/cgp/archetype/{name}", response_model=ArchetypeProfile)
async def get_archetype(name: str):
    """
    Get specific archetype by name

    Available archetypes:
    - Griefwalker
    - Fighter
    - Self-Protector
    - Seeker
    - Solo Architect
    - Connector
    - Nurturer

    Returns complete archetype profile including:
    - Narrative
    - Tone
    - Values
    - Risks
    - Features
    - Ritual text
    - PDF availability
    """
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
    """
    Get archetype recommendations based on current state and concerns

    Analyzes your current state, concerns, and preferences to recommend
    the most suitable care archetype(s).

    **Request body:**
    - **current_state**: Your current emotional/care state (e.g., "overwhelmed", "exploring", "grieving")
    - **concerns**: List of specific concerns (e.g., ["privacy", "burnout", "community support"])
    - **preferences**: Optional preferences dict

    **Returns:**
    List of recommended archetypes with confidence scores and reasoning
    """
    try:
        recommendations = cgp_engine.recommend_archetype(
            current_state=request.current_state,
            concerns=request.concerns,
            preferences=request.preferences
        )

        logger.info(f"Generated {len(recommendations)} recommendations for state: {request.current_state}")
        return recommendations
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@app.get("/cgp/pdf/{name}")
async def download_archetype_pdf(name: str):
    """
    Download archetype PDF guide

    Returns the PDF file for the specified archetype if available.
    """
    try:
        # Check if archetype exists
        archetype = cgp_engine.get_archetype(name)
        if not archetype:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        if not archetype.pdf_available:
            raise HTTPException(status_code=404, detail=f"PDF not available for archetype '{name}'")

        # Read PDF file
        pdf_path = Path(f"{name}.pdf")
        if not pdf_path.exists():
            raise HTTPException(status_code=404, detail=f"PDF file not found for '{name}'")

        with open(pdf_path, "rb") as f:
            pdf_data = f.read()

        logger.info(f"Serving PDF for archetype: {name}")

        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={name}.pdf",
                "Content-Length": str(len(pdf_data))
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving PDF for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to serve PDF: {str(e)}")


@app.get("/cgp/ritual/{name}")
async def get_archetype_ritual(name: str):
    """
    Get the ritual text for a specific archetype

    Returns just the ritual practice text for quick access.
    """
    try:
        ritual = cgp_engine.get_ritual_for_archetype(name)
        if not ritual:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        return {
            "archetype": name,
            "ritual": ritual
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving ritual for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve ritual: {str(e)}")


@app.get("/cgp/report/{name}")
async def get_archetype_report(name: str):
    """
    Get comprehensive archetype report

    Returns detailed report including:
    - Complete profile
    - Ritual guidance
    - Integration suggestions (Lucy, Project X)
    - Related archetypes
    """
    try:
        report = cgp_engine.generate_archetype_report(name)
        if not report:
            raise HTTPException(status_code=404, detail=f"Archetype '{name}' not found")

        logger.info(f"Generated comprehensive report for archetype: {name}")
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report for {name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@app.get("/cgp/info")
def cgp_info():
    """Get information about CGP Archetype Engine"""
    return {
        "name": "CGP Archetype Engine",
        "description": "Care archetypes for personalized wellness and ritual experiences",
        "version": "1.0 (Waltz 4 Expansion)",
        "archetypes": cgp_engine.get_archetype_names(),
        "capabilities": [
            "7 distinct care archetypes",
            "Personalized recommendations",
            "Daily ritual practices",
            "PDF guides for each archetype",
            "Integration with Lucy (WCAG) and Project X (eBook)",
            "Custom ritual creation",
            "Related archetype discovery"
        ],
        "archetype_components": {
            "narrative": "Core story and approach",
            "tone": "Communication style",
            "values": "Key principles",
            "risks": "What this archetype protects against",
            "features": "Specific support features",
            "ritual": "Daily practice text"
        },
        "integration": {
            "lucy": "Ensure archetype content is accessible",
            "project_x": "Generate personalized archetype eBooks",
            "future": "Ritual-Union sound therapy integration"
        }
    }


# ===========================
# Combined Workflow Endpoints
# ===========================

class WCAGAndEbookRequest(BaseModel):
    """Request for combined WCAG check + eBook generation"""
    html_content: str
    ebook_request: eBookRequest


@app.post("/workflow/check-and-generate")
async def check_and_generate(request: WCAGAndEbookRequest = Body(...)):
    """
    Combined workflow: Check WCAG compliance and generate eBook

    1. Lucy checks the content for WCAG compliance
    2. Project X generates the eBook

    Returns both the WCAG report and the generated eBook.
    """
    try:
        logger.info("Starting combined workflow: WCAG check + eBook generation")

        # Step 1: Check WCAG compliance
        wcag_report = check_wcag_compliance(request.html_content)
        logger.info(f"WCAG check complete: {wcag_report.total_issues} issues, score: {wcag_report.score}")

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
# Application Entry Point
# ===========================

if __name__ == "__main__":
    import uvicorn

    # Get port from environment variable (Railway provides this)
    port = int(os.getenv("PORT", 8000))

    # Bind to 0.0.0.0 to accept external connections (required for Railway)
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
