/**
 * Center Enrollment Column Enhancement
 * Centers the enrollment column on Session List pages
 */

class CenterEnrollmentColumnEnhancement {
  constructor() {
    this.name = 'Center Enrollment Column';
    this.elements = [];
    this.styleElement = null;
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);

    try {
      const table = await this.waitForElement('#allEvent-list', 5000);
      this.addEnrollmentColumnStyles();
      console.log(`${this.name}: Enrollment column centering applied.`);
    } catch (error) {
      console.warn(`${this.name}: Could not find session list table`, error);
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
   * Add CSS styles for enrollment column centering
   */
  addEnrollmentColumnStyles() {
    const style = document.createElement('style');
    style.id = 'csod-center-enrollment-column-styles';
    style.textContent = `
      /* Center the enrollment column */
      #allEvent-list tbody tr td:nth-child(8),
      #allEvent-list thead tr th:nth-child(8) {
        text-align: center !important;
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
window.CenterEnrollmentColumnEnhancement = CenterEnrollmentColumnEnhancement;

// Debug: Log when script loads
console.log('Center Enrollment Column: Script loaded on URL:', window.location.href);



