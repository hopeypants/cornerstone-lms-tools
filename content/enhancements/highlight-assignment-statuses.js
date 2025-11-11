/**
 * Highlight Assignment Statuses
 * Highlights assignment list items based on status text in spans
 */

(function() {
  'use strict';

  let isEnabled = false;
  let settings = {
    active: { enabled: true, color: '#0066cc', opacity: 10 },
    queued: { enabled: true, color: '#ffaa00', opacity: 10 },
    processed: { enabled: true, color: '#00aa00', opacity: 10 },
    cancelled: { enabled: true, color: '#000000', opacity: 10 },
    inactive: { enabled: true, color: '#888888', opacity: 10 },
    drafts: { enabled: true, color: '#6b7280', opacity: 10 }
  };

  /**
   * Find the closest li element from a given element
   */
  function findClosestLi(element) {
    let current = element;
    while (current && current !== document.body) {
      if (current.tagName === 'LI') {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  /**
   * Convert hex color to rgba
   */
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  /**
   * Check if a span matches a status pattern
   */
  function matchesStatus(span, statusType) {
    const text = span.textContent || span.innerText || '';
    const trimmedText = text.trim();

    switch (statusType) {
      case 'processed':
        return trimmedText === 'Processed';
      case 'queued':
        return trimmedText === 'Queued';
      case 'cancelled':
        return trimmedText === 'Cancelled' || trimmedText === 'Canceled';
      case 'active':
        return trimmedText === 'Active';
      case 'inactive':
        return trimmedText === 'Inactive';
      case 'drafts':
        // Partial match - looks for "Draft" or "Drafts" (case-insensitive)
        return trimmedText.toLowerCase().includes('draft');
      default:
        return false;
    }
  }

  /**
   * Apply highlighting to a list item
   */
  function highlightListItem(li, statusType) {
    if (!li || !settings[statusType] || !settings[statusType].enabled) return;

    const { color, opacity } = settings[statusType];
    const rgba = hexToRgba(color, opacity);
    li.style.backgroundColor = rgba;
  }

  /**
   * Process all spans on the page
   */
  function processSpans() {
    // Only run on assignment management pages
    if (!window.location.href.includes('EnrollTraining/EnrollTrainingManagement')) {
      return;
    }
    
    if (!isEnabled) return;

    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
      // Check each status type in the specified order
      for (const statusType of ['active', 'queued', 'processed', 'cancelled', 'inactive', 'drafts']) {
        if (matchesStatus(span, statusType)) {
          const li = findClosestLi(span);
          if (li) {
            highlightListItem(li, statusType);
          }
          break; // Only apply one status per span
        }
      }
    });
  }

  /**
   * Remove all highlighting
   */
  function removeHighlighting() {
    const lis = document.querySelectorAll('li');
    lis.forEach(li => {
      if (li.style.backgroundColor) {
        li.style.backgroundColor = '';
      }
    });
  }

  /**
   * Remove highlighting for a specific status
   */
  function removeHighlightingForStatus(statusType) {
    if (!isEnabled) return;

    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
      if (matchesStatus(span, statusType)) {
        const li = findClosestLi(span);
        if (li) {
          if (li.style.backgroundColor) {
            li.style.backgroundColor = '';
          }
        }
      }
    });
  }

  /**
   * Initialize the enhancement
   */
  function init() {
    // Only run on assignment management pages
    if (!window.location.href.includes('EnrollTraining/EnrollTrainingManagement')) {
      return;
    }
    
    // Load settings from storage
    chrome.storage.sync.get([
      'highlightAssignmentStatuses',
      'assignmentActiveEnabled', 'assignmentActiveColor', 'assignmentActiveOpacity',
      'assignmentQueuedEnabled', 'assignmentQueuedColor', 'assignmentQueuedOpacity',
      'assignmentProcessedEnabled', 'assignmentProcessedColor', 'assignmentProcessedOpacity',
      'assignmentCancelledEnabled', 'assignmentCancelledColor', 'assignmentCancelledOpacity',
      'assignmentInactiveEnabled', 'assignmentInactiveColor', 'assignmentInactiveOpacity',
      'assignmentDraftsEnabled', 'assignmentDraftsColor', 'assignmentDraftsOpacity'
    ], (result) => {
      isEnabled = result.highlightAssignmentStatuses || false;

      // Update settings object
      const statusConfig = {
        active: {
          enabled: result.assignmentActiveEnabled !== undefined ? result.assignmentActiveEnabled : true,
          color: result.assignmentActiveColor || '#0066cc',
          opacity: result.assignmentActiveOpacity !== undefined ? result.assignmentActiveOpacity : 10
        },
        queued: {
          enabled: result.assignmentQueuedEnabled !== undefined ? result.assignmentQueuedEnabled : true,
          color: result.assignmentQueuedColor || '#ffaa00',
          opacity: result.assignmentQueuedOpacity !== undefined ? result.assignmentQueuedOpacity : 10
        },
        processed: {
          enabled: result.assignmentProcessedEnabled !== undefined ? result.assignmentProcessedEnabled : true,
          color: result.assignmentProcessedColor || '#00aa00',
          opacity: result.assignmentProcessedOpacity !== undefined ? result.assignmentProcessedOpacity : 10
        },
        cancelled: {
          enabled: result.assignmentCancelledEnabled !== undefined ? result.assignmentCancelledEnabled : true,
          color: result.assignmentCancelledColor || '#000000',
          opacity: result.assignmentCancelledOpacity !== undefined ? result.assignmentCancelledOpacity : 10
        },
        inactive: {
          enabled: result.assignmentInactiveEnabled !== undefined ? result.assignmentInactiveEnabled : true,
          color: result.assignmentInactiveColor || '#888888',
          opacity: result.assignmentInactiveOpacity !== undefined ? result.assignmentInactiveOpacity : 10
        },
        drafts: {
          enabled: result.assignmentDraftsEnabled !== undefined ? result.assignmentDraftsEnabled : true,
          color: result.assignmentDraftsColor || '#6b7280',
          opacity: result.assignmentDraftsOpacity !== undefined ? result.assignmentDraftsOpacity : 10
        }
      };

      settings = statusConfig;

      if (isEnabled) {
        // Wait a bit for DOM to be ready, then process
        setTimeout(() => {
          processSpans();
        }, 100);
        
        // Also process new content when it's added dynamically
        const observer = new MutationObserver(() => {
          // Only observe on assignment management pages
          if (!window.location.href.includes('EnrollTraining/EnrollTrainingManagement')) {
            return;
          }
          
          processSpans();
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        removeHighlighting();
      }
    });
  }

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    // Only handle storage changes on assignment management pages
    if (!window.location.href.includes('EnrollTraining/EnrollTrainingManagement')) {
      return;
    }
    
    if (areaName !== 'sync' && areaName !== 'local') {
      return;
    }

    if (changes.assignmentSettingsChanged || changes.assignmentActiveEnabled || changes.assignmentActiveColor || changes.assignmentActiveOpacity ||
        changes.assignmentQueuedEnabled || changes.assignmentQueuedColor || changes.assignmentQueuedOpacity ||
        changes.assignmentProcessedEnabled || changes.assignmentProcessedColor || changes.assignmentProcessedOpacity ||
        changes.assignmentCancelledEnabled || changes.assignmentCancelledColor || changes.assignmentCancelledOpacity ||
        changes.assignmentInactiveEnabled || changes.assignmentInactiveColor || changes.assignmentInactiveOpacity ||
        changes.assignmentDraftsEnabled || changes.assignmentDraftsColor || changes.assignmentDraftsOpacity) {
      init();
    }
  });

  // Listen for messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Only handle messages on assignment management pages
    if (!window.location.href.includes('EnrollTraining/EnrollTrainingManagement')) {
      return;
    }
    
    if (message.type === 'SETTING_CHANGED' && message.feature === 'highlightAssignmentStatuses') {
      init();
    } else if (message.feature === 'assignmentSettingsChanged') {
      init();
    }
  });

  // Initialize on page load (only on assignment management pages)
  if (window.location.href.includes('EnrollTraining/EnrollTrainingManagement')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})();

