// Main JavaScript for XavierOS Portal

// Navigation function
function navigateToTool(tool) {
    if (tool === 'lucy') {
        window.location.href = '/lucy';
    } else if (tool === 'projectx') {
        window.location.href = '/projectx';
    }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation to tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach((card, index) => {
        // Stagger the animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Add hover effects for better UX
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click feedback
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-5px) scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }, 150);
        });
    });
});

// Utility function for API calls
async function makeAPICall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Export functions for use in other pages
window.navigateToTool = navigateToTool;
window.makeAPICall = makeAPICall;