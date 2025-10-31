/**
 * Custom Header Links Enhancement
 * Allows users to add, configure, and reorder custom links in the header
 */

class CustomHeaderLinksEnhancement {
  constructor() {
    this.name = 'Custom Header Links';
    this.elements = [];
    this.customLinks = [];
    this.linksContainer = null;
    this.iconSize = 20; // Default icon size in pixels
    this.isRendering = false; // Flag to prevent duplicate rendering
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);

    try {
      // Load icon size from storage
      await this.loadIconSize();
      
      // Load custom links from storage
      await this.loadCustomLinks();
      
      // Wait for header to be available
      const header = await this.waitForElement('header.c-page-header', 5000);
      
      // Render all custom links directly to header
      this.renderCustomLinks();
      
      // Apply icon size to all icons (including default CSOD icons)
      this.applyIconSizeToAll();
      
      console.log(`${this.name}: Custom links initialized with ${this.customLinks.length} links`);
    } catch (error) {
      console.warn(`${this.name}: Could not find header element`, error);
    }
    
    // Listen for icon size changes
    this.setupMessageListeners();
    
    // Listen for storage changes
    this.setupStorageListeners();
    
    // Watch for search active state changes
    this.setupSearchActiveWatcher();
  }
  
  /**
   * Load icon size from storage
   */
  async loadIconSize() {
    try {
      const result = await chrome.storage.sync.get(['customLinkIconSize']);
      this.iconSize = result.customLinkIconSize || 20;
      console.log(`${this.name}: Icon size loaded: ${this.iconSize}px`);
    } catch (error) {
      console.error(`${this.name}: Error loading icon size:`, error);
      this.iconSize = 20;
    }
  }
  
  /**
   * Apply icon size to an icon element
   */
  applyIconSize(iconElement) {
    if (iconElement && this.iconSize) {
      iconElement.style.fontSize = `${this.iconSize}px`;
      iconElement.style.setProperty('font-size', `${this.iconSize}px`, 'important');
      console.log(`${this.name}: Applied icon size ${this.iconSize}px to icon element`);
    }
  }
  
  /**
   * Apply icon size to all existing icons (including logout link and default CSOD icons)
   */
  applyIconSizeToAll() {
    console.log(`${this.name}: Applying icon size ${this.iconSize}px to ${this.elements.length} elements`);
    
    // Apply to custom links
    this.elements.forEach((element, index) => {
      const icon = element.querySelector('i');
      if (icon) {
        this.applyIconSize(icon);
      } else {
        console.warn(`${this.name}: No icon found in element ${index}`);
      }
    });
    
    // Apply to logout link if it exists
    const logoutElement = document.querySelector('.csod-custom-logout');
    if (logoutElement) {
      const logoutIcon = logoutElement.querySelector('i');
      if (logoutIcon) {
        this.applyIconSize(logoutIcon);
        console.log(`${this.name}: Applied icon size to logout link icon`);
      }
    }
    
    // Apply to default CSOD nav-act icons (navigation menu icons)
    const navActElements = document.querySelectorAll('.c-hdr-item.nav-act i');
    navActElements.forEach((icon, index) => {
      if (icon) {
        this.applyIconSize(icon);
        console.log(`${this.name}: Applied icon size to nav-act icon ${index}`);
      }
    });
    
    // Apply to default CSOD search icons (only if search is not active)
    const searchActive = document.querySelector('.c-global-search.active');
    const searchElements = document.querySelectorAll('.c-hdr-item.search i');
    searchElements.forEach((icon, index) => {
      if (icon) {
        if (searchActive) {
          // If search is active, set to 20px
          icon.style.fontSize = '20px';
          icon.style.setProperty('font-size', '20px', 'important');
          console.log(`${this.name}: Applied 20px to active search icon ${index}`);
        } else {
          // If search is not active, apply custom icon size
          this.applyIconSize(icon);
          console.log(`${this.name}: Applied icon size to search icon ${index}`);
        }
      }
    });
  }
  
  /**
   * Apply specific size to search icons
   * @param {number} size - Size in pixels (or null to use custom icon size)
   */
  applySearchIconSize(size = null) {
    const searchElements = document.querySelectorAll('.c-hdr-item.search i');
    const finalSize = size !== null ? size : this.iconSize;
    
    searchElements.forEach((icon, index) => {
      if (icon) {
        icon.style.fontSize = `${finalSize}px`;
        icon.style.setProperty('font-size', `${finalSize}px`, 'important');
        console.log(`${this.name}: Applied ${finalSize}px to search icon ${index}`);
      }
    });
  }
  
  /**
   * Setup watcher for search active state changes
   */
  setupSearchActiveWatcher() {
    // Track if we're already observing the search element
    let isObservingSearch = false;
    
    // Check initial state
    this.updateSearchIconSizeForActiveState();
    
    // Function to observe .c-global-search element
    const observeSearchElement = () => {
      const globalSearch = document.querySelector('.c-global-search');
      if (globalSearch && !isObservingSearch) {
        observer.observe(globalSearch, {
          attributes: true,
          attributeFilter: ['class']
        });
        isObservingSearch = true;
      }
    };
    
    // Watch for changes to .c-global-search.active
    const observer = new MutationObserver(() => {
      this.updateSearchIconSizeForActiveState();
    });
    
    // Try to observe immediately
    observeSearchElement();
    
    // Also observe document body for dynamically added elements
    const bodyObserver = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.matches && node.matches('.c-global-search')) {
                shouldCheck = true;
              } else if (node.querySelector && node.querySelector('.c-global-search')) {
                shouldCheck = true;
              }
            }
          });
        } else if (mutation.type === 'attributes' && mutation.target.classList) {
          if (mutation.target.classList.contains('c-global-search')) {
            this.updateSearchIconSizeForActiveState();
          }
        }
      });
      
      if (shouldCheck) {
        observeSearchElement();
        this.updateSearchIconSizeForActiveState();
      }
    });
    
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Store observers for cleanup if needed
    this.searchActiveObserver = observer;
    this.searchActiveBodyObserver = bodyObserver;
    
    // Also listen for click events on search elements as a fallback
    const clickHandler = () => {
      setTimeout(() => {
        this.updateSearchIconSizeForActiveState();
      }, 100);
    };
    
    document.addEventListener('click', clickHandler, true);
    this.searchClickHandler = clickHandler;
  }
  
  /**
   * Update search icon size based on active state
   */
  updateSearchIconSizeForActiveState() {
    const searchActive = document.querySelector('.c-global-search.active');
    if (searchActive) {
      // Search is active - set to 20px
      this.applySearchIconSize(20);
    } else {
      // Search is not active - use custom icon size
      this.applySearchIconSize();
    }
  }
  
  /**
   * Setup message listeners
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'APPLY_CUSTOM_LINK_ICON_SIZE') {
        this.iconSize = message.size || 20;
        this.applyIconSizeToAll();
        // Also update search icon size if not active
        this.updateSearchIconSizeForActiveState();
      }
      // Note: CUSTOM_LINKS_UPDATED is handled by content.js to avoid duplicate listeners
    });
  }
  
  /**
   * Setup storage change listeners
   */
  setupStorageListeners() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        // Handle icon size changes
        if (changes.customLinkIconSize) {
          const newSize = changes.customLinkIconSize.newValue || 20;
          console.log(`${this.name}: Storage changed - icon size: ${newSize}px`);
          this.iconSize = newSize;
          this.applyIconSizeToAll();
          // Also update search icon size if not active
          this.updateSearchIconSizeForActiveState();
        }
        
        // Note: customHeaderLinks changes are handled by content.js to avoid duplicate rendering
        // The content.js storage listener will call renderCustomLinks() via the active enhancement
      }
    });
  }

  /**
   * Cleanup the enhancement
   */
  cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.elements = [];
    console.log(`${this.name}: Cleaned up successfully`);
  }

  /**
   * Load custom links from Chrome storage
   */
  async loadCustomLinks() {
    try {
      const result = await chrome.storage.sync.get(['customHeaderLinks']);
      let customLinks = result.customHeaderLinks;
      
      // Ensure customLinks is always an array - but preserve existing data
      if (!Array.isArray(customLinks)) {
        console.warn(`${this.name}: customLinks is not an array, initializing as empty array but NOT saving:`, customLinks);
        customLinks = [];
        // DO NOT save empty array - it might wipe out data during toggle operations
      }
      
      this.customLinks = customLinks;
      console.log(`${this.name}: Loaded ${this.customLinks.length} custom links`);
    } catch (error) {
      console.error(`${this.name}: Error loading custom links:`, error);
      this.customLinks = [];
    }
  }

  /**
   * Save custom links to Chrome storage
   */
  async saveCustomLinks() {
    try {
      await chrome.storage.sync.set({ customHeaderLinks: this.customLinks });
      console.log(`${this.name}: Saved ${this.customLinks.length} custom links`);
    } catch (error) {
      console.error(`${this.name}: Error saving custom links:`, error);
    }
  }

  /**
   * Find the insertion point in the header
   * @param {Element} header - The header element
   * @returns {Element|null} - The element to insert before, or null if not found
   */
  findInsertionPoint(header) {
    // Find the first default .c-hdr-item element (insert before all default header items)
    const headerItems = header.querySelectorAll('.c-hdr-item:not(.custom-separator):not([class*="custom-link-"])');
    
    if (headerItems.length > 0) {
      const firstItem = headerItems[0];
      console.log(`${this.name}: Found insertion point - first default header item`);
      return firstItem;
    }
    
    // Fallback: Try to find csod-custom-logout element (if Header Logout Link is active)
    const logoutElement = header.querySelector('.csod-custom-logout');
    if (logoutElement) {
      console.log(`${this.name}: Using logout element as insertion point`);
      return logoutElement;
    }
    
    // Last resort: Append to header
    console.warn(`${this.name}: Could not find insertion point, will append to header`);
    return null; // Will be handled in renderCustomLinks
  }

  /**
   * Render all custom links
   */
  renderCustomLinks() {
    // Prevent duplicate rendering
    if (this.isRendering) {
      console.log(`${this.name}: Already rendering, skipping duplicate call`);
      return;
    }
    
    this.isRendering = true;
    
    try {
      // Clear existing links first
      this.elements.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      this.elements = [];

      // Find insertion point
      const header = document.querySelector('header.c-page-header');
      if (!header) {
        console.warn(`${this.name}: Could not find header element`);
        return;
      }

      const insertionPoint = this.findInsertionPoint(header);
      
      // Render each custom link directly to the header
      this.customLinks.forEach((link, index) => {
        const linkElement = this.createLinkElement(link, index);
        
        if (insertionPoint) {
          // Insert before the insertion point
          insertionPoint.parentNode.insertBefore(linkElement, insertionPoint);
        } else {
          // Append to header as fallback
          header.appendChild(linkElement);
        }
        
        this.elements.push(linkElement);
      });
      
      console.log(`${this.name}: Rendered ${this.elements.length} custom links`);
    } finally {
      // Use setTimeout to ensure rendering flag is cleared even if an error occurs
      setTimeout(() => {
        this.isRendering = false;
      }, 100);
    }
  }

  /**
   * Create a single link element
   * @param {Object} link - Link configuration
   * @param {number} index - Link index
   * @returns {Element} - The link element
   */
  createLinkElement(link, index) {
    // Handle separators differently
    if (link.type === 'separator') {
      const separatorDiv = document.createElement('div');
      separatorDiv.className = 'c-hdr-item custom-separator';
      separatorDiv.style.lineHeight = '0';
      
      const separatorSpan = document.createElement('span');
      separatorSpan.textContent = '|';
      separatorSpan.style.cssText = `
        color: white;
        font-size: 30px;
        font-weight: 300;
        user-select: none;
        line-height: 0;
      `;
      
      separatorDiv.appendChild(separatorSpan);
      return separatorDiv;
    }

    // Create wrapper div (same structure as logout link)
    const wrapperDiv = document.createElement('div');
    
    // Create a CSS-safe class name from the label
    const labelClass = link.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    wrapperDiv.className = `c-hdr-item custom-link-${labelClass}`;
    wrapperDiv.style.lineHeight = '1.5';

      // Create inner anchor tag
      const linkElement = document.createElement('a');
      linkElement.href = link.url;
      linkElement.title = link.tooltip || link.label;
      linkElement.style.opacity = '1';
      
      // Add target="_blank" if openNewTab is true
      if (link.openNewTab) {
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
      }

    // Create icon element only (no label text)
    const iconElement = document.createElement('i');
    iconElement.className = this.getIconClass(link.icon, link);
    iconElement.setAttribute('aria-hidden', 'true');
    
    // Apply icon size if setting exists
    this.applyIconSize(iconElement);

    linkElement.appendChild(iconElement);
    wrapperDiv.appendChild(linkElement);

    return wrapperDiv;
  }

  /**
   * Get the appropriate icon class based on icon name
   * @param {string} iconName - The icon name
   * @param {Object} link - The link object containing customIcon
   * @returns {string} - The icon class
   */
  getIconClass(iconName, link = null) {
    // Handle custom icons
    if (iconName === 'custom' && link && link.customIcon) {
      let customIconClass = link.customIcon.trim();
      
      // Convert icon-* to fa-icon-* if needed (CSOD uses fa-icon- prefix)
      if (customIconClass.startsWith('icon-') && !customIconClass.startsWith('fa-icon-')) {
        customIconClass = customIconClass.replace('icon-', 'fa-icon-');
      }
      
      return customIconClass;
    }
    
    const iconMap = {
      'home': { fa3: 'fa-icon-home', fa6: 'fa-solid fa-house', none: '🏠' },
      'settings': { fa3: 'fa-icon-cog', fa6: 'fa-solid fa-gear', none: '⚙️' },
      'user': { fa3: 'fa-icon-user', fa6: 'fa-solid fa-user', none: '👤' },
      'help': { fa3: 'fa-icon-question-sign', fa6: 'fa-solid fa-circle-question', none: '❓' },
      'info': { fa3: 'fa-icon-info-sign', fa6: 'fa-solid fa-circle-info', none: 'ℹ️' },
      'download': { fa3: 'fa-icon-download', fa6: 'fa-solid fa-download', none: '⬇️' },
      'upload': { fa3: 'fa-icon-upload', fa6: 'fa-solid fa-upload', none: '⬆️' },
      'edit': { fa3: 'fa-icon-edit', fa6: 'fa-solid fa-pen', none: '✏️' },
      'search': { fa3: 'fa-icon-search', fa6: 'fa-solid fa-magnifying-glass', none: '🔍' },
      'calendar': { fa3: 'fa-icon-calendar', fa6: 'fa-solid fa-calendar', none: '📅' },
      'chart': { fa3: 'fa-icon-bar-chart', fa6: 'fa-solid fa-chart-bar', none: '📊' },
      'folder': { fa3: 'fa-icon-folder-close', fa6: 'fa-solid fa-folder', none: '📁' },
      'file': { fa3: 'fa-icon-file', fa6: 'fa-solid fa-file', none: '📄' },
      'link': { fa3: 'fa-icon-link', fa6: 'fa-solid fa-link', none: '🔗' },
      'external': { fa3: 'fa-icon-external-link', fa6: 'fa-solid fa-arrow-up-right-from-square', none: '↗️' },
      'plus': { fa3: 'fa-icon-plus', fa6: 'fa-solid fa-plus', none: '➕' },
      'minus': { fa3: 'fa-icon-minus', fa6: 'fa-solid fa-minus', none: '➖' },
      'check': { fa3: 'fa-icon-check', fa6: 'fa-solid fa-check', none: '✅' },
      'times': { fa3: 'fa-icon-remove', fa6: 'fa-solid fa-xmark', none: '❌' },
      'star': { fa3: 'fa-icon-star', fa6: 'fa-solid fa-star', none: '⭐' },
      'heart': { fa3: 'fa-icon-heart', fa6: 'fa-solid fa-heart', none: '❤️' },
      'bell': { fa3: 'fa-icon-bell', fa6: 'fa-solid fa-bell', none: '🔔' },
      'envelope': { fa3: 'fa-icon-envelope', fa6: 'fa-solid fa-envelope', none: '✉️' },
      'phone': { fa3: 'fa-icon-phone', fa6: 'fa-solid fa-phone', none: '📞' },
      'camera': { fa3: 'fa-icon-camera', fa6: 'fa-solid fa-camera', none: '📷' },
      'image': { fa3: 'fa-icon-picture', fa6: 'fa-solid fa-image', none: '🖼️' },
      'video': { fa3: 'fa-icon-film', fa6: 'fa-solid fa-video', none: '🎥' },
      'music': { fa3: 'fa-icon-music', fa6: 'fa-solid fa-music', none: '🎵' },
      'book': { fa3: 'fa-icon-book', fa6: 'fa-solid fa-book', none: '📚' },
      'globe': { fa3: 'fa-icon-globe', fa6: 'fa-solid fa-globe', none: '🌐' },
      'lock': { fa3: 'fa-icon-lock', fa6: 'fa-solid fa-lock', none: '🔒' },
      'unlock': { fa3: 'fa-icon-unlock', fa6: 'fa-solid fa-unlock', none: '🔓' },
      'key': { fa3: 'fa-icon-key', fa6: 'fa-solid fa-key', none: '🔑' },
      'shield': { fa3: 'fa-icon-shield', fa6: 'fa-solid fa-shield', none: '🛡️' },
      'wrench': { fa3: 'fa-icon-wrench', fa6: 'fa-solid fa-wrench', none: '🔧' },
      'fire': { fa3: 'fa-icon-fire', fa6: 'fa-solid fa-fire', none: '🔥' },
      'bolt': { fa3: 'fa-icon-bolt', fa6: 'fa-solid fa-bolt', none: '⚡' },
      'flag': { fa3: 'fa-icon-flag', fa6: 'fa-solid fa-flag', none: '🚩' },
      'trophy': { fa3: 'fa-icon-trophy', fa6: 'fa-solid fa-trophy', none: '🏆' },
      'gift': { fa3: 'fa-icon-gift', fa6: 'fa-solid fa-gift', none: '🎁' }
    };

    const icon = iconMap[iconName];
    if (!icon) {
      console.warn(`${this.name}: Unknown icon "${iconName}", using default`);
      // Default to fa3 icon class (CSOD standard)
      return 'fa-icon-link';
    }

    // Prefer fa3 (fa-icon-*) classes for CSOD compatibility
    // Only use FontAwesomeUtil if it's available and explicitly set to fa6
    if (window.FontAwesomeUtil && window.FontAwesomeUtil.version === 'fa6') {
      return icon.fa6 || icon.fa3;
    }
    
    // Default to fa3 (fa-icon-*) classes for CSOD
    return icon.fa3 || icon.none;
  }

  /**
   * Add a new custom link
   * @param {Object} linkConfig - Link configuration
   */
  async addCustomLink(linkConfig) {
    this.customLinks.push(linkConfig);
    await this.saveCustomLinks();
    this.renderCustomLinks();
  }

  /**
   * Update an existing custom link
   * @param {number} index - Link index
   * @param {Object} linkConfig - Updated link configuration
   */
  async updateCustomLink(index, linkConfig) {
    if (index >= 0 && index < this.customLinks.length) {
      this.customLinks[index] = linkConfig;
      await this.saveCustomLinks();
      this.renderCustomLinks();
    }
  }

  /**
   * Remove a custom link
   * @param {number} index - Link index
   */
  async removeCustomLink(index) {
    if (index >= 0 && index < this.customLinks.length) {
      this.customLinks.splice(index, 1);
      await this.saveCustomLinks();
      this.renderCustomLinks();
    }
  }

  /**
   * Reorder custom links
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   */
  async reorderCustomLinks(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < this.customLinks.length &&
        toIndex >= 0 && toIndex < this.customLinks.length) {
      const link = this.customLinks.splice(fromIndex, 1)[0];
      this.customLinks.splice(toIndex, 0, link);
      await this.saveCustomLinks();
      this.renderCustomLinks();
    }
  }

  /**
   * Cleanup method - removes DOM elements but preserves data
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up DOM elements (preserving data)...`);
    
    // Remove all custom link elements from the header
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    // Clear the elements array
    this.elements = [];
    
    // IMPORTANT: Do NOT clear this.customLinks or storage data
    // The data should persist even when the enhancement is disabled
    console.log(`${this.name}: Cleanup complete. Data preserved in storage. Custom links count: ${this.customLinks.length}`);
  }

  /**
   * Wait for element to appear in the DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element>}
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        return resolve(element);
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}

// Make it available globally for the content script coordinator
window.CustomHeaderLinksEnhancement = CustomHeaderLinksEnhancement;

// Debug: Log when script loads
console.log('Custom Header Links: Script loaded on URL:', window.location.href);
