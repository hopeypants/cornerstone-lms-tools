/**
 * Format Session Dates Enhancement
 * Formats Start Date and End Date columns to display date and time on one line
 * separated by a pipe with em spaces for better readability
 */

class FormatSessionDatesEnhancement {
  constructor() {
    this.name = 'Format Session Dates';
    this.elements = [];
    this.observers = [];
    this.styleElement = null;
    this.checkInterval = null;
    this.originalContent = new Map(); // Store original content for restoration
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    // Prevent duplicate initialization
    if (this.checkInterval) {
      console.log(`${this.name}: Already initialized, skipping...`);
      return;
    }
    
    // Check if this is a page that has session dates
    if (!this.isSessionDatesPage()) {
      console.log(`${this.name}: Not a session dates page, skipping initialization`);
      return;
    }
    
    console.log(`${this.name}: Initializing...`);
    
    // Add styles first
    this.addFormattingStyles();
    
    // Try multiple approaches to find and format the spans
    this.formatAllSessionDates();
    
    // Set up periodic check for dynamic content (reduced frequency)
    const checkInterval = setInterval(() => {
      this.formatAllSessionDates();
    }, 1000); // Reduced to every 1 second instead of 100ms
    
    // Store interval for cleanup
    this.checkInterval = checkInterval;
    
    // Set up MutationObserver for immediate detection of new content
    this.setupMutationObserver();
    
    // Set up additional event listeners for common page load patterns
    this.setupEventListeners();
    
    console.log(`${this.name}: Enhancement initialized`);
  }

  /**
   * Check if this is a page that contains session dates
   * @returns {boolean} True if this page has session dates
   */
  isSessionDatesPage() {
    // Check for common session date elements
    const sessionDateElements = document.querySelectorAll('span[id*="sessionStartDate"], span[id*="sessionEndDate"]');
    if (sessionDateElements.length > 0) {
      return true;
    }
    
    // Check for session list tables
    const sessionTables = document.querySelectorAll('table[id*="session"], table[id*="event"]');
    if (sessionTables.length > 0) {
      return true;
    }
    
    // Check URL patterns for session-related pages
    const url = window.location.href.toLowerCase();
    const sessionUrlPatterns = [
      'event_sessions_list',
      'session',
      'event',
      'ilt'
    ];
    
    return sessionUrlPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Set up additional event listeners for common page load patterns
   */
  setupEventListeners() {
    // Listen for common events that might indicate content loading
    const events = ['load', 'DOMContentLoaded', 'pageshow', 'popstate', 'hashchange'];
    
    events.forEach(eventType => {
      const handler = () => {
        console.log(`${this.name}: ${eventType} event detected, checking for session dates`);
        setTimeout(() => this.formatAllSessionDates(), 50); // Small delay to let content load
      };
      
      window.addEventListener(eventType, handler);
      this.elements.push({ type: 'event', event: eventType, handler: handler });
    });
    
    // Also listen for AJAX completion (common in CSOD)
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;
    
    // Intercept fetch requests
    window.fetch = (...args) => {
      return originalFetch.apply(this, args).then(response => {
        if (response.ok) {
          setTimeout(() => this.formatAllSessionDates(), 100);
        }
        return response;
      });
    };
    
    // Intercept XMLHttpRequest
    XMLHttpRequest.prototype.open = function(...args) {
      const xhr = this;
      const originalOnReadyStateChange = xhr.onreadystatechange;
      
      xhr.onreadystatechange = function() {
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(this, arguments);
        }
        if (xhr.readyState === 4 && xhr.status === 200) {
          setTimeout(() => this.formatAllSessionDates(), 100);
        }
      };
      
      return originalXHROpen.apply(this, args);
    };
  }

  /**
   * Set up MutationObserver to detect new content immediately
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      let shouldCheck = false;
      
      mutations.forEach(mutation => {
        // Check for added nodes that might contain session dates
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node or its children contain session date spans
              if (node.querySelector && (
                node.querySelector('span[id*="sessionStartDate"]') ||
                node.querySelector('span[id*="sessionEndDate"]') ||
                node.id?.includes('sessionStartDate') ||
                node.id?.includes('sessionEndDate')
              )) {
                shouldCheck = true;
              }
            }
          });
        }
      });
      
      if (shouldCheck) {
        console.log(`${this.name}: MutationObserver detected new session content, formatting immediately`);
        this.formatAllSessionDates();
      }
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.observers.push(observer);
  }

  /**
   * Format all session dates found on the page
   */
  formatAllSessionDates() {
    // Look for any span with sessionStartDate or sessionEndDate in the ID
    const startDateSpans = document.querySelectorAll('span[id*="sessionStartDate"]');
    const endDateSpans = document.querySelectorAll('span[id*="sessionEndDate"]');
    
    let formattedCount = 0;
    
    // Format all found spans
    [...startDateSpans, ...endDateSpans].forEach(span => {
      if (this.formatDateCell(span)) {
        formattedCount++;
      }
    });
    
    // Only log when we actually format something new
    if (formattedCount > 0) {
      console.log(`${this.name}: Formatted ${formattedCount} new date spans`);
    }
  }

  /**
   * Restore all session dates to their original format
   */
  restoreAllSessionDates() {
    console.log(`${this.name}: Restoring original formatting...`);
    
    // Look for any span with sessionStartDate or sessionEndDate in the ID
    const startDateSpans = document.querySelectorAll('span[id*="sessionStartDate"]');
    const endDateSpans = document.querySelectorAll('span[id*="sessionEndDate"]');
    
    // Restore all found spans
    [...startDateSpans, ...endDateSpans].forEach(span => {
      this.restoreDateCell(span);
    });
    
    console.log(`${this.name}: Restored ${startDateSpans.length + endDateSpans.length} date spans`);
  }

  /**
   * Cleanup the enhancement
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    
    // Restore original formatting before cleanup
    this.restoreAllSessionDates();
    
    // Clear the interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    // Remove event listeners
    this.elements.forEach(element => {
      if (element.type === 'event') {
        window.removeEventListener(element.event, element.handler);
      } else if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.elements = [];
    
    // Remove the style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // DON'T clear stored original content - keep it for when the enhancement is re-enabled
    // this.originalContent.clear();
    
    console.log(`${this.name}: Cleaned up successfully (preserved original content for re-enabling)`);
  }

  /**
   * Add CSS styles for date formatting
   */
  addFormattingStyles() {
    const style = document.createElement('style');
    style.id = 'csod-format-session-dates';
    style.textContent = `
      /* Format session date columns to display on single line */
      #allEvent-list tbody tr td:nth-child(4) span,
      #allEvent-list tbody tr td:nth-child(5) span {
        white-space: nowrap !important;
        line-height: 1.2 !important;
      }
      
      /* Fixed width spans for date/time alignment */
      .session-date-part {
        display: inline-block !important;
        // width: 80px !important;
        text-align: left !important;
      }
      
      .session-separator {
        display: inline-block !important;
        width: 20px !important;
        text-align: center !important;
      }
      
      .session-time-part {
        display: inline-block !important;
        width: 100px !important;
        text-align: left !important;
      }
    `;
    
    document.head.appendChild(style);
    this.styleElement = style;
    this.elements.push(style);
  }

  /**
   * Format the date columns in the session list table
   * @param {Element} table - The session list table element
   */
  formatDateColumns(table) {
    // Find all date cells (Start Date and End Date columns)
    const startDateCells = table.querySelectorAll('tbody tr td:nth-child(4) span[id*="sessionStartDate"]');
    const endDateCells = table.querySelectorAll('tbody tr td:nth-child(5) span[id*="sessionEndDate"]');
    
    // Format Start Date cells
    startDateCells.forEach(cell => {
      this.formatDateCell(cell);
    });
    
    // Format End Date cells
    endDateCells.forEach(cell => {
      this.formatDateCell(cell);
    });
  }

  /**
   * Format a single date cell to display date and time on one line
   * @param {Element} cell - The span element containing the date/time
   */
  formatDateCell(cell) {
    const originalText = cell.innerHTML;
    
    // Skip if already formatted (contains the new span structure)
    if (originalText.includes('<span class="session-date-part">')) {
      return false; // Already formatted
    }
    
    // Store original content if not already stored
    if (!this.originalContent.has(cell)) {
      this.originalContent.set(cell, originalText);
    }
    
    // Check if it contains a <br> tag (indicating date and time are on separate lines)
    if (originalText.includes('<br>')) {
      // Parse the date and time parts
      const parts = originalText.split(/<br\s*\/?>/gi);
      if (parts.length === 2) {
        const datePart = parts[0].trim();
        const timePart = parts[1].trim();
        
        // Create spans with fixed widths for alignment
        const formattedText = `<span class="session-date-part">${datePart}</span><span class="session-separator">|</span><span class="session-time-part">${timePart}</span>`;
        cell.innerHTML = formattedText;
        return true; // Indicate that formatting was applied
      } else {
        // Fallback to simple replacement if parsing fails
        const formattedText = originalText.replace(/<br\s*\/?>/gi, ' | ');
        cell.innerHTML = formattedText;
        return true;
      }
    } else {
      return false; // Indicate that no formatting was needed
    }
  }

  /**
   * Restore a single date cell to its original format
   * @param {Element} cell - The span element containing the date/time
   */
  restoreDateCell(cell) {
    const originalContent = this.originalContent.get(cell);
    if (originalContent) {
      cell.innerHTML = originalContent;
      console.log(`${this.name}: Restored cell to:`, originalContent);
      return true; // Indicate that restoration was applied
    } else {
      console.log(`${this.name}: No original content found for cell, skipping restoration`);
      return false; // Indicate that no restoration was needed
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
window.FormatSessionDatesEnhancement = FormatSessionDatesEnhancement;

// Don't auto-initialize - let the content script coordinator handle initialization based on toggle state
console.log('Format Session Dates: Script loaded, waiting for coordinator to handle initialization');
