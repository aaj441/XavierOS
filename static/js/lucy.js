// Lucy WCAG Checker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('wcag-form');
    const resultsSection = document.getElementById('results-section');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    
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
        showLoading();
        
        try {
            const response = await makeAPICall('/lucy/check', 'POST', {
                html_content: htmlContent,
                url: url || null
            });
            
            displayResults(response);
            
        } catch (err) {
            console.error('Error checking WCAG compliance:', err);
            showError('Failed to check WCAG compliance. Please try again.');
        }
    });
});

function showLoading() {
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
}

function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('error').style.display = 'block';
    document.getElementById('error-message').textContent = message;
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function displayResults(report) {
    // Hide loading and error states
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    
    // Update summary cards
    document.getElementById('compliance-score').textContent = Math.round(report.score);
    document.getElementById('critical-count').textContent = report.critical_count;
    document.getElementById('warning-count').textContent = report.warning_count;
    document.getElementById('info-count').textContent = report.info_count;
    
    // Update issues list
    const issuesList = document.getElementById('issues-list');
    issuesList.innerHTML = '';
    
    if (report.issues && report.issues.length > 0) {
        report.issues.forEach(issue => {
            const issueElement = createIssueElement(issue);
            issuesList.appendChild(issueElement);
        });
    } else {
        issuesList.innerHTML = `
            <div class="no-issues">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #38b2ac; margin-bottom: 1rem;"></i>
                <h3 style="color: #2d3748; margin-bottom: 1rem;">Great job!</h3>
                <p style="color: #718096;">No WCAG compliance issues found in your HTML content.</p>
            </div>
        `;
    }
    
    // Show results section
    document.getElementById('results-section').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function createIssueElement(issue) {
    const issueDiv = document.createElement('div');
    issueDiv.className = `issue-item level-${issue.level.toLowerCase()}`;
    
    const levelClass = `level-${issue.level.toLowerCase()}`;
    
    issueDiv.innerHTML = `
        <div class="issue-header">
            <span class="issue-level ${levelClass}">Level ${issue.level}</span>
            <span class="issue-criterion">WCAG ${issue.criterion}</span>
        </div>
        <div class="issue-title">${issue.title}</div>
        <div class="issue-description">${issue.description}</div>
        <div class="issue-suggestion">
            <strong>Suggestion:</strong> ${issue.suggestion}
        </div>
        ${issue.element ? `<div class="issue-element">${escapeHtml(issue.element)}</div>` : ''}
    `;
    
    return issueDiv;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some sample HTML for testing
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('html-content');
    
    // Add a sample button
    const sampleButton = document.createElement('button');
    sampleButton.type = 'button';
    sampleButton.className = 'sample-button';
    sampleButton.innerHTML = '<i class="fas fa-file-code"></i> Load Sample HTML';
    sampleButton.style.cssText = `
        background: #f7fafc;
        color: #4a5568;
        border: 2px solid #e2e8f0;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
    `;
    
    sampleButton.addEventListener('click', function() {
        const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Sample Page</title>
</head>
<body>
    <h1>Welcome to Our Site</h1>
    <img src="logo.png">
    <p>This is a sample page with some accessibility issues.</p>
    <a href="#">Click here</a>
    <form>
        <input type="text" name="email">
        <button type="submit">Submit</button>
    </form>
    <table>
        <tr>
            <td>Data 1</td>
            <td>Data 2</td>
        </tr>
    </table>
</body>
</html>`;
        
        textarea.value = sampleHTML;
        textarea.focus();
    });
    
    sampleButton.addEventListener('mouseenter', function() {
        this.style.background = '#edf2f7';
        this.style.borderColor = '#cbd5e0';
    });
    
    sampleButton.addEventListener('mouseleave', function() {
        this.style.background = '#f7fafc';
        this.style.borderColor = '#e2e8f0';
    });
    
    // Insert the button before the form
    const form = document.getElementById('wcag-form');
    form.insertBefore(sampleButton, form.firstChild);
});