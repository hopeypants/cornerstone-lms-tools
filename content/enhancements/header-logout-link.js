/**
 * Header Logout Link Enhancement
 * Adds a custom logout link to the Cornerstone LMS header with Font Awesome icon
 */

class HeaderLogoutLinkEnhancement {
  constructor() {
    this.name = 'Header Logout Link';
    this.elements = [];
    this.observers = [];
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);
    
    // Load Font Awesome using shared utility
    await window.FontAwesomeUtil.load();
    
    // Wait for header to be available
    try {
      const header = await this.waitForElement('header.c-page-header', 3000);
      this.addLogoutLink(header);
      console.log(`${this.name}: Logout link added successfully`);
    } catch (error) {
      console.warn(`${this.name}: Could not find header element`, error);
    }
  }

  /**
   * Cleanup the enhancement
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    
    // Remove all added elements
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.elements = [];
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    console.log(`${this.name}: Cleaned up successfully`);
  }

  /**
   * Add logout link to the header
   * @param {Element} header - The header element
   */
  addLogoutLink(header) {
    // Find the search element to insert before it
    const searchElement = header.querySelector('.c-hdr-item.search');
    
    if (!searchElement) {
      console.warn(`${this.name}: Could not find search element in header`);
      return;
    }

    // Create logout link container
    const logoutContainer = document.createElement('div');
    logoutContainer.className = 'c-hdr-item csod-custom-logout';
    
    // Create the logout link
    const logoutLink = document.createElement('a');
    logoutLink.href = '/Logout.aspx';
    logoutLink.title = 'Logout'; // Tooltip for accessibility
    
    // Create icon using shared Font Awesome utility
    const icon = document.createElement('i');
    const iconClass = window.FontAwesomeUtil.getIconClass('signout');
    
    // Handle text fallback (when no FA is loaded)
    if (window.FontAwesomeUtil.version === 'none') {
      icon.textContent = iconClass; // Will be '→'
    } else {
      icon.className = iconClass;
    }
    
    icon.setAttribute('aria-hidden', 'true');
    
    // Assemble the link (icon only, no text label)
    logoutLink.appendChild(icon);
    logoutContainer.appendChild(logoutLink);
    
    // No hover effect - let the webpage handle styling
    
    // Insert before the search element
    header.insertBefore(logoutContainer, searchElement);
    this.elements.push(logoutContainer);
    
    console.log(`${this.name}: Logout link inserted into header`);
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
window.HeaderLogoutLinkEnhancement = HeaderLogoutLinkEnhancement;

