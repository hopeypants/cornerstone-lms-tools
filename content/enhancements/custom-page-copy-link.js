/**
 * Custom Page Copy Link
 * Adds a button beside each Custom Page ID to copy the URL to clipboard
 */

(function() {
  'use strict';

  class CustomPageCopyLinkEnhancement {
    constructor() {
      this.initialized = false;
      this.buttonsAdded = new Set();
      this.styleInjected = false;
    }

    injectStyles() {
      // Inject CSS to hide button by default and show on row hover, plus copied message styles
      const styleId = 'custom-page-copy-link-styles';
      let style = document.getElementById(styleId);
      
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          table.CsList.tbl-std tbody tr .custom-page-copy-btn {
            opacity: 0 !important;
            transition: opacity 0.2s ease !important;
            pointer-events: auto !important;
          }
          table.CsList.tbl-std tbody tr:hover .custom-page-copy-btn {
            opacity: 1 !important;
          }
        `;
        document.head.appendChild(style);
        console.log('Custom Page Copy Link: Styles injected');
      }
      this.styleInjected = true;
    }

    async initialize() {
      if (this.initialized) {
        console.log('Custom Page Copy Link: Already initialized');
        return;
      }
      this.initialized = true;
      console.log('Custom Page Copy Link: Initializing...');

      // Check if we're on a page with the custom page list table
      const table = document.querySelector('table.CsList.tbl-std');
      if (!table) {
        console.log('Custom Page Copy Link: Table not found');
        return;
      }

      // Check if URL contains relevant paths (optional, but helps)
      const href = window.location && window.location.href ? window.location.href : '';
      if (!href.includes('CustomPage') && !href.includes('custom')) {
        // Still check for the table structure
        const hasCustomPageId = table.querySelector('[id*="lblCustomPageId"]');
        if (!hasCustomPageId) {
          console.log('Custom Page Copy Link: Custom page ID span not found');
          return;
        }
      }

      // Inject styles for hover behavior
      this.injectStyles();
      console.log('Custom Page Copy Link: Styles injected');

      await this.addCopyButtons();
      
      // Watch for new rows added dynamically and AJAX pagination
      this.observeTable();
      
      // Also set up a periodic check as a fallback for AJAX updates
      this.setupPeriodicCheck();
      console.log('Custom Page Copy Link: Initialization complete');
    }

    async addCopyButtons() {
      console.log('Custom Page Copy Link: addCopyButtons called');
      
      // Ensure styles are injected
      this.injectStyles();
      
      // Find all table rows in tbody
      const rows = document.querySelectorAll('table.CsList.tbl-std tbody tr');
      console.log('Custom Page Copy Link: Found', rows.length, 'rows');
      
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

        // Find the span with ID ending in "lblCustomPageId"
        const customPageIdSpan = row.querySelector('span[id$="lblCustomPageId"]');
        if (!customPageIdSpan) return;

        // Set the span width to 74px (apply when this feature OR preview link feature is enabled)
        customPageIdSpan.style.width = '74px';
        customPageIdSpan.style.display = 'inline-block';

        // Find the URL cell (td containing the span)
        // The URL is in the textContent of the td that contains the span
        const urlCell = customPageIdSpan.closest('td');
        if (!urlCell) {
          console.log('Custom Page Copy Link: No URL cell found');
          return;
        }

        // Try to get URL from the Open button if it exists (more reliable)
        let url = null;
        const openButton = urlCell.querySelector('.custom-page-preview-btn');
        if (openButton && openButton.href) {
          url = openButton.href;
          console.log('Custom Page Copy Link: Found URL from Open button:', url);
        } else {
          // Extract the URL from the cell's textContent
          // Format: /catalog/CustomPage.aspx?id=221000544 or full URL
          // Need to extract just the URL part, not any button text
          // Clone the cell to remove button elements before getting textContent
          const cellClone = urlCell.cloneNode(true);
          const buttonsToRemove = cellClone.querySelectorAll('.custom-page-preview-btn, .custom-page-copy-btn');
          buttonsToRemove.forEach(btn => btn.remove());
          const textContent = cellClone.textContent.trim();
          
          // Try to match full URL first (https://... or http://...)
          const fullUrlMatch = textContent.match(/https?:\/\/[^\s]+/);
          if (fullUrlMatch) {
            url = fullUrlMatch[0];
            console.log('Custom Page Copy Link: Found full URL from text:', url);
          } else {
            // Try relative URL pattern
            const urlMatch = textContent.match(/\/catalog\/CustomPage\.aspx\?id=\d+/);
            if (urlMatch) {
              url = urlMatch[0];
              console.log('Custom Page Copy Link: Found relative URL from text:', url);
            } else {
              // Fallback: try to find URL in textContent
              const urlIndex = textContent.indexOf('/catalog/CustomPage.aspx?id=');
              if (urlIndex !== -1) {
                // Extract URL - find the end (either space, newline, or end of string)
                let urlEnd = textContent.length;
                const spaceIndex = textContent.indexOf(' ', urlIndex);
                const newlineIndex = textContent.indexOf('\n', urlIndex);
                if (spaceIndex !== -1) urlEnd = Math.min(urlEnd, spaceIndex);
                if (newlineIndex !== -1) urlEnd = Math.min(urlEnd, newlineIndex);
                url = textContent.substring(urlIndex, urlEnd);
                console.log('Custom Page Copy Link: Found URL using fallback:', url);
              }
            }
          }
        }
        
        // Validate that we have a URL
        if (!url || !url.includes('/catalog/CustomPage.aspx?id=')) {
          console.log('Custom Page Copy Link: URL validation failed. URL:', url);
          return;
        }
        
        // Make URL absolute if it's relative
        if (url.startsWith('/')) {
          const baseUrl = window.location.origin;
          url = baseUrl + url;
          console.log('Custom Page Copy Link: Made URL absolute:', url);
        }

        // Check if button already exists
        if (customPageIdSpan.parentElement.querySelector('.custom-page-copy-btn')) {
          console.log('Custom Page Copy Link: Button already exists');
          return;
        }
        
        // Create button
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'custom-page-copy-btn';
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', 'Copy URL to clipboard');
        button.title = 'Copy URL to clipboard';
        button.textContent = 'Copy';
        button.style.cssText = 'display: inline-block !important; margin-left: 8px; padding: 4px 8px; background: #10b981; color: white; border: none; border-radius: 4px; font-size: 12px; vertical-align: middle; font-weight: 500; cursor: pointer;';
        // Don't set opacity inline - let CSS handle it
        
        // Add click handler to copy URL
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Show copied message (Bootstrap-style alert at top)
          const showCopiedMessage = () => {
            let copiedMessage = document.querySelector('.copied-message');
            if (!copiedMessage) {
              copiedMessage = document.createElement('div');
              copiedMessage.className = 'copied-message';
              copiedMessage.textContent = 'Copied!';
              // Bootstrap-style success alert at top
              copiedMessage.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #d4edda;
                color: #155724;
                padding: 12px 20px;
                border: 1px solid #c3e6cb;
                border-radius: 4px;
                display: none;
                z-index: 10000;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                text-align: center;
              `;
              document.body.appendChild(copiedMessage);
            }
            
            copiedMessage.style.display = 'block';
            copiedMessage.style.opacity = '1';
            copiedMessage.style.transform = 'translateX(-50%)';
            
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
              copiedMessage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              copiedMessage.style.opacity = '0';
              copiedMessage.style.transform = 'translateX(-50%) translateY(-10px)';
              setTimeout(() => {
                copiedMessage.style.display = 'none';
                copiedMessage.style.transform = 'translateX(-50%)';
              }, 300);
            }, 3000);
          };
          
          try {
            await navigator.clipboard.writeText(url);
            showCopiedMessage();
          } catch (err) {
            console.error('Failed to copy URL:', err);
            // Fallback: select text and show message
            const textArea = document.createElement('textarea');
            textArea.value = url;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand('copy');
              showCopiedMessage();
            } catch (fallbackErr) {
              console.error('Fallback copy failed:', fallbackErr);
            }
            document.body.removeChild(textArea);
          }
        });
        
        // Insert button AFTER the span (on the right, after Open button if it exists)
        // Check if Open button already exists - if so, insert after it
        const existingOpenButton = customPageIdSpan.parentElement.querySelector('.custom-page-preview-btn');
        if (existingOpenButton) {
          // Insert after the Open button
          if (existingOpenButton.nextSibling) {
            existingOpenButton.parentElement.insertBefore(button, existingOpenButton.nextSibling);
          } else {
            existingOpenButton.parentElement.appendChild(button);
          }
          console.log('Custom Page Copy Link: Button inserted after Open button');
        } else {
          // No Open button, insert after span
          if (customPageIdSpan.nextSibling) {
            customPageIdSpan.parentElement.insertBefore(button, customPageIdSpan.nextSibling);
          } else {
            customPageIdSpan.parentElement.appendChild(button);
          }
          console.log('Custom Page Copy Link: Button inserted after span');
        }
        
        // Mark as added
        this.buttonsAdded.add(row);
        console.log('Custom Page Copy Link: Button added successfully for URL:', url);
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
          this.addCopyButtons();
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
            const customPageIdSpan = row.querySelector('span[id$="lblCustomPageId"]');
            if (customPageIdSpan && !customPageIdSpan.parentElement.querySelector('.custom-page-copy-btn')) {
              hasNewRows = true;
            }
          }
        });
        
        if (hasNewRows) {
          this.addCopyButtons();
        }
      }, 1000); // Check every second
    }

    async cleanup() {
      // Remove all copy buttons
      const buttons = document.querySelectorAll('.custom-page-copy-btn');
      buttons.forEach(btn => btn.remove());
      
      // Remove injected styles
      const style = document.getElementById('custom-page-copy-link-styles');
      if (style) {
        style.remove();
        this.styleInjected = false;
      }
      
      // Reset span widths only if preview link feature is also disabled
      // Check if preview link feature is enabled
      const previewLinkEnabled = await chrome.storage.sync.get(['customPagePreviewLink']).then(result => result.customPagePreviewLink || false);
      if (!previewLinkEnabled) {
        const spans = document.querySelectorAll('span[id$="lblCustomPageId"]');
        spans.forEach(span => {
          span.style.width = '';
          span.style.display = '';
        });
      }
      
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

  window.CustomPageCopyLinkEnhancement = CustomPageCopyLinkEnhancement;
})();

