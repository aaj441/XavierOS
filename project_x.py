"""
Project X - eBook Formatter
Generates Kindle-friendly eBooks in various formats (EPUB, MOBI, AZW3)
"""

from typing import Optional, List, Dict
from pydantic import BaseModel
from bs4 import BeautifulSoup
import logging
import io
import base64
from datetime import datetime
import zipfile
import xml.etree.ElementTree as ET

# Try to import ebooklib, fall back to basic implementation if not available
try:
    from ebooklib import epub
    EBOOKLIB_AVAILABLE = True
except ImportError:
    EBOOKLIB_AVAILABLE = False
    logging.warning("ebooklib not available, using basic EPUB implementation")

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
        if EBOOKLIB_AVAILABLE:
            return self._generate_epub_with_ebooklib(metadata, chapters, enable_toc, enable_ncx)
        else:
            return self._generate_epub_basic(metadata, chapters, enable_toc, enable_ncx)

    def _generate_epub_with_ebooklib(
        self,
        metadata: eBookMetadata,
        chapters: List[Chapter],
        enable_toc: bool = True,
        enable_ncx: bool = True
    ) -> bytes:
        """Generate EPUB using ebooklib library"""
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
        spine = ['nav']

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
        if enable_toc:
            book.toc = tuple(epub_chapters)

        if enable_ncx:
            book.add_item(epub.EpubNcx())

        book.add_item(epub.EpubNav())

        # Set spine
        book.spine = spine

        # Generate EPUB file
        epub_data = io.BytesIO()
        epub.write_epub(epub_data, book)
        epub_data.seek(0)

        return epub_data.read()

    def _generate_epub_basic(
        self,
        metadata: eBookMetadata,
        chapters: List[Chapter],
        enable_toc: bool = True,
        enable_ncx: bool = True
    ) -> bytes:
        """Generate basic EPUB without ebooklib dependency"""
        # Create a basic EPUB structure
        epub_buffer = io.BytesIO()
        
        with zipfile.ZipFile(epub_buffer, 'w', zipfile.ZIP_DEFLATED) as epub_zip:
            # Add mimetype (must be first and uncompressed)
            epub_zip.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
            
            # Add META-INF/container.xml
            container_xml = '''<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
</container>'''
            epub_zip.writestr('META-INF/container.xml', container_xml)
            
            # Sort chapters by order
            sorted_chapters = sorted(chapters, key=lambda c: c.order)
            
            # Generate content.opf
            book_id = metadata.isbn or f"id-{datetime.now().timestamp()}"
            content_opf = self._generate_content_opf(metadata, sorted_chapters, book_id)
            epub_zip.writestr('OEBPS/content.opf', content_opf)
            
            # Generate toc.ncx if enabled
            if enable_ncx:
                toc_ncx = self._generate_toc_ncx(metadata, sorted_chapters, book_id)
                epub_zip.writestr('OEBPS/toc.ncx', toc_ncx)
            
            # Add CSS
            css_content = self._get_kindle_css()
            epub_zip.writestr('OEBPS/style.css', css_content)
            
            # Add chapters
            for idx, chapter in enumerate(sorted_chapters, 1):
                content_html = self._format_chapter_html_basic(chapter.content, chapter.title)
                epub_zip.writestr(f'OEBPS/chapter_{idx}.xhtml', content_html)
        
        epub_buffer.seek(0)
        return epub_buffer.read()

    def _generate_content_opf(self, metadata: eBookMetadata, chapters: List[Chapter], book_id: str) -> str:
        """Generate content.opf file"""
        chapter_items = []
        chapter_refs = []
        
        for idx, chapter in enumerate(chapters, 1):
            chapter_items.append(f'    <item id="chapter_{idx}" href="chapter_{idx}.xhtml" media-type="application/xhtml+xml"/>')
            chapter_refs.append(f'    <itemref idref="chapter_{idx}"/>')
        
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="2.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:identifier id="BookId">{book_id}</dc:identifier>
        <dc:title>{metadata.title}</dc:title>
        <dc:creator>{metadata.author}</dc:creator>
        <dc:language>{metadata.language}</dc:language>
        {f'<dc:publisher>{metadata.publisher}</dc:publisher>' if metadata.publisher else ''}
        {f'<dc:description>{metadata.description}</dc:description>' if metadata.description else ''}
        <meta name="cover" content="cover"/>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
        <item id="style" href="style.css" media-type="text/css"/>
{chr(10).join(chapter_items)}
    </manifest>
    <spine toc="ncx">
{chr(10).join(chapter_refs)}
    </spine>
</package>'''

    def _generate_toc_ncx(self, metadata: eBookMetadata, chapters: List[Chapter], book_id: str) -> str:
        """Generate toc.ncx file"""
        nav_points = []
        
        for idx, chapter in enumerate(chapters, 1):
            nav_points.append(f'''    <navPoint id="navPoint-{idx}" playOrder="{idx}">
        <navLabel>
            <text>{chapter.title}</text>
        </navLabel>
        <content src="chapter_{idx}.xhtml"/>
    </navPoint>''')
        
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="{book_id}"/>
        <meta name="dtb:depth" content="1"/>
        <meta name="dtb:totalPageCount" content="0"/>
        <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
        <text>{metadata.title}</text>
    </docTitle>
    <navMap>
{chr(10).join(nav_points)}
    </navMap>
</ncx>'''

    def _format_chapter_html_basic(self, content: str, title: str) -> str:
        """Format chapter HTML for basic EPUB"""
        # Parse HTML
        soup = BeautifulSoup(content, 'html.parser')
        
        return f'''<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>{title}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
    <h1>{title}</h1>
    <div class="chapter-content">
        {soup.prettify()}
    </div>
</body>
</html>'''

    def _format_chapter_html(self, content: str, title: str) -> str:
        """
        Format chapter HTML for eBook rendering

        Args:
            content: Raw HTML content
            title: Chapter title

        Returns:
            Formatted HTML
        """
        # Parse HTML
        soup = BeautifulSoup(content, 'html.parser')

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
        {soup.prettify()}
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

            return eBookResponse(
                success=True,
                message=f"Successfully generated {format.upper()} eBook",
                file_data=file_data_b64,
                filename=filename,
                format=format,
                size_bytes=len(file_data)
            )

        except Exception as e:
            self.logger.error(f"Error generating eBook: {e}", exc_info=True)
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
