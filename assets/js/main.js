// ===================================================================
// MODERN TECH BLOG JAVASCRIPT - ENHANCED FUNCTIONALITY
// ===================================================================

class TechBlog {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeTheme();
    this.initializeComponents();
    this.handlePageLoad();
  }

  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      this.onDOMContentLoaded();
    });

    window.addEventListener('load', () => {
      this.onWindowLoad();
    });

    window.addEventListener('resize', this.debounce(() => {
      this.onWindowResize();
    }, 250));

    window.addEventListener('scroll', this.throttle(() => {
      this.onWindowScroll();
    }, 16)); // ~60fps
  }

  onDOMContentLoaded() {
    console.log('🚀 Tech Blog initialized');
    document.body.classList.add('js-loaded');
  }

  onWindowLoad() {
    document.body.classList.add('loaded');
    this.initScrollAnimations();
  }

  onWindowResize() {
    this.handleMobileMenu();
    this.updateViewportHeight();
  }

  onWindowScroll() {
    this.updateScrollProgress();
    this.handleScrollAnimations();
  }

  initializeComponents() {
    this.mobileNav = new MobileNavigation();
    this.themeManager = new ThemeManager();
    this.searchManager = new SearchManager();
    this.scrollManager = new ScrollManager();
  }

  handlePageLoad() {
    // Remove loading states
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 100);
  }

  initializeTheme() {
    // Initialize theme before other components to prevent flash
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  handleMobileMenu() {
    if (window.innerWidth > 768) {
      this.mobileNav?.close();
    }
  }

  updateViewportHeight() {
    // Fix for mobile viewport height issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  updateScrollProgress() {
    const scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.documentElement.style.setProperty('--scroll-progress', `${scrollProgress}%`);
  }

  initScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('.scroll-fade-in').forEach(el => {
        observer.observe(el);
      });
    }
  }

  handleScrollAnimations() {
    // Additional scroll-based animations can be added here
  }

  // Utility methods
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// ===================================================================
// MOBILE NAVIGATION COMPONENT
// ===================================================================

class MobileNavigation {
  constructor() {
    this.menuToggle = document.getElementById('mobile-menu-toggle');
    this.navbar = document.getElementById('navbar-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.isOpen = false;
    
    this.init();
  }

  init() {
    if (!this.menuToggle || !this.navbar) return;
    
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Menu toggle
    this.menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    // Close menu when clicking nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.close();
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !e.target.closest('.navbar')) {
        this.close();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.close();
      }
    });
  }

  setupAccessibility() {
    this.menuToggle.setAttribute('role', 'button');
    this.navbar.setAttribute('role', 'navigation');
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menuToggle.classList.add('active');
    this.navbar.classList.add('active');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    this.trapFocus();
  }

  close() {
    this.isOpen = false;
    this.menuToggle.classList.remove('active');
    this.navbar.classList.remove('active');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  trapFocus() {
    const focusableElements = this.navbar.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.navbar.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    });
    
    firstElement.focus();
  }
}

// ===================================================================
// THEME MANAGEMENT COMPONENT
// ===================================================================

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    
    this.init();
  }

  init() {
    if (!this.themeToggle) return;
    
    this.applyTheme(this.currentTheme);
    this.bindEvents();
    this.watchSystemTheme();
  }

  bindEvents() {
    this.themeToggle.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Keyboard support
    this.themeToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    this.storeTheme(this.currentTheme);
    this.announceThemeChange();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.themeToggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#2563eb');
    }
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      console.warn('Could not access localStorage for theme preference');
      return null;
    }
  }

  storeTheme(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Could not save theme preference to localStorage');
    }
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
      }
    });
  }

  announceThemeChange() {
    // Create a live region for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Switched to ${this.currentTheme} mode`;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// ===================================================================
// SEARCH MANAGEMENT COMPONENT
// ===================================================================

class SearchManager {
  constructor() {
    this.searchToggle = document.getElementById('search-toggle');
    this.searchOverlay = document.getElementById('search-overlay');
    this.searchClose = document.getElementById('search-close');
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');
    this.suggestionTags = document.querySelectorAll('.suggestion-tag');
    
    this.isOpen = false;
    this.debounceTimer = null;
    this.searchCache = new Map();
    
    this.init();
  }

  init() {
    if (!this.searchToggle || !this.searchOverlay) return;
    
    this.bindEvents();
    this.setupAccessibility();
  }

  bindEvents() {
    // Open search
    this.searchToggle.addEventListener('click', () => {
      this.open();
    });

    // Close search
    this.searchClose?.addEventListener('click', () => {
      this.close();
    });

    // Close on overlay click
    this.searchOverlay.addEventListener('click', (e) => {
      if (e.target === this.searchOverlay) {
        this.close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Search input
    this.searchInput?.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Search input keyboard navigation
    this.searchInput?.addEventListener('keydown', (e) => {
      this.handleKeyNavigation(e);
    });

    // Suggestion tags
    this.suggestionTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const query = tag.textContent;
        this.searchInput.value = query;
        this.performSearch(query);
      });
    });
  }

  setupAccessibility() {
    this.searchOverlay.setAttribute('role', 'dialog');
    this.searchOverlay.setAttribute('aria-modal', 'true');
    this.searchOverlay.setAttribute('aria-labelledby', 'search-title');
  }

  open() {
    this.isOpen = true;
    this.searchOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus the search input with a slight delay for animation
    setTimeout(() => {
      this.searchInput?.focus();
    }, 150);
  }

  close() {
    this.isOpen = false;
    this.searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
    this.clearResults();
    this.searchInput.value = '';
  }

  handleSearch(query) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  async performSearch(query) {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      this.clearResults();
      return;
    }

    if (trimmedQuery.length < 2) {
      this.showMessage('Type at least 2 characters to search');
      return;
    }

    // Check cache first
    if (this.searchCache.has(trimmedQuery)) {
      this.displayResults(this.searchCache.get(trimmedQuery));
      return;
    }

    this.showLoading();

    try {
      const results = await this.fetchSearchResults(trimmedQuery);
      this.searchCache.set(trimmedQuery, results);
      this.displayResults(results);
    } catch (error) {
      console.error('Search error:', error);
      this.showMessage('Search failed. Please try again.');
    }
  }

  async fetchSearchResults(query) {
    // Mock search implementation
    // In a real application, this would make an API call to your search endpoint
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResults = [
          {
            title: 'Getting Started with React Hooks',
            excerpt: 'Learn the fundamentals of React Hooks and how they can improve your React applications with better state management and lifecycle handling.',
            url: '/tutorials/react-hooks-guide',
            category: 'Web Development',
            date: '2024-09-25',
            readTime: '8 min read'
          },
          {
            title: 'Machine Learning Basics for Beginners',
            excerpt: 'An introduction to machine learning concepts, algorithms, and practical applications in modern software development.',
            url: '/tutorials/ml-basics',
            category: 'AI & ML',
            date: '2024-09-20',
            readTime: '12 min read'
          },
          {
            title: 'Advanced CSS Grid Techniques',
            excerpt: 'Master CSS Grid with advanced techniques for creating complex, responsive layouts without using frameworks.',
            url: '/tutorials/css-grid-advanced',
            category: 'Web Development',
            date: '2024-09-15',
            readTime: '10 min read'
          }
        ].filter(result => 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
        );
        
        resolve(mockResults);
      }, 500);
    });
  }

  displayResults(results) {
    if (results.length === 0) {
      this.showMessage('No results found. Try different keywords.');
      return;
    }

    const resultsHTML = results.map(result => `
      <article class="search-result">
        <div class="search-result-content">
          <div class="search-result-meta">
            <span class="search-result-category">${result.category}</span>
            <span class="search-result-date">${result.date}</span>
            <span class="search-result-read-time">${result.readTime}</span>
          </div>
          <h3 class="search-result-title">
            <a href="${result.url}">${this.highlightQuery(result.title)}</a>
          </h3>
          <p class="search-result-excerpt">${this.highlightQuery(result.excerpt)}</p>
        </div>
      </article>
    `).join('');

    this.searchResults.innerHTML = `
      <div class="search-results-header">
        <p class="search-results-count">${results.length} result${results.length !== 1 ? 's' : ''} found</p>
      </div>
      <div class="search-results-list">
        ${resultsHTML}
      </div>
    `;
  }

  highlightQuery(text) {
    const query = this.searchInput.value.trim();
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  showLoading() {
    this.searchResults.innerHTML = `
      <div class="search-loading">
        <div class="search-loading-spinner"></div>
        <p>Searching...</p>
      </div>
    `;
  }

  showMessage(message) {
    this.searchResults.innerHTML = `
      <div class="search-message">
        <p>${message}</p>
      </div>
    `;
  }

  clearResults() {
    this.searchResults.innerHTML = '';
  }

  handleKeyNavigation(e) {
    const results = this.searchResults.querySelectorAll('.search-result a');
    if (results.length === 0) return;

    let currentIndex = -1;
    results.forEach((result, index) => {
      if (result === document.activeElement) {
        currentIndex = index;
      }
    });

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
        results[nextIndex].focus();
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
        results[prevIndex].focus();
        break;
      
      case 'Enter':
        if (document.activeElement.matches('.search-result a')) {
          document.activeElement.click();
        }
        break;
    }
  }
}

// ===================================================================
// SCROLL MANAGEMENT COMPONENT
// ===================================================================

class ScrollManager {
  constructor() {
    this.header = document.getElementById('site-header');
    this.lastScrollTop = 0;
    this.scrollThreshold = 10;
    this.isHeaderVisible = true;
    
    this.init();
  }

  init() {
    if (!this.header) return;
    
    this.bindEvents();
    this.addScrollProgress();
  }

  bindEvents() {
    window.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
    }, 16));
  }

  handleScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Handle header hide/show
    if (Math.abs(currentScrollTop - this.lastScrollTop) > this.scrollThreshold) {
      if (currentScrollTop > this.lastScrollTop && currentScrollTop > 100) {
        // Scrolling down
        this.hideHeader();
      } else {
        // Scrolling up
        this.showHeader();
      }
      this.lastScrollTop = currentScrollTop;
    }
    
    // Update scroll progress
    this.updateScrollProgress();
  }

  hideHeader() {
    if (this.isHeaderVisible) {
      this.header.style.transform = 'translateY(-100%)';
      this.isHeaderVisible = false;
    }
  }

  showHeader() {
    if (!this.isHeaderVisible) {
      this.header.style.transform = 'translateY(0)';
      this.isHeaderVisible = true;
    }
  }

  updateScrollProgress() {
    const scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.documentElement.style.setProperty('--scroll-progress', `${Math.min(scrollProgress, 100)}%`);
  }

  addScrollProgress() {
    // Add a scroll progress indicator to the header
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    this.header.appendChild(progressBar);
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

const utils = {
  // Format date
  formatDate(dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
    return new Date(dateString).toLocaleDateString('en-US', options);
  },

  // Calculate reading time
  calculateReadingTime(text, wordsPerMinute = 200) {
    const words = text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / wordsPerMinute);
    return `${readingTime} min read`;
  },

  // Sanitize HTML
  sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  },

  // Smooth scroll to element
  scrollToElement(element, offset = 0) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= -threshold &&
      rect.left >= -threshold &&
      rect.bottom <= height + threshold &&
      rect.right <= width + threshold
    );
  },

  // Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  },

  // Generate random ID
  generateId(prefix = 'id') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Preload critical resources
  preloadResource(url, as = 'script') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = url;
    document.head.appendChild(link);
  }
};

// ===================================================================
// INITIALIZE APPLICATION
// ===================================================================

// Initialize the application
const techBlog = new TechBlog();

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TechBlog,
    MobileNavigation,
    ThemeManager,
    SearchManager,
    ScrollManager,
    utils
  };
}