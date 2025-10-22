"""
Lucy - WCAG Compliance Checker
Checks web content and HTML for WCAG 2.1 AA compliance
"""

from typing import Dict, List, Optional
from bs4 import BeautifulSoup
from pydantic import BaseModel
import re
import logging

logger = logging.getLogger(__name__)


class WCAGIssue(BaseModel):
    """Represents a single WCAG compliance issue"""
    level: str  # A, AA, AAA
    criterion: str  # WCAG criterion number (e.g., "1.1.1")
    title: str  # Issue title
    description: str  # Detailed description
    element: Optional[str] = None  # HTML element with issue
    suggestion: str  # How to fix


class WCAGReport(BaseModel):
    """Complete WCAG compliance report"""
    total_issues: int
    critical_count: int
    warning_count: int
    info_count: int
    issues: List[WCAGIssue]
    score: float  # 0-100 compliance score


class Lucy:
    """WCAG Compliance Checker"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def check_html(self, html_content: str) -> WCAGReport:
        """
        Check HTML content for WCAG compliance

        Args:
            html_content: HTML string to check

        Returns:
            WCAGReport with all issues found
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        issues = []

        # Check various WCAG criteria
        issues.extend(self._check_images(soup))
        issues.extend(self._check_headings(soup))
        issues.extend(self._check_links(soup))
        issues.extend(self._check_forms(soup))
        issues.extend(self._check_color_contrast(soup))
        issues.extend(self._check_language(soup))
        issues.extend(self._check_page_title(soup))
        issues.extend(self._check_keyboard_access(soup))
        issues.extend(self._check_tables(soup))
        issues.extend(self._check_multimedia(soup))

        # Calculate counts
        critical = sum(1 for i in issues if i.level == "A")
        warning = sum(1 for i in issues if i.level == "AA")
        info = sum(1 for i in issues if i.level == "AAA")

        # Calculate compliance score
        total_checks = len(issues) if issues else 1
        score = max(0, 100 - (critical * 10 + warning * 5 + info * 2))

        return WCAGReport(
            total_issues=len(issues),
            critical_count=critical,
            warning_count=warning,
            info_count=info,
            issues=issues,
            score=score
        )

    def _check_images(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 1.1.1 - Non-text Content"""
        issues = []
        images = soup.find_all('img')

        for img in images:
            if not img.get('alt'):
                issues.append(WCAGIssue(
                    level="A",
                    criterion="1.1.1",
                    title="Missing alt text on image",
                    description="Images must have alt text for screen readers",
                    element=str(img)[:100],
                    suggestion="Add descriptive alt text: <img src='...' alt='Description of image'>"
                ))
            elif img.get('alt', '').strip() == '':
                issues.append(WCAGIssue(
                    level="A",
                    criterion="1.1.1",
                    title="Empty alt text on image",
                    description="Alt attribute exists but is empty",
                    element=str(img)[:100],
                    suggestion="Add descriptive alt text or use alt='' for decorative images"
                ))

        return issues

    def _check_headings(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 2.4.6 - Headings and Labels"""
        issues = []
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

        # Check for missing h1
        h1_tags = soup.find_all('h1')
        if not h1_tags:
            issues.append(WCAGIssue(
                level="AA",
                criterion="2.4.6",
                title="Missing h1 heading",
                description="Page should have at least one h1 heading",
                element=None,
                suggestion="Add a descriptive h1 heading to the page"
            ))
        elif len(h1_tags) > 1:
            issues.append(WCAGIssue(
                level="AA",
                criterion="2.4.6",
                title="Multiple h1 headings",
                description="Page should have only one h1 heading",
                element=None,
                suggestion="Use only one h1 per page, use h2-h6 for subheadings"
            ))

        # Check heading hierarchy
        prev_level = 0
        for heading in headings:
            level = int(heading.name[1])
            if prev_level > 0 and level > prev_level + 1:
                issues.append(WCAGIssue(
                    level="AA",
                    criterion="2.4.6",
                    title="Skipped heading level",
                    description=f"Heading levels should not skip (found h{prev_level} then h{level})",
                    element=str(heading)[:100],
                    suggestion=f"Use h{prev_level + 1} instead of h{level}"
                ))
            prev_level = level

            # Check for empty headings
            if not heading.get_text().strip():
                issues.append(WCAGIssue(
                    level="A",
                    criterion="2.4.6",
                    title="Empty heading",
                    description="Headings should have descriptive text",
                    element=str(heading)[:100],
                    suggestion="Add descriptive text to the heading"
                ))

        return issues

    def _check_links(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 2.4.4 - Link Purpose"""
        issues = []
        links = soup.find_all('a')

        for link in links:
            href = link.get('href', '')
            text = link.get_text().strip()

            if not text and not link.find('img'):
                issues.append(WCAGIssue(
                    level="A",
                    criterion="2.4.4",
                    title="Empty link",
                    description="Links must have descriptive text or an image with alt text",
                    element=str(link)[:100],
                    suggestion="Add descriptive text to the link"
                ))

            # Check for generic link text
            generic_texts = ['click here', 'read more', 'more', 'link', 'here']
            if text.lower() in generic_texts:
                issues.append(WCAGIssue(
                    level="AA",
                    criterion="2.4.4",
                    title="Generic link text",
                    description=f"Link text '{text}' is not descriptive enough",
                    element=str(link)[:100],
                    suggestion="Use descriptive link text that explains the destination"
                ))

            # Check for title attribute without text
            if not text and link.get('title'):
                issues.append(WCAGIssue(
                    level="AA",
                    criterion="2.4.4",
                    title="Link relies on title attribute",
                    description="Title attribute alone is not accessible",
                    element=str(link)[:100],
                    suggestion="Add visible link text, don't rely on title attribute"
                ))

        return issues

    def _check_forms(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 3.3.2 - Labels or Instructions"""
        issues = []
        inputs = soup.find_all(['input', 'select', 'textarea'])

        for input_elem in inputs:
            input_type = input_elem.get('type', 'text')

            # Skip buttons and hidden inputs
            if input_type in ['submit', 'button', 'hidden', 'image']:
                continue

            input_id = input_elem.get('id')

            # Check for label
            label = None
            if input_id:
                label = soup.find('label', {'for': input_id})

            # Check for aria-label or aria-labelledby
            has_aria_label = input_elem.get('aria-label') or input_elem.get('aria-labelledby')

            if not label and not has_aria_label:
                issues.append(WCAGIssue(
                    level="A",
                    criterion="3.3.2",
                    title="Form input missing label",
                    description="All form inputs must have associated labels",
                    element=str(input_elem)[:100],
                    suggestion="Add <label for='input-id'>Label text</label> or aria-label attribute"
                ))

            # Check for required field indication
            if input_elem.get('required') and not input_elem.get('aria-required'):
                issues.append(WCAGIssue(
                    level="AA",
                    criterion="3.3.2",
                    title="Required field not indicated",
                    description="Required fields should have aria-required='true'",
                    element=str(input_elem)[:100],
                    suggestion="Add aria-required='true' to required fields"
                ))

        return issues

    def _check_color_contrast(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 1.4.3 - Contrast (Minimum)"""
        issues = []

        # This is a simplified check - real color contrast requires computed styles
        # and color ratio calculations
        elements_with_color = soup.find_all(style=re.compile(r'color\s*:'))

        if elements_with_color:
            issues.append(WCAGIssue(
                level="AA",
                criterion="1.4.3",
                title="Color contrast needs verification",
                description="Inline color styles found - verify contrast ratio is at least 4.5:1",
                element=None,
                suggestion="Use a color contrast checker tool to verify text is readable"
            ))

        return issues

    def _check_language(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 3.1.1 - Language of Page"""
        issues = []
        html_tag = soup.find('html')

        if not html_tag or not html_tag.get('lang'):
            issues.append(WCAGIssue(
                level="A",
                criterion="3.1.1",
                title="Missing language attribute",
                description="HTML element must have a lang attribute",
                element=str(html_tag)[:100] if html_tag else None,
                suggestion="Add lang='en' (or appropriate language code) to <html> tag"
            ))

        return issues

    def _check_page_title(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 2.4.2 - Page Titled"""
        issues = []
        title = soup.find('title')

        if not title:
            issues.append(WCAGIssue(
                level="A",
                criterion="2.4.2",
                title="Missing page title",
                description="Page must have a <title> element",
                element=None,
                suggestion="Add <title>Descriptive Page Title</title> in <head>"
            ))
        elif not title.get_text().strip():
            issues.append(WCAGIssue(
                level="A",
                criterion="2.4.2",
                title="Empty page title",
                description="Page title is empty",
                element=str(title),
                suggestion="Add descriptive text to the <title> element"
            ))

        return issues

    def _check_keyboard_access(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 2.1.1 - Keyboard"""
        issues = []

        # Check for onclick on non-interactive elements
        elements_with_onclick = soup.find_all(onclick=True)

        for elem in elements_with_onclick:
            if elem.name not in ['a', 'button', 'input', 'select', 'textarea']:
                has_tabindex = elem.get('tabindex') is not None
                has_role = elem.get('role') in ['button', 'link']

                if not has_tabindex and not has_role:
                    issues.append(WCAGIssue(
                        level="A",
                        criterion="2.1.1",
                        title="Non-keyboard accessible element",
                        description=f"<{elem.name}> with onclick may not be keyboard accessible",
                        element=str(elem)[:100],
                        suggestion="Add tabindex='0' and role='button', or use <button> element"
                    ))

        return issues

    def _check_tables(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 1.3.1 - Info and Relationships (Tables)"""
        issues = []
        tables = soup.find_all('table')

        for table in tables:
            # Check for table headers
            headers = table.find_all('th')
            if not headers:
                issues.append(WCAGIssue(
                    level="A",
                    criterion="1.3.1",
                    title="Table missing headers",
                    description="Data tables should use <th> elements for headers",
                    element=str(table)[:100],
                    suggestion="Use <th> elements for table headers with scope attribute"
                ))

            # Check for caption or summary
            caption = table.find('caption')
            summary = table.get('summary')

            if not caption and not summary:
                issues.append(WCAGIssue(
                    level="AA",
                    criterion="1.3.1",
                    title="Table missing caption",
                    description="Tables should have a <caption> to describe their purpose",
                    element=str(table)[:100],
                    suggestion="Add <caption>Table description</caption> inside <table>"
                ))

        return issues

    def _check_multimedia(self, soup: BeautifulSoup) -> List[WCAGIssue]:
        """Check WCAG 1.2.1 - Audio-only and Video-only"""
        issues = []

        # Check video elements
        videos = soup.find_all('video')
        for video in videos:
            if not video.find('track', {'kind': 'captions'}):
                issues.append(WCAGIssue(
                    level="A",
                    criterion="1.2.1",
                    title="Video missing captions",
                    description="Videos must have captions for accessibility",
                    element=str(video)[:100],
                    suggestion="Add <track kind='captions' src='captions.vtt'> to video"
                ))

        # Check audio elements
        audios = soup.find_all('audio')
        for audio in audios:
            issues.append(WCAGIssue(
                level="A",
                criterion="1.2.1",
                title="Audio needs transcript",
                description="Audio content should have a text transcript",
                element=str(audio)[:100],
                suggestion="Provide a link to a text transcript of the audio content"
            ))

        return issues


# Convenience function for API use
def check_wcag_compliance(html_content: str) -> WCAGReport:
    """
    Check HTML content for WCAG compliance

    Args:
        html_content: HTML string to check

    Returns:
        WCAGReport with all issues found
    """
    lucy = Lucy()
    return lucy.check_html(html_content)
