"""
Project X - eBook Formatter
Generates Kindle-friendly eBooks in various formats (EPUB, MOBI, AZW3)
"""

from typing import Optional, List, Dict
from pydantic import BaseModel
from ebooklib import epub
from bs4 import BeautifulSoup
import logging
import io
import base64
from datetime import datetime

logger = logging.getLogger(__name__)


class eBookMetadata(BaseModel):
    """Metadata for eBook generation"""
    title: str
    author: str = "Unknown Author"
    language: str = "en"
    publisher: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None  # Base64 encoded or URL
    isbn: Optional[str] = None


class Chapter(BaseModel):
    """Represents a chapter in the eBook"""
    title: str
    content: str  # HTML content
    order: int = 0


class eBookRequest(BaseModel):
    """Request for eBook generation"""
    metadata: eBookMetadata
    chapters: List[Chapter]
    format: str = "epub"  # epub, mobi, azw3
    enable_toc: bool = True  # Table of contents
    enable_ncx: bool = True  # Navigation


class eBookResponse(BaseModel):
    """Response from eBook generation"""
    success: bool
    message: str
    file_data: Optional[str] = None  # Base64 encoded eBook file
    filename: str
    format: str
    size_bytes: Optional[int] = None


class ProjectX:
    """eBook Formatter for Kindle-friendly formats"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def generate_epub(
        self,
        metadata: eBookMetadata,
        chapters: List[Chapter],
        enable_toc: bool = True,
        enable_ncx: bool = True
    ) -> bytes:
        """
        Generate EPUB format eBook

        Args:
            metadata: eBook metadata
            chapters: List of chapters
            enable_toc: Enable table of contents
            enable_ncx: Enable NCX navigation

        Returns:
            EPUB file as bytes
        """
        self.logger.info(f"Starting EPUB generation for '{metadata.title}' with {len(chapters)} chapters")
        book = epub.EpubBook()

        # Set metadata
        book.set_identifier(metadata.isbn or f"id-{datetime.now().timestamp()}")
        book.set_title(metadata.title)
        book.set_language(metadata.language)
        book.add_author(metadata.author)

        if metadata.publisher:
            book.add_metadata('DC', 'publisher', metadata.publisher)

        if metadata.description:
            book.add_metadata('DC', 'description', metadata.description)

        # Add cover image if provided
        if metadata.cover_image:
            try:
                # Handle base64 encoded images
                if metadata.cover_image.startswith('data:image'):
                    # Extract base64 data
                    header, data = metadata.cover_image.split(',', 1)
                    image_data = base64.b64decode(data)
                    image_ext = header.split('/')[1].split(';')[0]
                elif metadata.cover_image.startswith('http'):
                    # For URLs, we'd need to fetch - skip for now
                    self.logger.warning("URL cover images not yet supported")
                    image_data = None
                    image_ext = None
                else:
                    # Assume it's base64 without header
                    image_data = base64.b64decode(metadata.cover_image)
                    image_ext = 'jpeg'

                if image_data:
                    book.set_cover(f"cover.{image_ext}", image_data)
            except Exception as e:
                self.logger.error(f"Error adding cover image: {e}")

        # Sort chapters by order
        sorted_chapters = sorted(chapters, key=lambda c: c.order)

        # Create EPUB chapters
        epub_chapters = []
        spine = []

        for idx, chapter in enumerate(sorted_chapters, 1):
            # Clean and format HTML content
            content_html = self._format_chapter_html(chapter.content, chapter.title)

            # Create EPUB chapter
            epub_chapter = epub.EpubHtml(
                title=chapter.title,
                file_name=f'chapter_{idx}.xhtml',
                lang=metadata.language
            )
            epub_chapter.content = content_html

            # Add chapter to book
            book.add_item(epub_chapter)
            epub_chapters.append(epub_chapter)
            spine.append(epub_chapter)

        # Add default CSS for better Kindle rendering
        style = self._get_kindle_css()
        nav_css = epub.EpubItem(
            uid="style_nav",
            file_name="style/nav.css",
            media_type="text/css",
            content=style
        )
        book.add_item(nav_css)

        # Add navigation files
        book.toc = tuple(epub_chapters) if epub_chapters else ()

        # Add NCX and Nav
        if enable_ncx:
            book.add_item(epub.EpubNcx())
        
        if enable_toc:
            nav = epub.EpubNav()
            book.add_item(nav)
            # Set spine with nav first if we have it
            book.spine = [nav] + spine
        else:
            # No nav, just chapters
            book.spine = spine

        # Generate EPUB file
        epub_data = io.BytesIO()
        try:
            epub.write_epub(epub_data, book, {})
            epub_data.seek(0)
            return epub_data.read()
        except Exception as e:
            self.logger.error(f"Error writing EPUB: {e}")
            raise

    def _format_chapter_html(self, content: str, title: str) -> str:
        """
        Format chapter HTML for eBook rendering

        Args:
            content: Raw HTML content
            title: Chapter title

        Returns:
            Formatted HTML
        """
        # Ensure content is not empty
        if not content or not content.strip():
            content = "<p>No content available.</p>"

        # Create proper HTML structure
        html_template = f"""<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <title>{title}</title>
    <link rel="stylesheet" type="text/css" href="../style/nav.css"/>
</head>
<body>
    <h1>{title}</h1>
    <div class="chapter-content">
        {content}
    </div>
</body>
</html>"""

        return html_template

    def _get_kindle_css(self) -> str:
        """
        Get CSS optimized for Kindle rendering

        Returns:
            CSS string
        """
        return """
        @namespace epub "http://www.idpf.org/2007/ops";

        body {
            font-family: Georgia, serif;
            line-height: 1.6;
            margin: 1em;
            text-align: justify;
        }

        h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 1em;
            text-align: center;
            page-break-before: always;
        }

        h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }

        h3 {
            font-size: 1.2em;
            font-weight: bold;
            margin-top: 0.8em;
            margin-bottom: 0.4em;
        }

        p {
            margin: 0.5em 0;
            text-indent: 1.5em;
        }

        p.first-paragraph {
            text-indent: 0;
        }

        blockquote {
            margin: 1em 2em;
            font-style: italic;
        }

        code {
            font-family: "Courier New", monospace;
            background-color: #f4f4f4;
            padding: 0.2em 0.4em;
        }

        pre {
            font-family: "Courier New", monospace;
            background-color: #f4f4f4;
            padding: 1em;
            overflow-x: auto;
            white-space: pre-wrap;
        }

        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }

        li {
            margin: 0.5em 0;
        }

        a {
            color: #0066cc;
            text-decoration: underline;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        .chapter-content {
            margin-top: 2em;
        }

        /* Kindle-specific adjustments */
        @media amzn-kf8 {
            body {
                font-family: Bookerly, Georgia, serif;
            }
        }

        /* Table styling */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 0.5em;
            text-align: left;
        }

        th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        """

    def create_ebook(
        self,
        metadata: eBookMetadata,
        chapters: List[Chapter],
        format: str = "epub",
        enable_toc: bool = True,
        enable_ncx: bool = True
    ) -> eBookResponse:
        """
        Create eBook in specified format

        Args:
            metadata: eBook metadata
            chapters: List of chapters
            format: Output format (epub, mobi, azw3)
            enable_toc: Enable table of contents
            enable_ncx: Enable NCX navigation

        Returns:
            eBookResponse with generated file
        """
        try:
            if format.lower() == "epub":
                file_data = self.generate_epub(metadata, chapters, enable_toc, enable_ncx)
                filename = f"{metadata.title.replace(' ', '_')}.epub"

            elif format.lower() in ["mobi", "azw3"]:
                # First generate EPUB, then convert to MOBI/AZW3
                # Note: Actual MOBI/AZW3 conversion requires calibre or kindlegen
                # For now, generate EPUB and provide instructions
                file_data = self.generate_epub(metadata, chapters, enable_toc, enable_ncx)
                filename = f"{metadata.title.replace(' ', '_')}.epub"

                return eBookResponse(
                    success=True,
                    message=f"Generated EPUB. To convert to {format.upper()}, use Calibre or Kindle Previewer.",
                    file_data=base64.b64encode(file_data).decode('utf-8'),
                    filename=filename,
                    format="epub",
                    size_bytes=len(file_data)
                )

            else:
                return eBookResponse(
                    success=False,
                    message=f"Unsupported format: {format}. Supported: epub",
                    filename="",
                    format=format
                )

            # Encode file data as base64
            file_data_b64 = base64.b64encode(file_data).decode('utf-8')
            
            self.logger.info(f"Successfully generated {format} eBook: {filename} ({len(file_data)} bytes)")

            return eBookResponse(
                success=True,
                message=f"Successfully generated {format.upper()} eBook",
                file_data=file_data_b64,
                filename=filename,
                format=format,
                size_bytes=len(file_data)
            )

        except Exception as e:
            import traceback
            self.logger.error(f"Error generating eBook: {e}")
            self.logger.error(f"Traceback: {traceback.format_exc()}")
            return eBookResponse(
                success=False,
                message=f"Error generating eBook: {str(e)}",
                filename="",
                format=format
            )


# Convenience function for API use
def create_ebook(
    metadata: eBookMetadata,
    chapters: List[Chapter],
    format: str = "epub",
    enable_toc: bool = True,
    enable_ncx: bool = True
) -> eBookResponse:
    """
    Create eBook in specified format

    Args:
        metadata: eBook metadata
        chapters: List of chapters
        format: Output format (epub, mobi, azw3)
        enable_toc: Enable table of contents
        enable_ncx: Enable NCX navigation

    Returns:
        eBookResponse with generated file
    """
    project_x = ProjectX()
    return project_x.create_ebook(metadata, chapters, format, enable_toc, enable_ncx)
