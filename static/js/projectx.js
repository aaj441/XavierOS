// Project X eBook Generator JavaScript

let chapterCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ebook-form');
    const addChapterBtn = document.getElementById('add-chapter');
    const chaptersContainer = document.getElementById('chapters-container');
    
    // Add first chapter by default
    addChapter();
    
    // Event listeners
    addChapterBtn.addEventListener('click', addChapter);
    form.addEventListener('submit', handleFormSubmit);
    
    // Add event delegation for remove chapter buttons
    chaptersContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-chapter') || e.target.parentElement.classList.contains('remove-chapter')) {
            const chapterItem = e.target.closest('.chapter-item');
            chapterItem.remove();
            updateChapterNumbers();
        }
    });
});

function addChapter() {
    chapterCount++;
    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'chapter-item';
    chapterDiv.innerHTML = `
        <div class="chapter-header">
            <div class="chapter-number">${chapterCount}</div>
            <button type="button" class="remove-chapter" title="Remove Chapter">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="chapter-fields">
            <div class="form-group">
                <label class="chapter-title">Chapter Title *</label>
                <input type="text" name="chapter_title_${chapterCount}" required placeholder="Enter chapter title">
            </div>
            <div class="form-group">
                <label class="chapter-title">Chapter Content *</label>
                <textarea name="chapter_content_${chapterCount}" class="chapter-content" required placeholder="Enter chapter content (HTML supported)"></textarea>
            </div>
        </div>
    `;
    
    chaptersContainer.appendChild(chapterDiv);
    
    // Don't show remove button for first chapter
    if (chapterCount === 1) {
        const removeBtn = chapterDiv.querySelector('.remove-chapter');
        removeBtn.style.display = 'none';
    }
}

function updateChapterNumbers() {
    const chapters = document.querySelectorAll('.chapter-item');
    chapters.forEach((chapter, index) => {
        const chapterNumber = chapter.querySelector('.chapter-number');
        chapterNumber.textContent = index + 1;
        
        // Show/hide remove button based on chapter count
        const removeBtn = chapter.querySelector('.remove-chapter');
        if (chapters.length === 1) {
            removeBtn.style.display = 'none';
        } else {
            removeBtn.style.display = 'flex';
        }
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Validate required fields
    if (!formData.get('title') || !formData.get('author')) {
        alert('Please fill in the required fields (Title and Author).');
        return;
    }
    
    // Collect chapters
    const chapters = collectChapters(formData);
    if (chapters.length === 0) {
        alert('Please add at least one chapter.');
        return;
    }
    
    // Prepare request data
    const requestData = {
        metadata: {
            title: formData.get('title'),
            author: formData.get('author'),
            language: formData.get('language') || 'en',
            publisher: formData.get('publisher') || null,
            description: formData.get('description') || null,
            isbn: formData.get('isbn') || null
        },
        chapters: chapters,
        format: formData.get('format') || 'epub',
        enable_toc: formData.has('enable_toc'),
        enable_ncx: formData.has('enable_ncx')
    };
    
    // Show loading state
    showLoading();
    
    try {
        const response = await makeAPICall('/project-x/generate', 'POST', requestData);
        
        if (response.success) {
            displayResults(response);
        } else {
            showError(response.message || 'Failed to generate eBook.');
        }
        
    } catch (err) {
        console.error('Error generating eBook:', err);
        showError('Failed to generate eBook. Please try again.');
    }
}

function collectChapters(formData) {
    const chapters = [];
    const chapterTitles = [];
    const chapterContents = [];
    
    // Collect all chapter data
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('chapter_title_')) {
            chapterTitles.push(value);
        } else if (key.startsWith('chapter_content_')) {
            chapterContents.push(value);
        }
    }
    
    // Create chapter objects
    for (let i = 0; i < chapterTitles.length; i++) {
        if (chapterTitles[i] && chapterContents[i]) {
            chapters.push({
                title: chapterTitles[i],
                content: chapterContents[i],
                order: i + 1
            });
        }
    }
    
    return chapters;
}

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

function displayResults(response) {
    // Hide loading and error states
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    
    // Update result display
    document.getElementById('success-title').textContent = `${response.format.toUpperCase()} eBook Ready for Download`;
    document.getElementById('success-message').textContent = response.message;
    document.getElementById('filename').textContent = response.filename;
    document.getElementById('file-format').textContent = response.format.toUpperCase();
    document.getElementById('file-size').textContent = formatFileSize(response.size_bytes);
    
    // Set up download functionality
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.onclick = () => downloadFile(response.file_data, response.filename);
    
    // Set up generate new functionality
    const generateNewBtn = document.getElementById('generate-new-btn');
    generateNewBtn.onclick = () => {
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('ebook-form').reset();
        // Reset chapters
        document.getElementById('chapters-container').innerHTML = '';
        chapterCount = 0;
        addChapter();
    };
    
    // Show results section
    document.getElementById('results-section').style.display = 'block';
    
    // Scroll to results
    document.getElementById('results-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function downloadFile(base64Data, filename) {
    try {
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/epub+zip' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file. Please try again.');
    }
}

function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Add some sample content for testing
document.addEventListener('DOMContentLoaded', function() {
    // Add sample content button
    const sampleButton = document.createElement('button');
    sampleButton.type = 'button';
    sampleButton.className = 'sample-button';
    sampleButton.innerHTML = '<i class="fas fa-book-open"></i> Load Sample Content';
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
        // Fill in sample metadata
        document.getElementById('title').value = 'The Digital Revolution';
        document.getElementById('author').value = 'Jane Smith';
        document.getElementById('description').value = 'A comprehensive guide to understanding the digital transformation of our society.';
        
        // Clear existing chapters and add sample ones
        document.getElementById('chapters-container').innerHTML = '';
        chapterCount = 0;
        
        // Add sample chapters
        addSampleChapter('Introduction', `
            <h2>Welcome to the Digital Age</h2>
            <p>The digital revolution has transformed every aspect of our lives, from how we communicate to how we work and learn. This book explores the profound changes that technology has brought to our society.</p>
            <p>In the following chapters, we will examine the key trends, challenges, and opportunities that define our digital world.</p>
        `);
        
        addSampleChapter('Chapter 1: The Rise of Digital Technology', `
            <h2>The Foundation of Change</h2>
            <p>Digital technology has evolved from simple computing machines to complex systems that permeate every aspect of modern life. The journey began with the invention of the transistor and has led us to the era of artificial intelligence and quantum computing.</p>
            <h3>Key Milestones</h3>
            <ul>
                <li>The invention of the transistor (1947)</li>
                <li>The development of the internet (1960s-1990s)</li>
                <li>The rise of mobile computing (2000s)</li>
                <li>The era of artificial intelligence (2010s-present)</li>
            </ul>
        `);
        
        addSampleChapter('Chapter 2: Impact on Society', `
            <h2>Transforming Human Interaction</h2>
            <p>The digital revolution has fundamentally changed how we interact with each other and with information. Social media, instant messaging, and video conferencing have created new forms of communication that transcend geographical boundaries.</p>
            <blockquote>
                "The internet is becoming the town square for the global village of tomorrow." - Bill Gates
            </blockquote>
            <p>However, these changes have also brought new challenges, including issues of privacy, misinformation, and digital divide.</p>
        `);
        
        addSampleChapter('Conclusion', `
            <h2>Looking Forward</h2>
            <p>As we stand at the threshold of an even more connected future, it is crucial that we understand both the opportunities and challenges that digital technology presents. The choices we make today will shape the world of tomorrow.</p>
            <p>Thank you for joining us on this journey through the digital revolution. May this book serve as a guide as we navigate the exciting and complex world of digital technology.</p>
        `);
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
    const form = document.getElementById('ebook-form');
    form.insertBefore(sampleButton, form.firstChild);
});

function addSampleChapter(title, content) {
    chapterCount++;
    const chapterDiv = document.createElement('div');
    chapterDiv.className = 'chapter-item';
    chapterDiv.innerHTML = `
        <div class="chapter-header">
            <div class="chapter-number">${chapterCount}</div>
            <button type="button" class="remove-chapter" title="Remove Chapter">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="chapter-fields">
            <div class="form-group">
                <label class="chapter-title">Chapter Title *</label>
                <input type="text" name="chapter_title_${chapterCount}" value="${title}" required>
            </div>
            <div class="form-group">
                <label class="chapter-title">Chapter Content *</label>
                <textarea name="chapter_content_${chapterCount}" class="chapter-content" required>${content}</textarea>
            </div>
        </div>
    `;
    
    document.getElementById('chapters-container').appendChild(chapterDiv);
}