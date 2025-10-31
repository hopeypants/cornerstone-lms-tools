/**
 * Custom Page Preview Link
 * Adds a button beside each URL in the Custom Pages table to open the link in a new tab
 */

(function() {
  'use strict';

  class CustomPagePreviewLinkEnhancement {
    constructor() {
      this.initialized = false;
      this.buttonsAdded = new Set();
    }

    async initialize() {
      if (this.initialized) return;
      this.initialized = true;

      // Check if we're on a page with the custom page list table
      const table = document.querySelector('table.CsList.tbl-std');
      if (!table) return;

      // Check if URL contains relevant paths (optional, but helps)
      const href = window.location && window.location.href ? window.location.href : '';
      if (!href.includes('CustomPage') && !href.includes('custom')) {
        // Still check for the table structure
        const hasCustomPageId = table.querySelector('[id*="lblCustomPageId"]');
        if (!hasCustomPageId) return;
      }

      await this.addPreviewButtons();
      
      // Watch for new rows added dynamically and AJAX pagination
      this.observeTable();
      
      // Also set up a periodic check as a fallback for AJAX updates
      this.setupPeriodicCheck();
    }

    async addPreviewButtons() {
      // Find all table rows in tbody
      const rows = document.querySelectorAll('table.CsList.tbl-std tbody tr');
      
      // Clear any references to rows that no longer exist in the DOM
      // This handles pagination where the entire tbody is replaced
      this.buttonsAdded.forEach((row) => {
        if (!document.contains(row)) {
          this.buttonsAdded.delete(row);
        }
      });
      
      rows.forEach((row, index) => {
        // Skip if button already added
        if (this.buttonsAdded.has(row)) return;

        // Find the URL column (second td) to extract the URL
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;

        const urlCell = cells[1]; // Second column (index 1)
        if (!urlCell) return;

        // Extract the URL from the cell
        // The URL format is: /catalog/CustomPage.aspx?id=<span id="...lblCustomPageId">ID</span>
        // The textContent of the cell will be: "/catalog/CustomPage.aspx?id=221000555" (span text is included)
        let url = urlCell.textContent.trim();
        
        // Validate that it looks like a URL
        if (!url || !url.includes('/catalog/CustomPage.aspx?id=')) {
          return;
        }
        
        // Make URL absolute if it's relative
        if (url.startsWith('/')) {
          const baseUrl = window.location.origin;
          url = baseUrl + url;
        }

        // Find the Options column (last td)
        const optionsCell = cells[cells.length - 1]; // Last column
        if (!optionsCell) return;

        // Check if button already exists
        if (optionsCell.querySelector('.custom-page-preview-btn')) return;
        
        // Create button styled like a button with text
        const button = document.createElement('a');
        button.href = url;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.className = 'custom-page-preview-btn';
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', 'Open in new tab');
        button.title = 'Open in new tab';
        button.textContent = 'Open';
        button.style.cssText = 'display: inline-block; margin-right: 8px; padding: 4px 8px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; vertical-align: middle; font-weight: 500;';
        
        // Add button to the Options column (before the existing links, or at the end)
        // Insert at the beginning so it appears first
        optionsCell.insertBefore(button, optionsCell.firstChild);
        
        // Mark as added
        this.buttonsAdded.add(row);
      });
    }

    observeTable() {
      const table = document.querySelector('table.CsList.tbl-std');
      if (!table) return;

      // Store reference to current tbody
      let currentTbody = table.querySelector('tbody');

      const observer = new MutationObserver((mutations) => {
        // Check if tbody was replaced (common in AJAX pagination)
        const newTbody = table.querySelector('tbody');
        if (newTbody !== currentTbody) {
          // Tbody was replaced, clear the Set and update reference
          this.buttonsAdded.clear();
          currentTbody = newTbody;
        }
        
        // Check if any rows were added or removed
        let hasChanges = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          // Clear any references to removed rows
          this.buttonsAdded.forEach((row) => {
            if (!document.contains(row)) {
              this.buttonsAdded.delete(row);
            }
          });
          
          // Add buttons to any new rows
          this.addPreviewButtons();
        }
      });

      // Observe the entire table to catch tbody replacements and row changes
      observer.observe(table, {
        childList: true,
        subtree: true
      });
      
      // Store observer reference so we can disconnect it later if needed
      this.tableObserver = observer;
    }
    
    setupPeriodicCheck() {
      // Fallback: periodically check for new rows (handles AJAX that might not trigger mutations correctly)
      this.periodicCheckInterval = setInterval(() => {
        const table = document.querySelector('table.CsList.tbl-std');
        if (!table) {
          clearInterval(this.periodicCheckInterval);
          return;
        }
        
        const rows = table.querySelectorAll('tbody tr');
        let hasNewRows = false;
        
        rows.forEach((row) => {
          // Check if this row needs a button
          if (!this.buttonsAdded.has(row)) {
            const optionsCell = row.querySelectorAll('td')[row.querySelectorAll('td').length - 1];
            if (optionsCell && !optionsCell.querySelector('.custom-page-preview-btn')) {
              hasNewRows = true;
            }
          }
        });
        
        if (hasNewRows) {
          this.addPreviewButtons();
        }
      }, 1000); // Check every second
    }

    async cleanup() {
      // Remove all preview buttons
      const buttons = document.querySelectorAll('.custom-page-preview-btn');
      buttons.forEach(btn => btn.remove());
      this.buttonsAdded.clear();
      
      // Disconnect observers
      if (this.tableObserver) {
        this.tableObserver.disconnect();
        this.tableObserver = null;
      }
      
      // Clear interval
      if (this.periodicCheckInterval) {
        clearInterval(this.periodicCheckInterval);
        this.periodicCheckInterval = null;
      }
      
      this.initialized = false;
    }
  }

  window.CustomPagePreviewLinkEnhancement = CustomPagePreviewLinkEnhancement;
})();

