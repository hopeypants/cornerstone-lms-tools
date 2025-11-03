/**
 * Resize Custom Pages Container
 * Allows changing the width of the Custom Pages form container
 */

(function() {
  'use strict';

  let isEnabled = false;
  let containerWidth = 55;

  /**
   * Check if URL contains admin/ManageCustomPages
   */
  function isCustomPagesUrl() {
    return window.location.href.includes('admin/ManageCustomPages');
  }

  /**
   * Get the first form element that is a direct child of body
   */
  function getFirstBodyForm() {
    // Get all direct children of body and find the first form element
    const bodyChildren = Array.from(document.body.children);
    return bodyChildren.find(el => el.tagName === 'FORM') || null;
  }

  /**
   * Apply body margin (always applied on Custom Pages URL)
   */
  function applyBodyMargin() {
    if (!isCustomPagesUrl()) {
      return;
    }
    
    if (document.body) {
      document.body.style.margin = 'auto 8px';
    }
  }

  /**
   * Apply width to the form container
   */
  function applyWidth() {
    // Check if URL contains admin/ManageCustomPages
    if (!isCustomPagesUrl()) {
      return;
    }

    // Always apply body margin
    applyBodyMargin();

    if (!isEnabled) {
      // When disabled, just remove form styling (body margin is already applied)
      removeWidth();
      return;
    }

    // When enabled, apply form styling (body margin is already applied)
    const form = getFirstBodyForm();
    if (!form) {
      return;
    }

    // Apply width
    form.style.width = `${containerWidth}vw`;
    form.style.margin = 'auto';
  }

  /**
   * Remove width styling
   */
  function removeWidth() {
    // Find the first form that is a direct child of body
    const form = getFirstBodyForm();
    if (!form) {
      return;
    }

    form.style.width = '';
    form.style.margin = '';
  }

  /**
   * Initialize the enhancement
   */
  async function init() {
    // Load settings
    const storedSettings = await chrome.storage.sync.get([
      'resizeCustomPagesContainer',
      'customPagesContainerWidth'
    ]);

    isEnabled = storedSettings.resizeCustomPagesContainer || false;
    containerWidth = storedSettings.customPagesContainerWidth || 55;

    // Always apply based on enabled state
    applyWidth();

    // Watch for DOM changes (in case form loads dynamically)
    const observer = new MutationObserver(() => {
      applyWidth();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Also check periodically as a fallback
    const checkInterval = setInterval(() => {
      applyWidth();
    }, 1000);

    // Clean up interval when page unloads
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
      observer.disconnect();
    });
  }

  /**
   * Handle storage changes
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      if (changes.resizeCustomPagesContainer) {
        isEnabled = changes.resizeCustomPagesContainer.newValue || false;
        applyWidth();
      }

      if (changes.customPagesContainerWidth) {
        containerWidth = changes.customPagesContainerWidth.newValue || 55;
        if (isEnabled) {
          applyWidth();
        }
      }
    }
  });

  /**
   * Handle messages from popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SETTING_CHANGED' && message.feature === 'resizeCustomPagesContainer') {
      isEnabled = message.enabled !== undefined ? message.enabled : false;
      applyWidth();
    } else if (message.type === 'SETTING_CHANGED' && message.feature === 'customPagesContainerWidth') {
      containerWidth = message.value !== undefined ? message.value : 55;
      if (isEnabled) {
        applyWidth();
      }
    }
  });

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

