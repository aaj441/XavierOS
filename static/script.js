// XavierOS - Frontend JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the appropriate interface based on the current page
    if (window.location.pathname === '/lucy') {
        initLucyInterface();
    } else if (window.location.pathname === '/project-x') {
        initProjectXInterface();
    }
});

// Lucy WCAG Checker Interface
function initLucyInterface() {
    const form = document.getElementById('wcag-form');
    const resultsSection = document.getElementById('results');
    const reportContent = document.getElementById('report-content');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const htmlContent = formData.get('html_content');
        const url = formData.get('url');

        if (!htmlContent.trim()) {
            alert('Please enter HTML content to check.');
            return;
        }

        // Show loading state
        const submitButton = form.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<span class="loading"></span> Checking...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/lucy/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html_content: htmlContent,
                    url: url || null
                })
            });

            const report = await response.json();

            if (response.ok) {
                displayWCAGReport(report);
                resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(report.detail || 'WCAG check failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error checking WCAG compliance: ' + error.message);
        } finally {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

function displayWCAGReport(report) {
    const reportContent = document.getElementById('report-content');
    
    const summaryHTML = `
        <div class="wcag-summary">
            <div class="wcag-stat score">
                <h3>${report.score.toFixed(1)}</h3>
                <p>Compliance Score</p>
            </div>
            <div class="wcag-stat critical">
                <h3>${report.critical_count}</h3>
                <p>Critical (A)</p>
            </div>
            <div class="wcag-stat warning">
                <h3>${report.warning_count}</h3>
                <p>Warning (AA)</p>
            </div>
            <div class="wcag-stat info">
                <h3>${report.info_count}</h3>
                <p>Info (AAA)</p>
            </div>
        </div>
    `;

    let issuesHTML = '';
    if (report.issues && report.issues.length > 0) {
        issuesHTML = '<div class="wcag-issues"><h3>Issues Found</h3>';
        report.issues.forEach(issue => {
            issuesHTML += `
                <div class="wcag-issue ${issue.level.toLowerCase()}">
                    <div class="criterion">WCAG ${issue.criterion} (Level ${issue.level})</div>
                    <h4>${issue.title}</h4>
                    <p>${issue.description}</p>
                    ${issue.element ? `<p><strong>Element:</strong> <code>${escapeHtml(issue.element)}</code></p>` : ''}
                    <div class="suggestion">
                        <strong>Suggestion:</strong> ${issue.suggestion}
                    </div>
                </div>
            `;
        });
        issuesHTML += '</div>';
    } else {
        issuesHTML = '<div class="wcag-issues"><h3>🎉 No Issues Found!</h3><p>Your HTML content appears to be WCAG compliant.</p></div>';
    }

    reportContent.innerHTML = summaryHTML + issuesHTML;
}

// Project X eBook Generator Interface
function initProjectXInterface() {
    const form = document.getElementById('ebook-form');
    const resultsSection = document.getElementById('results');
    const reportContent = document.getElementById('report-content');
    const chaptersContainer = document.getElementById('chapters-container');
    const addChapterButton = document.getElementById('add-chapter');

    let chapterCount = 1;

    // Add chapter functionality
    addChapterButton.addEventListener('click', function() {
        chapterCount++;
        const chapterHTML = `
            <div class="chapter-item">
                <button type="button" class="remove-chapter" onclick="removeChapter(this)">×</button>
                <div class="form-row">
                    <div class="form-group">
                        <label>Chapter Title</label>
                        <input type="text" name="chapter_title" placeholder="Chapter ${chapterCount}">
                    </div>
                    <div class="form-group">
                        <label>Order</label>
                        <input type="number" name="chapter_order" value="${chapterCount}" min="1">
                    </div>
                </div>
                <div class="form-group">
                    <label>Chapter Content (HTML)</label>
                    <textarea name="chapter_content" rows="5" placeholder="<p>Your chapter content here...</p>"></textarea>
                </div>
            </div>
        `;
        chaptersContainer.insertAdjacentHTML('beforeend', chapterHTML);
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Collect metadata
        const metadata = {
            title: formData.get('title'),
            author: formData.get('author') || 'Unknown Author',
            language: formData.get('language') || 'en',
            publisher: formData.get('publisher') || null,
            description: formData.get('description') || null,
            isbn: formData.get('isbn') || null
        };

        // Collect chapters
        const chapters = [];
        const chapterItems = chaptersContainer.querySelectorAll('.chapter-item');
        
        chapterItems.forEach((item, index) => {
            const title = item.querySelector('input[name="chapter_title"]').value;
            const content = item.querySelector('textarea[name="chapter_content"]').value;
            const order = parseInt(item.querySelector('input[name="chapter_order"]').value) || index + 1;
            
            if (title.trim() && content.trim()) {
                chapters.push({
                    title: title.trim(),
                    content: content.trim(),
                    order: order
                });
            }
        });

        if (chapters.length === 0) {
            alert('Please add at least one chapter with content.');
            return;
        }

        // Collect other options
        const ebookRequest = {
            metadata: metadata,
            chapters: chapters,
            format: formData.get('format') || 'epub',
            enable_toc: formData.has('enable_toc'),
            enable_ncx: formData.has('enable_ncx')
        };

        // Show loading state
        const submitButton = form.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.innerHTML = '<span class="loading"></span> Generating...';
        submitButton.disabled = true;

        try {
            const response = await fetch('/project-x/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ebookRequest)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                displayEbookResult(result);
                resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.message || 'eBook generation failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating eBook: ' + error.message);
        } finally {
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

function displayEbookResult(result) {
    const reportContent = document.getElementById('report-content');
    
    const fileSize = result.size_bytes ? formatFileSize(result.size_bytes) : 'Unknown';
    
    const resultHTML = `
        <div class="ebook-result ${result.success ? 'success' : 'error'}">
            <h3>${result.success ? '✅ eBook Generated Successfully!' : '❌ Generation Failed'}</h3>
            <p>${result.message}</p>
            
            ${result.success ? `
                <div class="file-info">
                    <p><strong>Filename:</strong> ${result.filename}</p>
                    <p><strong>Format:</strong> ${result.format.toUpperCase()}</p>
                    <p><strong>Size:</strong> ${fileSize}</p>
                </div>
                
                <button class="download-button" onclick="downloadEbook('${result.file_data}', '${result.filename}')">
                    📥 Download ${result.filename}
                </button>
            ` : ''}
        </div>
    `;

    reportContent.innerHTML = resultHTML;
}

function downloadEbook(fileData, filename) {
    try {
        // Decode base64 data
        const binaryString = atob(fileData);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and download
        const blob = new Blob([bytes], { type: 'application/epub+zip' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading file. Please try again.');
    }
}

function removeChapter(button) {
    const chapterItem = button.closest('.chapter-item');
    chapterItem.remove();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}