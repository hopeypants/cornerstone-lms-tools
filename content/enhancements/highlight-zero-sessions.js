/**
 * Highlight Zero Sessions Enhancement
 * Highlights table cells containing "0" with a light red background color
 * to make it easy to identify events with no sessions
 */

class HighlightZeroSessionsEnhancement {
  constructor() {
    this.name = 'Highlight Zero Sessions';
    this.elements = [];
    this.observers = [];
    this.highlightColor = '#ffcccc'; // Light red background
    this.highlightedCells = []; // Track which cells we've highlighted
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);
    
    try {
      // Wait for the events table to be available
      const table = await this.waitForElement('#pnlEvents_content table', 5000);
      this.highlightZeroCells(table);
      
      // Watch for changes to the table (sorting, filtering, etc.)
      this.observeTableChanges(table);
      
      console.log(`${this.name}: Zero cells highlighted successfully`);
    } catch (error) {
      console.warn(`${this.name}: Could not find events table`, error);
    }
  }

  /**
   * Cleanup the enhancement
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    
    // Remove highlighting from all cells
    this.highlightedCells.forEach(cell => {
      if (cell && cell.style) {
        cell.style.backgroundColor = '';
      }
    });
    this.highlightedCells = [];
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    console.log(`${this.name}: Cleaned up successfully`);
  }

  /**
   * Highlight all cells containing "0" in the table
   * @param {Element} table - The events table element
   */
  highlightZeroCells(table) {
    // Clear previously highlighted cells list
    this.highlightedCells = [];
    
    // Get all td elements in the table body
    const cells = table.querySelectorAll('tbody td');
    
    cells.forEach(cell => {
      const cellContent = cell.textContent.trim();
      
      // Check if the cell contains exactly "0"
      if (cellContent === '0') {
        cell.style.backgroundColor = this.highlightColor;
        this.highlightedCells.push(cell);
      }
    });
    
    console.log(`${this.name}: Highlighted ${this.highlightedCells.length} cells containing "0"`);
  }

  /**
   * Observe table changes and re-apply highlighting when needed
   * @param {Element} table - The events table element
   */
  observeTableChanges(table) {
    const observer = new MutationObserver(() => {
      // Re-apply highlighting when table content changes
      this.highlightZeroCells(table);
    });

    // Observe the table body for changes
    const tbody = table.querySelector('tbody');
    if (tbody) {
      observer.observe(tbody, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      this.observers.push(observer);
    }
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
window.HighlightZeroSessionsEnhancement = HighlightZeroSessionsEnhancement;

// Debug: Log when script loads
console.log('Highlight Zero Sessions: Script loaded on URL:', window.location.href);

