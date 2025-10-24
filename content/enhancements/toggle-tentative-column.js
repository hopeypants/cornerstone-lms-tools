/**
 * Toggle Tentative Column Enhancement
 * Adds a button to toggle visibility of the Tentative column in event tables
 */

class ToggleTentativeColumnEnhancement {
  constructor() {
    this.name = 'Toggle Tentative Column';
    this.elements = [];
    this.observers = [];
    this.buttonClickHandler = null;
    this.isColumnVisible = false; // Track column visibility state
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);
    
    // Check if we're on the events page by looking for #pnlEvents
    const eventsPanel = document.querySelector('#pnlEvents');
    if (!eventsPanel) {
      console.log(`${this.name}: Not on events page (#pnlEvents not found), skipping initialization`);
      return;
    }
    
    // Load saved visibility state
    await this.loadVisibilityState();
    
    try {
      // Wait for the actions div to be available
      const actionsDiv = await this.waitForElement('#dvActions', 5000);
      this.addToggleButton(actionsDiv);
      console.log(`${this.name}: Toggle button added successfully`);
    } catch (error) {
      console.warn(`${this.name}: Could not find actions div`, error);
    }
  }

  /**
   * Load the saved visibility state from storage
   */
  async loadVisibilityState() {
    try {
      const result = await chrome.storage.local.get('tentativeColumnVisible');
      // Default to false (hidden) if no saved state
      this.isColumnVisible = result.tentativeColumnVisible ?? false;
      console.log(`${this.name}: Loaded visibility state: ${this.isColumnVisible}`);
    } catch (error) {
      console.error(`${this.name}: Error loading visibility state:`, error);
      this.isColumnVisible = false;
    }
  }

  /**
   * Save the visibility state to storage
   */
  async saveVisibilityState() {
    try {
      await chrome.storage.local.set({ tentativeColumnVisible: this.isColumnVisible });
      console.log(`${this.name}: Saved visibility state: ${this.isColumnVisible}`);
    } catch (error) {
      console.error(`${this.name}: Error saving visibility state:`, error);
    }
  }

  /**
   * Cleanup the enhancement
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    
    // IMPORTANT: Show the tentative column when feature is disabled
    // This ensures users can always see the column even when the toggle is off
    this.isColumnVisible = true; // Force column to be visible
    this.applyColumnVisibility(); // Apply the visibility
    console.log(`${this.name}: Made tentative column visible before cleanup`);
    
    // Remove event listeners
    if (this.buttonClickHandler && this.elements[0]) {
      this.elements[0].removeEventListener('click', this.buttonClickHandler);
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
   * Add CSS styles for the toggle button
   */
  addButtonStyles() {
    const style = document.createElement('style');
    style.id = 'csod-toggle-tentative-styles';
    style.textContent = `
      #dvActions #btnToggleColumn {
        margin-right: 2px !important;
      }
    `;
    
    document.head.appendChild(style);
    this.elements.push(style);
  }

  /**
   * Add the toggle button to the actions div
   * @param {Element} actionsDiv - The actions div element
   */
  addToggleButton(actionsDiv) {
    // Add CSS styles first
    this.addButtonStyles();
    
    // Create the button
    const button = document.createElement('a');
    button.id = 'btnToggleColumn';
    button.className = 'CsImageButton new-secondary';
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    
    const span = document.createElement('span');
    span.className = 'text';
    // Set initial button text based on loaded state
    span.textContent = this.isColumnVisible ? 'Hide Tentative' : 'Show Tentative';
    button.appendChild(span);
    
    // Store references for updating button text
    this.buttonSpan = span;
    
    // Add click handler
    this.buttonClickHandler = () => this.toggleColumn();
    button.addEventListener('click', this.buttonClickHandler);
    
    // Add to page (prepend to actions div)
    actionsDiv.insertBefore(button, actionsDiv.firstChild);
    this.elements.push(button);
    
    // Apply the loaded visibility state to the column
    this.applyColumnVisibility();
  }

  /**
   * Toggle the visibility of the 5th column (Tentative) in the events table
   */
  async toggleColumn() {
    // Toggle the state
    this.isColumnVisible = !this.isColumnVisible;
    
    // Apply the new visibility
    this.applyColumnVisibility();
    
    // Save the state for persistence
    await this.saveVisibilityState();
  }

  /**
   * Apply the current visibility state to the Tentative column
   */
  applyColumnVisibility() {
    // Find the table
    const table = document.querySelector('#pnlEvents_content table');
    
    if (!table) {
      console.warn(`${this.name}: Table not found`);
      return;
    }
    
    // Get all rows
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
      // Get all cells (th and td)
      const cells = row.querySelectorAll('td, th');
      
      if (cells.length > 4) {
        const cell = cells[4]; // 5th column (index 4)
        
        // Set visibility based on current state
        cell.style.display = this.isColumnVisible ? '' : 'none';
      }
    });
    
    // Update button text
    if (this.buttonSpan) {
      this.buttonSpan.textContent = this.isColumnVisible ? 'Hide Tentative' : 'Show Tentative';
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
window.ToggleTentativeColumnEnhancement = ToggleTentativeColumnEnhancement;

// Debug: Log when script loads
console.log('Toggle Tentative Column: Script loaded on URL:', window.location.href);

