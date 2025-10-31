/**
 * Highlight Full Sessions Enhancement
 * Highlights table cells where enrollment numbers are equal (e.g., "10 of 10", "5 of 5")
 * to make it easy to identify sessions that are full
 */

class HighlightFullSessionsEnhancement {
  constructor() {
    this.name = 'Highlight Full Sessions';
    this.elements = [];
    this.observers = [];
    this.highlightColor = '#ccffcc'; // Light green background
    this.highlightedCells = []; // Track which cells we've highlighted
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

      this.highlightFullCells(table);
      
      // Watch for changes to the table (sorting, filtering, etc.)
      this.observeTableChanges(table);
      
      console.log(`${this.name}: Full session cells highlighted successfully`);
    } catch (error) {
      console.warn(`${this.name}: Could not find session list table`, error);
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
   * Check if text matches "X of X" pattern where both numbers are equal
   * @param {string} text - The cell text content
   * @returns {boolean} - True if the pattern matches and numbers are equal
   */
  isFullSession(text) {
    // Pattern to match "X of Y" where X and Y are numbers
    // Examples: "10 of 10", "5 of 5", "100 of 100"
    const pattern = /^(\d+)\s+of\s+(\d+)$/i;
    const match = text.trim().match(pattern);
    
    if (match) {
      const firstNumber = parseInt(match[1], 10);
      const secondNumber = parseInt(match[2], 10);
      // Return true if both numbers are equal
      return firstNumber === secondNumber;
    }
    
    return false;
  }

  /**
   * Highlight all cells containing full session patterns (e.g., "10 of 10")
   * @param {Element} table - The session list table element
   */
  highlightFullCells(table) {
    // Clear previously highlighted cells list
    this.highlightedCells = [];
    
    // Check if we're on an ILT session page
    const isILTSessionPage = window.location.href.includes('main_sessions');
    
    if (isILTSessionPage) {
      // For ILT session tables, directly target the 9th column (enrollment column)
      const enrollmentCells = table.querySelectorAll('tbody tr td:nth-child(9)');
      enrollmentCells.forEach(cell => {
        const cellContent = cell.textContent.trim();
        if (this.isFullSession(cellContent)) {
          cell.style.backgroundColor = this.highlightColor;
          this.highlightedCells.push(cell);
        }
      });
    } else {
      // For regular session list tables (with spans)
      const enrollmentSpans = table.querySelectorAll('span[id*="RosterActualCount"]');
      enrollmentSpans.forEach(span => {
        const cellContent = span.textContent.trim();
        if (this.isFullSession(cellContent)) {
          // Find the parent <td> cell to highlight the entire cell
          const cell = span.closest('td') || span;
          if (cell) {
            cell.style.backgroundColor = this.highlightColor;
            this.highlightedCells.push(cell);
          }
        }
      });
    }
    
    console.log(`${this.name}: Highlighted ${this.highlightedCells.length} cells with full sessions`);
  }

  /**
   * Observe table changes and re-apply highlighting when needed
   * @param {Element} table - The session list table element
   */
  observeTableChanges(table) {
    const tbody = table.querySelector('tbody');
    if (tbody) {
      const observer = new MutationObserver(mutations => {
        const relevantChange = mutations.some(mutation =>
          (mutation.type === 'childList' && mutation.addedNodes.length > 0) ||
          (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE && mutation.oldValue !== mutation.target.textContent)
        );
        if (relevantChange) {
          console.log(`${this.name}: Table content changed, re-applying highlighting.`);
          // Remove old highlights first
          this.highlightedCells.forEach(cell => {
            if (cell && cell.style) {
              cell.style.backgroundColor = '';
            }
          });
          this.highlightedCells = [];
          // Apply new highlights
          this.highlightFullCells(table);
        }
      });
      
      observer.observe(tbody, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
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
window.HighlightFullSessionsEnhancement = HighlightFullSessionsEnhancement;

// Debug: Log when script loads
console.log('Highlight Full Sessions: Script loaded on URL:', window.location.href);

