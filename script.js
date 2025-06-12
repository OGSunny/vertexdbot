// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const modal = document.getElementById('discordModal');
const closeModal = document.querySelector('.close');
const discordBtns = document.querySelectorAll('[id^="discordBtn"]');

// Your Discord invite link - Replace with your actual Discord invite
const DISCORD_INVITE = "https://discord.gg/YOUR_INVITE_CODE";

// Sample raw links for different scripts
const scriptLinks = {
    hub: "https://raw.githubusercontent.com/example/script-hub/main/hub.lua",
    executor: "https://raw.githubusercontent.com/example/auto-executor/main/executor.lua",
    antiban: "https://raw.githubusercontent.com/example/anti-ban/main/antiban.lua",
    utility: "https://raw.githubusercontent.com/example/utility-pack/main/utility.lua"
};

// Mobile Navigation Toggle
function toggleMobileMenu() {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger
        hamburger.classList.toggle('active');
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                navMenu.classList.remove('active');
            }
        });
    });
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Discord Modal Functions
function initDiscordModal() {
    // Set Discord invite link in modal
    const discordLinkInput = document.getElementById('discordLink');
    if (discordLinkInput) {
        discordLinkInput.value = DISCORD_INVITE;
    }
    
    // Add click event to all Discord buttons
    discordBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openDiscordModal();
        });
    });
    
    // Close modal events
    closeModal.addEventListener('click', closeDiscordModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDiscordModal();
        }
    });
}

function openDiscordModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDiscordModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function copyDiscordLink() {
    const discordLinkInput = document.getElementById('discordLink');
    discordLinkInput.select();
    discordLinkInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Discord link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy link', 'error');
    }
}

function openDiscord() {
    window.open(DISCORD_INVITE, '_blank');
    closeDiscordModal();
}

// Script Functions
function openScript(scriptType) {
    if (scriptLinks[scriptType]) {
        // Create a modal or new window with the script link
        const scriptUrl = scriptLinks[scriptType];
        showScriptModal(scriptType, scriptUrl);
    } else {
        showNotification('Script not available', 'error');
    }
}

function showScriptModal(scriptType, scriptUrl) {
    const modalHTML = `
        <div id="scriptModal" class="modal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="closeScriptModal()">&times;</span>
                <h2>${scriptType.charAt(0).toUpperCase() + scriptType.slice(1)} Script</h2>
                <p>Here's your raw script link:</p>
                <input type="text" value="${scriptUrl}" readonly class="modal-input" id="scriptLink">
                <div class="modal-buttons">
                    <button onclick="copyScriptLink()" class="btn btn-primary">Copy Link</button>
                    <button onclick="loadScript('${scriptUrl}')" class="btn btn-secondary">Load Script</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeScriptModal() {
    const scriptModal = document.getElementById('scriptModal');
    if (scriptModal) {
        scriptModal.remove();
    }
}

function copyScriptLink() {
    const scriptLinkInput = document.getElementById('scriptLink');
    scriptLinkInput.select();
    scriptLinkInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Script link copied to clipboard!', 'success');
        closeScriptModal();
    } catch (err) {
        showNotification('Failed to copy link', 'error');
    }
}

function loadScript(url) {
    // This would typically load the script in a game executor
    showNotification('Script loaded! Check your executor.', 'success');
    closeScriptModal();
}

// Raw Link Generator
function generateRawLink() {
    const linkInput = document.getElementById('linkInput');
    const resultDiv = document.getElementById('result');
    const resultLink = document.getElementById('resultLink');
    
    const inputUrl = linkInput.value.trim();
    
    if (!inputUrl) {
        showNotification('Please enter a URL', 'error');
        return;
    }
    
    try {
        const rawLink = convertToRawLink(inputUrl);
        resultLink.value = rawLink;
        resultDiv.style.display = 'block';
        showNotification('Raw link generated successfully!', 'success');
    } catch (error) {
        showNotification('Invalid URL or unsupported platform', 'error');
    }
}

function convertToRawLink(url) {
    // GitHub conversion
    if (url.includes('github.com')) {
        if (url.includes('/blob/')) {
            return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        } else {
            throw new Error('Invalid GitHub URL format');
        }
    }
    
    // Pastebin conversion
    if (url.includes('pastebin.com')) {
        const pasteId = url.split('/').pop();
        return `https://pastebin.com/raw/${pasteId}`;
    }
    
    // GitLab conversion
    if (url.includes('gitlab.com')) {
        if (url.includes('/-/blob/')) {
            return url.replace('/-/blob/', '/-/raw/');
        } else {
            throw new Error('Invalid GitLab URL format');
        }
    }
    
    // Bitbucket conversion
    if (url.includes('bitbucket.org')) {
        if (url.includes('/src/')) {
            return url.replace('/src/', '/raw/');
        } else {
            throw new Error('Invalid Bitbucket URL format');
        }
    }
    
    // If already a raw link, return as is
    if (url.includes('raw.githubusercontent.com') || 
        url.includes('pastebin.com/raw') || 
        url.includes('/-/raw/')) {
        return url;
    }
    
    throw new Error('Unsupported URL format');
}

function copyToClipboard() {
    const resultLink = document.getElementById('resultLink');
    resultLink.select();
    resultLink.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Raw link copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy link', 'error');
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification animations to head
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
}

// Scroll effects
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe script cards and tool items
    const animatedElements = document.querySelectorAll('.script-card, .tool-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Particle background effect
function createParticles() {
    const particleCount = 50;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;
        
        document.body.appendChild(particle);
        particles.push({
            element: particle,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }
    
    function animateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > window.innerWidth) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > window.innerHeight) {
                particle.vy *= -1;
            }
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    toggleMobileMenu();
    initSmoothScrolling();
    initDiscordModal();
    addNotificationStyles();
    initScrollEffects();
    createParticles();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to UNordinary Hub! 🚀', 'success');
    }, 1000);
});

// Handle window resize
window.addEventListener('resize', function() {
    // Close mobile menu on resize
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
    }
});

// Add some interactive features
document.addEventListener('mousemove', function(e) {
    const floatingElements = document.querySelectorAll('.element');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    floatingElements.forEach((element, index) => {
        const speed = (index + 1) * 0.02;
        const x = (mouseX - 0.5) * 20 * speed;
        const y = (mouseY - 0.5) * 20 * speed;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});
