// XavierOS Frontend JavaScript

const API_BASE = window.location.origin;

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Hide all tab buttons active state
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Activate button
    event.target.closest('.tab-button').classList.add('active');

    // Load archetypes when CGP tab is opened
    if (tabName === 'cgp' && !document.querySelector('.archetype-card')) {
        loadArchetypes();
    }
}

// Show/hide loading spinner
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// ============================================
// LUCY - WCAG COMPLIANCE CHECKER
// ============================================

document.getElementById('lucy-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const htmlContent = document.getElementById('html-content').value;
    const urlReference = document.getElementById('url-reference').value;

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/lucy/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html_content: htmlContent,
                url: urlReference || null
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayLucyResults(data);
        } else {
            alert(`Error: ${data.detail || 'Failed to check compliance'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to check WCAG compliance. Please try again.');
    } finally {
        hideLoading();
    }
});

function displayLucyResults(data) {
    const resultsDiv = document.getElementById('lucy-results');
    resultsDiv.classList.remove('hidden');

    // Update score
    document.getElementById('compliance-score').textContent = Math.round(data.score);
    document.getElementById('critical-count').textContent = data.critical_count;
    document.getElementById('warning-count').textContent = data.warning_count;
    document.getElementById('info-count').textContent = data.info_count;

    // Display issues
    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = '';

    if (data.issues.length === 0) {
        issuesList.innerHTML = '<div class="issue-item" style="border-color: #10B981;"><p>✅ No issues found! Your content is WCAG compliant.</p></div>';
        return;
    }

    data.issues.forEach(issue => {
        const issueDiv = document.createElement('div');
        issueDiv.className = `issue-item level-${issue.level}`;

        issueDiv.innerHTML = `
            <div class="issue-header">
                <div class="issue-title">${issue.title}</div>
                <div class="issue-criterion">WCAG ${issue.criterion} (Level ${issue.level})</div>
            </div>
            <div class="issue-description">${issue.description}</div>
            ${issue.element ? `<code style="display: block; padding: 10px; background: #f3f4f6; border-radius: 6px; margin: 10px 0; overflow-x: auto;">${escapeHtml(issue.element)}</code>` : ''}
            <div class="issue-suggestion">
                <strong>💡 Suggestion:</strong>
                ${issue.suggestion}
            </div>
        `;

        issuesList.appendChild(issueDiv);
    });

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// PROJECT X - EBOOK GENERATOR
// ============================================

let ebookFileData = null;
let ebookFilename = null;

// Add chapter functionality
function addChapter() {
    const container = document.getElementById('chapters-container');
    const chapterNumber = container.children.length + 1;

    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'chapter-item';
    chapterDiv.innerHTML = `
        <input type="text" class="chapter-title" placeholder="Chapter ${chapterNumber} Title" required>
        <textarea class="chapter-content" rows="5" placeholder="Chapter content (HTML supported)..." required></textarea>
    `;

    container.appendChild(chapterDiv);
}

document.getElementById('projectx-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect metadata
    const metadata = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('book-author').value || 'Unknown Author',
        language: document.getElementById('book-language').value,
        publisher: document.getElementById('book-publisher').value || null,
        description: document.getElementById('book-description').value || null
    };

    // Collect chapters
    const chapters = [];
    const chapterItems = document.querySelectorAll('.chapter-item');

    chapterItems.forEach((item, index) => {
        const title = item.querySelector('.chapter-title').value;
        const content = item.querySelector('.chapter-content').value;

        chapters.push({
            title: title,
            content: content,
            order: index + 1
        });
    });

    if (chapters.length === 0) {
        alert('Please add at least one chapter');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/project-x/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                metadata: metadata,
                chapters: chapters,
                format: 'epub',
                enable_toc: true,
                enable_ncx: true
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            ebookFileData = data.file_data;
            ebookFilename = data.filename;
            displayProjectXResults(data);
        } else {
            alert(`Error: ${data.message || 'Failed to generate eBook'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate eBook. Please try again.');
    } finally {
        hideLoading();
    }
});

function displayProjectXResults(data) {
    const resultsDiv = document.getElementById('projectx-results');
    resultsDiv.classList.remove('hidden');

    document.getElementById('ebook-filename').textContent = data.filename;
    document.getElementById('ebook-format').textContent = data.format.toUpperCase();
    document.getElementById('ebook-size').textContent = formatBytes(data.size_bytes);

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('download-ebook').addEventListener('click', () => {
    if (!ebookFileData || !ebookFilename) {
        alert('No eBook to download');
        return;
    }

    // Convert base64 to blob and download
    const byteCharacters = atob(ebookFileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/epub+zip' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ebookFilename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// CGP - ARCHETYPE ENGINE
// ============================================

let allArchetypes = [];

function showCGPSection(section) {
    document.querySelectorAll('.cgp-section').forEach(s => {
        s.classList.add('hidden');
    });

    if (section === 'recommend') {
        document.getElementById('cgp-recommend').classList.remove('hidden');
    } else if (section === 'browse') {
        document.getElementById('cgp-browse').classList.remove('hidden');
        if (allArchetypes.length === 0) {
            loadArchetypes();
        }
    }
}

async function loadArchetypes() {
    showLoading();

    try {
        const response = await fetch(`${API_BASE}/cgp/archetypes`);
        const data = await response.json();

        if (response.ok) {
            allArchetypes = data;
            displayArchetypes(data);
        } else {
            alert('Failed to load archetypes');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load archetypes. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayArchetypes(archetypes) {
    const grid = document.getElementById('archetypes-grid');
    grid.innerHTML = '';

    archetypes.forEach(archetype => {
        const card = document.createElement('div');
        card.className = 'archetype-card';
        card.onclick = () => showArchetypeDetail(archetype.name);

        card.innerHTML = `
            <h4>${archetype.name}</h4>
            <div class="tone">${archetype.data.tone}</div>
            <div class="narrative">${archetype.data.narrative}</div>
        `;

        grid.appendChild(card);
    });
}

document.getElementById('cgp-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentState = document.getElementById('current-state').value;
    const concernsText = document.getElementById('concerns').value;
    const concerns = concernsText.split(',').map(c => c.trim()).filter(c => c);

    showLoading();

    try {
        const response = await fetch(`${API_BASE}/cgp/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_state: currentState,
                concerns: concerns,
                preferences: {}
            })
        });

        const data = await response.json();

        if (response.ok) {
            displayRecommendations(data);
        } else {
            alert(`Error: ${data.detail || 'Failed to get recommendations'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to get recommendations. Please try again.');
    } finally {
        hideLoading();
    }
});

function displayRecommendations(recommendations) {
    const resultsDiv = document.getElementById('cgp-recommendations');
    const listDiv = document.getElementById('recommendations-list');

    resultsDiv.classList.remove('hidden');
    listDiv.innerHTML = '';

    recommendations.forEach(rec => {
        const recDiv = document.createElement('div');
        recDiv.className = 'recommendation-item';
        recDiv.onclick = () => showArchetypeDetail(rec.archetype_name);

        recDiv.innerHTML = `
            <div class="recommendation-header">
                <div class="recommendation-name">${rec.archetype_name}</div>
                <div class="confidence-badge">${Math.round(rec.confidence * 100)}% match</div>
            </div>
            <div class="recommendation-reasoning">${rec.reasoning}</div>
        `;

        listDiv.appendChild(recDiv);
    });

    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function showArchetypeDetail(name) {
    showLoading();

    try {
        const response = await fetch(`${API_BASE}/cgp/archetype/${encodeURIComponent(name)}`);
        const data = await response.json();

        if (response.ok) {
            displayArchetypeModal(data);
        } else {
            alert(`Failed to load archetype details: ${data.detail}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load archetype details. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayArchetypeModal(archetype) {
    const modal = document.getElementById('archetype-modal');
    const detailDiv = document.getElementById('archetype-detail');

    const pdfButton = archetype.pdf_available
        ? `<button class="btn btn-success" onclick="downloadArchetypePDF('${archetype.name}')">📥 Download PDF Guide</button>`
        : '';

    detailDiv.innerHTML = `
        <h2>${archetype.name}</h2>

        <div class="detail-section">
            <h3>Tone</h3>
            <div class="tag">${archetype.data.tone}</div>
        </div>

        <div class="detail-section">
            <h3>Narrative</h3>
            <p>${archetype.data.narrative}</p>
        </div>

        <div class="ritual-box">
            ${archetype.data.ritual}
        </div>

        <div class="detail-section">
            <h3>Core Values</h3>
            <div class="tags">
                ${archetype.data.values.map(v => `<div class="tag">${v}</div>`).join('')}
            </div>
        </div>

        <div class="detail-section">
            <h3>Protects Against</h3>
            <div class="tags">
                ${archetype.data.risks.map(r => `<div class="tag">${r}</div>`).join('')}
            </div>
        </div>

        <div class="detail-section">
            <h3>Key Features</h3>
            <ul>
                ${archetype.data.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        ${pdfButton}
    `;

    modal.classList.remove('hidden');
}

function closeArchetypeModal() {
    document.getElementById('archetype-modal').classList.add('hidden');
}

async function downloadArchetypePDF(name) {
    try {
        const response = await fetch(`${API_BASE}/cgp/pdf/${encodeURIComponent(name)}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('PDF not available for this archetype');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to download PDF. Please try again.');
    }
}

// Close modal when clicking outside
document.getElementById('archetype-modal').addEventListener('click', (e) => {
    if (e.target.id === 'archetype-modal') {
        closeArchetypeModal();
    }
});

// Initialize - Load archetypes on page load for CGP tab
document.addEventListener('DOMContentLoaded', () => {
    console.log('XavierOS Frontend initialized');
});
