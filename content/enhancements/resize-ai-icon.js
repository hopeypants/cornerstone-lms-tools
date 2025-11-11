/**
 * Resize AI Icon
 * Allows users to control the size of the Cornerstone Galaxy AI icon and removes margin when enabled
 */

(function() {
  'use strict';

  class ResizeAIIconEnhancement {
    constructor() {
      this.initialized = false;
      this.iconSelector = '.csxGalaxyAIAnnouncement-icon';
      this.svgSelector = '.csxGalaxyAIAnnouncement-icon svg';
    }

    async initialize() {
      if (this.initialized) return;
      this.initialized = true;

      // Load settings
      const { resizeAIIcon, resizeAIIconSize } = await chrome.storage.sync.get([
        'resizeAIIcon',
        'resizeAIIconSize'
      ]);

      if (resizeAIIcon) {
        await this.applyIconSize(resizeAIIconSize || 32);
        // Set up observer to watch for icon appearing if it's not found yet
        this.setupObserver(resizeAIIconSize || 32);
      }

      // Listen for messages
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'GET_AI_ICON_STATUS') {
          // Respond to availability check
          const iconElement = document.querySelector(this.iconSelector);
          sendResponse({ iconFound: iconElement !== null });
          return true; // Indicates we will send a response asynchronously
        } else if (message.type === 'APPLY_AI_ICON_SIZE') {
          this.applyIconSize(message.size);
        } else if (message.type === 'RESET_AI_ICON') {
          this.resetIconSize();
        } else if (message.type === 'SETTING_CHANGED' && message.feature === 'resizeAIIcon') {
          if (message.enabled) {
            chrome.storage.sync.get(['resizeAIIconSize'], (result) => {
              this.applyIconSize(result.resizeAIIconSize || 32);
            });
          } else {
            this.removeIconSize();
          }
        }
      });

      // Listen for storage changes
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync' && areaName !== 'local') {
          return;
        }

        if (changes.resizeAIIcon) {
          if (changes.resizeAIIcon.newValue) {
            chrome.storage.sync.get(['resizeAIIconSize'], (result) => {
              this.applyIconSize(result.resizeAIIconSize || 32);
            });
          } else {
            this.removeIconSize();
          }
        } else if (changes.resizeAIIconSize) {
          chrome.storage.sync.get(['resizeAIIcon'], (result) => {
            if (result.resizeAIIcon) {
              this.applyIconSize(changes.resizeAIIconSize.newValue);
            }
          });
        }
      });
    }

    async applyIconSize(size) {
      // Find the AI icon
      const iconElement = document.querySelector(this.iconSelector);
      const svgElement = document.querySelector(this.svgSelector);

      if (!iconElement || !svgElement) {
        // Icon might not be loaded yet, try again after a delay
        setTimeout(() => this.applyIconSize(size), 100);
        return;
      }

      // Apply size to SVG
      svgElement.setAttribute('width', size);
      svgElement.setAttribute('height', size);
      svgElement.style.width = `${size}px`;
      svgElement.style.height = `${size}px`;

      // Remove margin from icon container
      iconElement.style.margin = '0';
      iconElement.style.marginLeft = '0';
      iconElement.style.marginRight = '0';
      iconElement.style.marginTop = '0';
      iconElement.style.marginBottom = '0';
    }

    async removeIconSize() {
      const iconElement = document.querySelector(this.iconSelector);
      const svgElement = document.querySelector(this.svgSelector);

      if (iconElement && svgElement) {
        // Reset SVG to original size
        svgElement.setAttribute('width', '32');
        svgElement.setAttribute('height', '32');
        svgElement.style.width = '';
        svgElement.style.height = '';

        // Restore original margin
        iconElement.style.margin = '';
        iconElement.style.marginLeft = '';
        iconElement.style.marginRight = '';
        iconElement.style.marginTop = '';
        iconElement.style.marginBottom = '';
      }
    }

    async resetIconSize() {
      const iconElement = document.querySelector(this.iconSelector);
      const svgElement = document.querySelector(this.svgSelector);

      if (iconElement && svgElement) {
        // Reset SVG to default size
        svgElement.setAttribute('width', '32');
        svgElement.setAttribute('height', '32');
        svgElement.style.width = '';
        svgElement.style.height = '';

        // Restore default margin (reset to empty to allow CSS defaults)
        iconElement.style.margin = '';
        iconElement.style.marginLeft = '';
        iconElement.style.marginRight = '';
        iconElement.style.marginTop = '';
        iconElement.style.marginBottom = '';
      }
    }

    setupObserver(size) {
      // If icon already exists, no need to observe
      const iconElement = document.querySelector(this.iconSelector);
      if (iconElement) return;

      // Watch for the icon to appear
      const observer = new MutationObserver(() => {
        const icon = document.querySelector(this.iconSelector);
        if (icon) {
          this.applyIconSize(size);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Disconnect after 10 seconds to avoid memory leaks
      setTimeout(() => observer.disconnect(), 10000);
    }

    async cleanup() {
      await this.removeIconSize();
      this.initialized = false;
    }
  }

  window.ResizeAIIconEnhancement = ResizeAIIconEnhancement;
})();

