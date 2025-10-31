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

    // Check if we're on an ILT session page first (faster detection)
    const isILTSessionPage = window.location.href.includes('main_sessions');
    
    try {
      let table;
      if (isILTSessionPage) {
        // For ILT session pages, look for the specific table immediately
        table = document.querySelector('#tblSessionData');
        if (!table) {
          table = await this.waitForElement('#tblSessionData', 1000);
        }
      } else {
        // For regular session pages, look for the regular table
        table = document.querySelector('#allEvent-list');
        if (!table) {
          table = await this.waitForElement('#allEvent-list', 2000);
        }
      }
      
      if (!table) {
        console.warn(`${this.name}: Could not find session list table`);
        return;
      }

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
      /* Center the enrollment column for regular session list tables */
      #allEvent-list tbody tr td:nth-child(8),
      #allEvent-list thead tr th:nth-child(8) {
        text-align: center !important;
      }
      
      /* Center the enrollment column for ILT session tables (column 9) */
      #tblSessionData tbody tr td:nth-child(9),
      #tblSessionData thead tr th:nth-child(9) {
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



