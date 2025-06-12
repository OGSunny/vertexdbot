// UNordinary Hub - Enhanced JavaScript
class UNordinaryHub {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupScrollEffects();
    this.setupAnimations();
    this.setupNavigation();
    this.setupLoadingStates();
  }

  setupEventListeners() {
    // Copy code functionality
    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => this.copyCode());
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
    });

    // Add keyboard support for copy button
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement?.id === 'loadstring-code') {
        e.preventDefault();
        this.copyCode();
      }
    });
  }

  setupScrollEffects() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      if (navbar) {
        if (currentScrollY > 100) {
          navbar.style.background = 'rgba(17, 24, 39, 0.95)';
          navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
          navbar.style.background = 'rgba(17, 24, 39, 0.9)';
          navbar.style.boxShadow = 'none';
        }

        // Hide/show navbar on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      }

      lastScrollY = currentScrollY;
    });

    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.game-card, .discord-card, .code-container').forEach(el => {
      observer.observe(el);
    });
  }

  setupAnimations() {
    // Add stagger animation to game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effects to interactive elements
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });

    // Hero logo rotation effect
    const heroLogo = document.querySelector('.hero-logo-img');
    if (heroLogo) {
      setInterval(() => {
        heroLogo.style.transform = 'scale(1.05) rotate(360deg)';
        setTimeout(() => {
          heroLogo.style.transform = 'scale(1) rotate(0deg)';
        }, 1000);
      }, 10000);
    }
  }

  setupNavigation() {
    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-64px 0px -50% 0px'
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeId = entry.target.id;
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      navObserver.observe(section);
    });
  }

  setupLoadingStates() {
    // Add loading state to buttons
    document.querySelectorAll('button, .discord-button').forEach(button => {
      button.addEventListener('click', () => {
        if (!button.classList.contains('loading')) {
          this.addLoadingState(button);
        }
      });
    });
  }

  async copyCode() {
    const codeElement = document.getElementById('loadstring-code');
    const copyBtn = document.querySelector('.copy-btn');
    const copyText = copyBtn.querySelector('.copy-text');
    const successMessage = document.getElementById('copy-message');

    if (!codeElement || !copyBtn) return;

    const code = codeElement.textContent;
    
    try {
      // Add loading state
      copyBtn.disabled = true;
      copyText.textContent = 'Copying...';
      copyBtn.classList.add('loading');

      // Copy to clipboard
      await navigator.clipboard.writeText(code);
      
      // Success feedback
      this.showSuccessMessage(successMessage);
      copyText.textContent = 'Copied!';
      copyBtn.style.background = 'var(--accent-green)';

      // Reset button state
      setTimeout(() => {
        copyText.textContent = 'Copy';
        copyBtn.style.background = 'var(--accent-blue)';
        copyBtn.disabled = false;
        copyBtn.classList.remove('loading');
      }, 2000);

      // Analytics (if you want to track copies)
      this.trackEvent('code_copied', {
        code_type: 'loader_script',
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('Failed to copy code:', err);
      
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(code);
      
      // Error feedback
      copyText.textContent = 'Copy Failed';
      copyBtn.style.background = '#ef4444';
      
      setTimeout(() => {
        copyText.textContent = 'Copy';
        copyBtn.style.background = 'var(--accent-blue)';
        copyBtn.disabled = false;
        copyBtn.classList.remove('loading');
      }, 2000);
    }
  }

  fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      const successMessage = document.getElementById('copy-message');
      this.showSuccessMessage(successMessage);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
  }

  showSuccessMessage(element) {
    if (!element) return;

    element.classList.add('show');
    element.style.animation = 'slideIn 0.3s ease-out forwards';

    setTimeout(() => {
      element.classList.remove('show');
      element.style.animation = '';
    }, 3000);
  }

  handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Add focus management for accessibility
      setTimeout(() => {
        targetElement.focus();
      }, 500);
    }
  }

  addLoadingState(button) {
    const originalContent = button.innerHTML;
    button.classList.add('loading');
    button.disabled = true;

    // Add spinner
    const spinner = '<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
    
    if (button.classList.contains('discord-button')) {
      button.innerHTML = `${spinner} <span>Loading...</span>`;
    } else {
      button.innerHTML = `${spinner} Loading...`;
    }

    // Remove loading state after delay (simulate loading)
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('loading');
      button.disabled = false;
    }, 1500);
  }

  trackEvent(eventName, data = {}) {
    // Analytics tracking (implement your preferred analytics service)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, data);
    }
    
    console.log(`Event tracked: ${eventName}`, data);
  }

  // Utility method to add typing effect
  typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    
    type();
  }

  // Method to add particle effects (optional enhancement)
  addParticleEffect(container) {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(59, 130, 246, 0.5);
        border-radius: 50%;
        pointer-events: none;
        animation: float ${Math.random() * 3 + 2}s infinite ease-in-out;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
      `;
      
      container.appendChild(particle);
    }
  }

  // Error handling and user feedback
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: var(--secondary-bg);
      color: var(--text-primary);
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px var(--shadow-medium);
      border-left: 4px solid var(--accent-blue);
      z-index: 1001;
      transform: translateX(400px);
      transition: transform 0.3s ease;
    `;

    if (type === 'success') {
      notification.style.borderLeftColor = 'var(--accent-green)';
    } else if (type === 'error') {
      notification.style.borderLeftColor = '#ef4444';
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UNordinaryHub();
});

// Add CSS for animations that JavaScript creates
const additionalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(120deg); }
    66% { transform: translateY(5px) rotate(240deg); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .nav-link.active {
    color: var(--accent-blue);
    background: rgba(59, 130, 246, 0.1);
  }

  .notification {
    font-weight: 500;
    font-size: 0.9rem;
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Export for potential external use
window.UNordinaryHub = UNordinaryHub;
