// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollAnimations();
    initPortfolioFilter();
    initCounterAnimation();
    initFormHandling();
    initIntersectionObserver();
});

// Navigation Functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    });

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('nav-open');
        }
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    // Parallax effect for hero shapes
    const shapes = document.querySelectorAll('.floating-shapes .shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        shapes.forEach((shape, index) => {
            const speed = 0.3 + (index * 0.1);
            shape.style.transform = `translateY(${rate * speed}px)`;
        });
    });

    // Active navigation link based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Portfolio Filter Functionality
function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.style.display = 'block';
                    // Add animation
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Add CSS animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Counter Animation
function initCounterAnimation() {
    const counterElements = document.querySelectorAll('[data-count]');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-count'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };

    // Intersection Observer for counter animation
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counterElements.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Form Handling
function initFormHandling() {
    const contactForm = document.querySelector('.contact-form');
    const submitButton = document.querySelector('.btn-submit');
    const buttonText = submitButton.querySelector('span');
    const buttonIcon = submitButton.querySelector('i');
    const buttonLoading = submitButton.querySelector('.btn-loading');

    // Form input animations
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    inputs.forEach(input => {
        // Handle focus and blur events for label animation
        input.addEventListener('focus', () => {
            input.parentNode.classList.add('focused');
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentNode.classList.remove('focused');
            }
        });

        // Check if input has value on page load
        if (input.value) {
            input.parentNode.classList.add('focused');
        }
    });

    // Form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            budget: formData.get('budget'),
            message: formData.get('message')
        };

        // Basic validation
        if (!data.name || !data.email || !data.message) {
            showErrorMessage('Please fill in all required fields.');
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        buttonText.style.opacity = '0';
        buttonIcon.style.opacity = '0';
        buttonLoading.style.opacity = '1';

        try {
            // Auto-detect API endpoint based on environment
            const API_BASE = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : 'https://abhishekdevportfolio-production.up.railway.app';
            
            // Send to backend API
            const response = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showSuccessMessage(result.message);
                contactForm.reset();
                // Clear focused states
                document.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('focused');
                });
            } else {
                showErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showErrorMessage('Unable to connect to server. Please try again or email me directly at abhishek.dev694@gmail.com');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            buttonText.style.opacity = '1';
            buttonIcon.style.opacity = '1';
            buttonLoading.style.opacity = '0';
        }
    });

    // Remove any existing form messages
    function clearExistingMessages() {
        const existingMessages = contactForm.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
    }

    // Success message
    function showSuccessMessage(customMessage) {
        clearExistingMessages();
        const message = document.createElement('div');
        message.className = 'form-message success';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${customMessage || 'Thank you! Your message has been sent successfully. I\'ll get back to you within 24 hours.'}</span>
        `;
        
        contactForm.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 7000);
    }

    // Error message
    function showErrorMessage(customMessage) {
        clearExistingMessages();
        const message = document.createElement('div');
        message.className = 'form-message error';
        message.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${customMessage || 'Oops! There was an error sending your message. Please try again or contact me directly at abhishek.dev694@gmail.com'}</span>
        `;
        
        contactForm.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 7000);
    }

    // Add CSS for form messages
    const messageStyles = document.createElement('style');
    messageStyles.textContent = `
        .form-message {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            font-weight: 500;
            animation: slideInUp 0.3s ease;
        }
        
        .form-message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }
        
        .form-message.error {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }
        
        .form-message i {
            font-size: 1.25rem;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(messageStyles);
}

// Intersection Observer for animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll(`
        .section-header,
        .experience-card,
        .service-card,
        .portfolio-item,
        .contact-item,
        .stats-container,
        .tech-orbit
    `);

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Utility Functions
function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Add global scroll to section function to window
window.scrollToSection = scrollToSection;

// Smooth scroll for all anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]') || e.target.closest('a[href^="#"]')) {
        const link = e.target.matches('a[href^="#"]') ? e.target : e.target.closest('a[href^="#"]');
        const href = link.getAttribute('href');
        
        if (href && href !== '#') {
            e.preventDefault();
            scrollToSection(href);
        }
    }
});

// Typing animation for hero title
function initTypingAnimation() {
    const titleElements = document.querySelectorAll('.title-name');
    
    titleElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeChar, 100);
            }
        };
        
        setTimeout(typeChar, 1000);
    });
}

// Initialize typing animation after a delay
setTimeout(initTypingAnimation, 2000);

// Add some easter eggs for fun
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateEasterEgg();
        konamiCode = [];
    }
});

function activateEasterEgg() {
    // Add rainbow effect to the logo
    const logo = document.querySelector('.logo-text');
    logo.style.animation = 'rainbow 2s ease-in-out infinite';
    
    // Add CSS for rainbow animation
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { color: #ff0000; }
            16.666% { color: #ff8000; }
            33.333% { color: #ffff00; }
            50% { color: #00ff00; }
            66.666% { color: #0080ff; }
            83.333% { color: #8000ff; }
            100% { color: #ff0000; }
        }
    `;
    document.head.appendChild(rainbowStyle);
    
    // Show easter egg message
    const message = document.createElement('div');
    message.innerHTML = '🎉 Easter egg activated! You found the secret code! 🚀';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 1rem;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        animation: bounceIn 0.5s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
        logo.style.animation = '';
    }, 3000);
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll-heavy functions
const debouncedScrollHandler = debounce(() => {
    // Any expensive scroll operations can go here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Preload critical resources
function preloadCriticalResources() {
    // Preload fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    fontLink.as = 'style';
    document.head.appendChild(fontLink);
}

// Initialize preloading
preloadCriticalResources();

// Add loading indicator for slow connections
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add subtle animations on mouse move for hero section
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) {
        const shapes = document.querySelectorAll('.floating-shapes .shape');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 10;
            const y = (mouseY - 0.5) * speed * 10;
            
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
});

console.log('🚀 Abhishek\'s Portfolio loaded successfully!');
console.log('💡 Try the Konami code for a surprise!');
console.log('⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');
