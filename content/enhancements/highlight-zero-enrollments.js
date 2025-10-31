/**
 * Highlight Zero Enrollments Enhancement
 * Highlights zero enrollments on Session List pages
 */

class HighlightZeroEnrollmentsEnhancement {
  constructor() {
    this.name = 'Highlight Zero Enrollments';
    this.elements = [];
    this.observers = [];
    this.highlightedCells = new Set(); // Track highlighted cells for cleanup
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

      this.applyEnrollmentHighlighting(table);

      // Set up MutationObserver to re-apply highlighting on table changes
      const tbody = table.querySelector('tbody');
      if (tbody) {
        const observer = new MutationObserver(mutations => {
          const relevantChange = mutations.some(mutation =>
            (mutation.type === 'childList' && mutation.addedNodes.length > 0) ||
            (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE && mutation.oldValue !== mutation.target.nodeValue)
          );
          if (relevantChange) {
            console.log(`${this.name}: Table content changed, re-applying highlighting.`);
            this.removeHighlighting(); // Clean up old highlights
            this.applyEnrollmentHighlighting(table); // Apply new highlights
          }
        });
        observer.observe(tbody, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
        this.observers.push(observer);
      }
      console.log(`${this.name}: Enrollment highlighting applied and observer set up.`);
    } catch (error) {
      console.warn(`${this.name}: Could not find session list table`, error);
    }
  }

  /**
   * Cleanup the enhancement
   */
  cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    this.removeHighlighting(); // Remove all highlights
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.elements = [];
    console.log(`${this.name}: Cleaned up successfully`);
  }

  /**
   * Apply enrollment highlighting to the session list table
   * @param {Element} table - The session list table element
   */
  applyEnrollmentHighlighting(table) {
    // Optimize based on table type
    const isILTSessionPage = window.location.href.includes('main_sessions');
    
    if (isILTSessionPage) {
      // For ILT session tables, directly target the 9th column (enrollment column)
      const enrollmentCells = table.querySelectorAll('tbody tr td:nth-child(9)');
      enrollmentCells.forEach(cell => {
        this.highlightEnrollmentCell(cell);
      });
    } else {
      // For regular session list tables (with spans)
      const enrollmentSpans = table.querySelectorAll('span[id*="RosterActualCount"]');
      enrollmentSpans.forEach(span => {
        this.highlightEnrollmentCell(span);
      });
    }
  }

  /**
   * Highlight a single enrollment cell if it contains zero enrollments
   * @param {Element} span - The span element containing the enrollment data
   */
  highlightEnrollmentCell(element) {
    const cellContent = element.textContent.trim();
    
    // Check if enrollment starts with "0 of" (zero enrollments)
    if (cellContent.startsWith('0 of')) {
      // Find the parent <td> cell to highlight the entire cell
      const cell = element.closest('td') || element;
      if (cell) {
        cell.style.backgroundColor = '#ffcccc';
        this.highlightedCells.add(cell);
        console.log(`${this.name}: Highlighted zero enrollment cell: ${cellContent}`);
      }
    }
  }

  /**
   * Remove highlighting from all cells
   */
  removeHighlighting() {
    this.highlightedCells.forEach(cell => {
      cell.style.backgroundColor = '';
    });
    this.highlightedCells.clear();
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
window.HighlightZeroEnrollmentsEnhancement = HighlightZeroEnrollmentsEnhancement;

// Debug: Log when script loads
console.log('Highlight Zero Enrollments: Script loaded on URL:', window.location.href);



