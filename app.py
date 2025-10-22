"""
XavierOS - WCAG Machine and eBook Generator
Main FastAPI application with Lucy (WCAG Checker) and Project X (eBook Formatter)
"""

import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import base64

# Import Lucy and Project X
from lucy import check_wcag_compliance, WCAGReport
from project_x import (
    create_ebook,
    eBookMetadata,
    Chapter,
    eBookRequest,
    eBookResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="XavierOS - WCAG Machine & eBook Generator",
    description="Personal WCAG compliance checker and Kindle-friendly eBook generator",
    version="1.0.0"
)

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
    """Root endpoint - Frontend portal"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>XavierOS - WCAG Machine & eBook Generator</title>
        <link rel="stylesheet" href="/static/style.css">
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>XavierOS</h1>
                <p class="subtitle">WCAG Machine & eBook Generator</p>
            </header>
            
            <main class="main-content">
                <div class="tools-grid">
                    <div class="tool-card" onclick="window.location.href='/lucy'">
                        <div class="tool-icon">🔍</div>
                        <h2>Lucy</h2>
                        <p class="tool-description">WCAG 2.1 AA Compliance Checker</p>
                        <ul class="tool-features">
                            <li>Check images for alt text</li>
                            <li>Verify heading hierarchy</li>
                            <li>Validate link accessibility</li>
                            <li>Check form labels</li>
                            <li>Verify color contrast</li>
                        </ul>
                        <button class="tool-button">Start Lucy</button>
                    </div>
                    
                    <div class="tool-card" onclick="window.location.href='/project-x'">
                        <div class="tool-icon">📚</div>
                        <h2>Project X</h2>
                        <p class="tool-description">Kindle-friendly eBook Generator</p>
                        <ul class="tool-features">
                            <li>Generate EPUB format eBooks</li>
                            <li>Multiple chapters support</li>
                            <li>Table of contents</li>
                            <li>Cover image support</li>
                            <li>Rich metadata</li>
                        </ul>
                        <button class="tool-button">Start Project X</button>
                    </div>
                </div>
            </main>
            
            <footer class="footer">
                <p>XavierOS v1.0.0 - Personal WCAG & eBook Tools</p>
                <div class="footer-links">
                    <a href="/docs">API Docs</a>
                    <a href="/health">Health Check</a>
                </div>
            </footer>
        </div>
    </body>
    </html>
    """


@app.get("/health")
def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "service": "XavierOS",
        "lucy": "operational",
        "project_x": "operational"
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


@app.get("/lucy", response_class=HTMLResponse)
def lucy_interface():
    """Lucy WCAG Checker Interface"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lucy - WCAG Compliance Checker | XavierOS</title>
        <link rel="stylesheet" href="/static/style.css">
    </head>
    <body>
        <div class="container">
            <header class="header">
                <div class="header-content">
                    <h1>🔍 Lucy</h1>
                    <p class="subtitle">WCAG 2.1 AA Compliance Checker</p>
                    <a href="/" class="back-button">← Back to XavierOS</a>
                </div>
            </header>
            
            <main class="main-content">
                <div class="tool-interface">
                    <div class="input-section">
                        <h2>Check HTML for WCAG Compliance</h2>
                        <form id="wcag-form">
                            <div class="form-group">
                                <label for="html-content">HTML Content:</label>
                                <textarea 
                                    id="html-content" 
                                    name="html_content" 
                                    placeholder="Paste your HTML content here..."
                                    rows="10"
                                ></textarea>
                            </div>
                            <div class="form-group">
                                <label for="url">URL (Optional):</label>
                                <input 
                                    type="url" 
                                    id="url" 
                                    name="url" 
                                    placeholder="https://example.com"
                                >
                            </div>
                            <button type="submit" class="submit-button">Check WCAG Compliance</button>
                        </form>
                    </div>
                    
                    <div class="results-section" id="results" style="display: none;">
                        <h2>WCAG Compliance Report</h2>
                        <div id="report-content"></div>
                    </div>
                </div>
            </main>
        </div>
        
        <script src="/static/script.js"></script>
    </body>
    </html>
    """


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


@app.get("/project-x", response_class=HTMLResponse)
def project_x_interface():
    """Project X eBook Generator Interface"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project X - eBook Generator | XavierOS</title>
        <link rel="stylesheet" href="/static/style.css">
    </head>
    <body>
        <div class="container">
            <header class="header">
                <div class="header-content">
                    <h1>📚 Project X</h1>
                    <p class="subtitle">Kindle-friendly eBook Generator</p>
                    <a href="/" class="back-button">← Back to XavierOS</a>
                </div>
            </header>
            
            <main class="main-content">
                <div class="tool-interface">
                    <div class="input-section">
                        <h2>Generate Your eBook</h2>
                        <form id="ebook-form">
                            <div class="form-section">
                                <h3>Book Metadata</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="book-title">Title *</label>
                                        <input type="text" id="book-title" name="title" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="book-author">Author</label>
                                        <input type="text" id="book-author" name="author" value="Unknown Author">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="book-language">Language</label>
                                        <select id="book-language" name="language">
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="book-publisher">Publisher</label>
                                        <input type="text" id="book-publisher" name="publisher">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="book-description">Description</label>
                                    <textarea id="book-description" name="description" rows="3"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="book-isbn">ISBN</label>
                                    <input type="text" id="book-isbn" name="isbn">
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h3>Chapters</h3>
                                <div id="chapters-container">
                                    <div class="chapter-item">
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Chapter Title</label>
                                                <input type="text" name="chapter_title" placeholder="Chapter 1">
                                            </div>
                                            <div class="form-group">
                                                <label>Order</label>
                                                <input type="number" name="chapter_order" value="1" min="1">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label>Chapter Content (HTML)</label>
                                            <textarea name="chapter_content" rows="5" placeholder="<p>Your chapter content here...</p>"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" id="add-chapter" class="add-button">+ Add Chapter</button>
                            </div>
                            
                            <div class="form-section">
                                <h3>Output Options</h3>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="ebook-format">Format</label>
                                        <select id="ebook-format" name="format">
                                            <option value="epub">EPUB</option>
                                            <option value="mobi">MOBI</option>
                                            <option value="azw3">AZW3</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" name="enable_toc" checked> Table of Contents
                                        </label>
                                    </div>
                                    <div class="form-group">
                                        <label>
                                            <input type="checkbox" name="enable_ncx" checked> NCX Navigation
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" class="submit-button">Generate eBook</button>
                        </form>
                    </div>
                    
                    <div class="results-section" id="results" style="display: none;">
                        <h2>eBook Generation Results</h2>
                        <div id="report-content"></div>
                    </div>
                </div>
            </main>
        </div>
        
        <script src="/static/script.js"></script>
    </body>
    </html>
    """


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
