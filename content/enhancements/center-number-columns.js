/**
 * Center Number Columns Enhancement
 * Centers the text in number columns (Tentative, Approved, Completed Sessions)
 * for better visual consistency and readability
 */

class CenterNumberColumnsEnhancement {
  constructor() {
    this.name = 'Center Number Columns';
    this.elements = [];
    this.observers = [];
    this.styleElement = null;
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);
    
    try {
      // Wait for the events table to be available
      await this.waitForElement('#pnlEvents_content table', 5000);
      this.addCenteringStyles();
      console.log(`${this.name}: Number columns centered successfully`);
    } catch (error) {
      console.warn(`${this.name}: Could not find events table`, error);
    }
  }

  /**
   * Cleanup the enhancement
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    
    // Remove the style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
    
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
   * Add CSS to center number columns
   */
  addCenteringStyles() {
    const style = document.createElement('style');
    style.id = 'csod-center-number-columns';
    style.textContent = `
      /* Center the Tentative, Approved, and Completed Sessions columns */
      #pnlEvents_content table tbody tr td:nth-child(5),
      #pnlEvents_content table tbody tr td:nth-child(6),
      #pnlEvents_content table tbody tr td:nth-child(7),
      #pnlEvents_content table thead tr th:nth-child(5),
      #pnlEvents_content table thead tr th:nth-child(6),
      #pnlEvents_content table thead tr th:nth-child(7) {
        text-align: center !important;
      }
      
      /* Center header content inside the th cells */
      #pnlEvents_content table thead tr th:nth-child(5) .headerTitle,
      #pnlEvents_content table thead tr th:nth-child(6) .headerTitle,
      #pnlEvents_content table thead tr th:nth-child(7) .headerTitle {
        text-align: center !important;
        display: block;
      }
    `;
    
    document.head.appendChild(style);
    this.styleElement = style;
    this.elements.push(style);
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
window.CenterNumberColumnsEnhancement = CenterNumberColumnsEnhancement;

// Debug: Log when script loads
console.log('Center Number Columns: Script loaded on URL:', window.location.href);

