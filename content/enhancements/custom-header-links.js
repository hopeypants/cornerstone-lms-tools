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
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);

    try {
      // Load custom links from storage
      await this.loadCustomLinks();
      
      // Wait for header to be available
      const header = await this.waitForElement('header.c-page-header', 5000);
      
      // Render all custom links directly to header
      this.renderCustomLinks();
      
      console.log(`${this.name}: Custom links initialized with ${this.customLinks.length} links`);
    } catch (error) {
      console.warn(`${this.name}: Could not find header element`, error);
    }
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
    // Find the csod-custom-logout element to insert before it
    const logoutElement = header.querySelector('.csod-custom-logout');
    
    if (!logoutElement) {
      console.warn(`${this.name}: Could not find csod-custom-logout element in header`);
      return null;
    }

    return logoutElement;
  }

  /**
   * Render all custom links
   */
  renderCustomLinks() {
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
    if (!insertionPoint) {
      return;
    }

    // Render each custom link directly to the header
    this.customLinks.forEach((link, index) => {
      const linkElement = this.createLinkElement(link, index);
      insertionPoint.parentNode.insertBefore(linkElement, insertionPoint);
      this.elements.push(linkElement);
    });
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
      return window.FontAwesomeUtil ? window.FontAwesomeUtil.getIconClass('link') : '🔗';
    }

    // Use FontAwesomeUtil if available, otherwise fallback to none
    if (window.FontAwesomeUtil && window.FontAwesomeUtil.version) {
      return icon[window.FontAwesomeUtil.version] || icon.none;
    }
    
    return icon.none;
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
