/**
 * Highlight Transcript Statuses
 * Highlights transcript list items based on status text in spans
 */

(function() {
  'use strict';

  let isEnabled = false;
  let settings = {
    pastDue: { enabled: true, color: '#ff0000', opacity: 10 },
    inProgress: { enabled: true, color: '#0066cc', opacity: 10 },
    pending: { enabled: true, color: '#ffaa00', opacity: 10 },
    registered: { enabled: true, color: '#9333ea', opacity: 10 },
    completed: { enabled: true, color: '#00aa00', opacity: 10 },
    inactive: { enabled: true, color: '#888888', opacity: 10 },
    withdrawn: { enabled: true, color: '#6b7280', opacity: 10 },
    cancelled: { enabled: true, color: '#000000', opacity: 10 },
    denied: { enabled: true, color: '#dc2626', opacity: 10 }
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
      case 'pastDue':
        return trimmedText.toLowerCase().includes('past due');
      case 'inProgress':
        return trimmedText === 'In Progress';
      case 'pending':
        return trimmedText.toLowerCase().includes('pending');
      case 'registered':
        return trimmedText === 'Registered';
      case 'completed':
        return trimmedText === 'Completed';
      case 'inactive':
        return trimmedText === 'Inactive';
      case 'withdrawn':
        return trimmedText === 'Withdrawn';
      case 'cancelled':
        return trimmedText === 'Cancelled' || trimmedText === 'Canceled';
      case 'denied':
        return trimmedText === 'Denied';
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
    
    // Also highlight .cso-statusline children with opacity + 40%
    const statusLines = li.querySelectorAll('.cso-statusline');
    const statusLineOpacity = Math.min(100, opacity + 40); // Cap at 100%
    const statusLineRgba = hexToRgba(color, statusLineOpacity);
    statusLines.forEach(statusLine => {
      statusLine.style.backgroundColor = statusLineRgba;
    });
  }

  /**
   * Process all spans on the page
   */
  function processSpans() {
    // Only run on transcript pages
    if (!window.location.href.includes('UniversalProfile/Transcript')) {
      return;
    }
    
    if (!isEnabled) return;

    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
      // Check each status type in the specified order
      for (const statusType of ['registered', 'inProgress', 'completed', 'pastDue', 'pending', 'inactive', 'withdrawn', 'cancelled', 'denied']) {
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
      // Also remove highlighting from .cso-statusline children
      const statusLines = li.querySelectorAll('.cso-statusline');
      statusLines.forEach(statusLine => {
        if (statusLine.style.backgroundColor) {
          statusLine.style.backgroundColor = '';
        }
      });
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
          // Also remove highlighting from .cso-statusline children
          const statusLines = li.querySelectorAll('.cso-statusline');
          statusLines.forEach(statusLine => {
            if (statusLine.style.backgroundColor) {
              statusLine.style.backgroundColor = '';
            }
          });
        }
      }
    });
  }

  /**
   * Initialize the feature
   */
  async function init() {
    // Only run on transcript pages
    if (!window.location.href.includes('UniversalProfile/Transcript')) {
      return;
    }
    
    // Load settings
    const storedSettings = await chrome.storage.sync.get([
      'highlightTranscriptStatuses',
      'transcriptPastDueEnabled',
      'transcriptPastDueColor',
      'transcriptPastDueOpacity',
      'transcriptInProgressEnabled',
      'transcriptInProgressColor',
      'transcriptInProgressOpacity',
      'transcriptPendingEnabled',
      'transcriptPendingColor',
      'transcriptPendingOpacity',
      'transcriptRegisteredEnabled',
      'transcriptRegisteredColor',
      'transcriptRegisteredOpacity',
      'transcriptCompletedEnabled',
      'transcriptCompletedColor',
      'transcriptCompletedOpacity',
      'transcriptInactiveEnabled',
      'transcriptInactiveColor',
      'transcriptInactiveOpacity',
      'transcriptWithdrawnEnabled',
      'transcriptWithdrawnColor',
      'transcriptWithdrawnOpacity',
      'transcriptCancelledEnabled',
      'transcriptCancelledColor',
      'transcriptCancelledOpacity',
      'transcriptDeniedEnabled',
      'transcriptDeniedColor',
      'transcriptDeniedOpacity'
    ]);

    isEnabled = storedSettings.highlightTranscriptStatuses || false;

    // Update settings from storage (in specified order)
    const statusConfig = {
      registered: { enabledKey: 'transcriptRegisteredEnabled', colorKey: 'transcriptRegisteredColor', opacityKey: 'transcriptRegisteredOpacity' },
      inProgress: { enabledKey: 'transcriptInProgressEnabled', colorKey: 'transcriptInProgressColor', opacityKey: 'transcriptInProgressOpacity' },
      completed: { enabledKey: 'transcriptCompletedEnabled', colorKey: 'transcriptCompletedColor', opacityKey: 'transcriptCompletedOpacity' },
      pastDue: { enabledKey: 'transcriptPastDueEnabled', colorKey: 'transcriptPastDueColor', opacityKey: 'transcriptPastDueOpacity' },
      pending: { enabledKey: 'transcriptPendingEnabled', colorKey: 'transcriptPendingColor', opacityKey: 'transcriptPendingOpacity' },
      inactive: { enabledKey: 'transcriptInactiveEnabled', colorKey: 'transcriptInactiveColor', opacityKey: 'transcriptInactiveOpacity' },
      withdrawn: { enabledKey: 'transcriptWithdrawnEnabled', colorKey: 'transcriptWithdrawnColor', opacityKey: 'transcriptWithdrawnOpacity' },
      cancelled: { enabledKey: 'transcriptCancelledEnabled', colorKey: 'transcriptCancelledColor', opacityKey: 'transcriptCancelledOpacity' },
      denied: { enabledKey: 'transcriptDeniedEnabled', colorKey: 'transcriptDeniedColor', opacityKey: 'transcriptDeniedOpacity' }
    };

    Object.keys(statusConfig).forEach(statusType => {
      const { enabledKey, colorKey, opacityKey } = statusConfig[statusType];
      if (storedSettings[enabledKey] !== undefined) {
        settings[statusType].enabled = storedSettings[enabledKey];
      }
      if (storedSettings[colorKey]) {
        settings[statusType].color = storedSettings[colorKey];
      }
      if (storedSettings[opacityKey] !== undefined) {
        settings[statusType].opacity = storedSettings[opacityKey];
      }
    });

    if (isEnabled) {
      // Remove all highlighting first, then re-apply based on current enabled states
      removeHighlighting();
      processSpans();
    } else {
      removeHighlighting();
    }
  }

  /**
   * Handle messages from popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Only handle messages on transcript pages
    if (!window.location.href.includes('UniversalProfile/Transcript')) {
      return;
    }
    
    if (message.type === 'SETTING_CHANGED' && message.feature === 'highlightTranscriptStatuses') {
      isEnabled = message.enabled;
      if (isEnabled) {
        processSpans();
      } else {
        removeHighlighting();
      }
    } else if (message.type === 'SETTING_CHANGED' && message.feature === 'transcriptSettingsChanged') {
      init(); // Reload settings and re-process
    }
  });

  /**
   * Handle storage changes
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    // Only handle storage changes on transcript pages
    if (!window.location.href.includes('UniversalProfile/Transcript')) {
      return;
    }
    
    if (areaName === 'sync') {
      let shouldUpdate = false;

      if (changes.highlightTranscriptStatuses) {
        isEnabled = changes.highlightTranscriptStatuses.newValue || false;
        shouldUpdate = true;
      }

      // Check for transcript setting changes
      const transcriptKeys = [
        'transcriptPastDueEnabled', 'transcriptPastDueColor', 'transcriptPastDueOpacity',
        'transcriptInProgressEnabled', 'transcriptInProgressColor', 'transcriptInProgressOpacity',
        'transcriptPendingEnabled', 'transcriptPendingColor', 'transcriptPendingOpacity',
        'transcriptRegisteredEnabled', 'transcriptRegisteredColor', 'transcriptRegisteredOpacity',
        'transcriptCompletedEnabled', 'transcriptCompletedColor', 'transcriptCompletedOpacity',
        'transcriptInactiveEnabled', 'transcriptInactiveColor', 'transcriptInactiveOpacity',
        'transcriptWithdrawnEnabled', 'transcriptWithdrawnColor', 'transcriptWithdrawnOpacity',
        'transcriptCancelledEnabled', 'transcriptCancelledColor', 'transcriptCancelledOpacity',
        'transcriptDeniedEnabled', 'transcriptDeniedColor', 'transcriptDeniedOpacity'
      ];

      for (const key of transcriptKeys) {
        if (changes[key]) {
          shouldUpdate = true;
          break;
        }
      }

      if (shouldUpdate) {
        init(); // Reload settings and re-process
      }
    }
  });

  /**
   * Watch for DOM changes
   */
  const observer = new MutationObserver(() => {
    // Only observe on transcript pages
    if (!window.location.href.includes('UniversalProfile/Transcript')) {
      return;
    }
    
    if (isEnabled) {
      processSpans();
    }
  });

  // Start observing (only on transcript pages)
  if (window.location.href.includes('UniversalProfile/Transcript')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        init();
        observer.observe(document.body, { childList: true, subtree: true });
      });
    } else {
      init();
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
})();

