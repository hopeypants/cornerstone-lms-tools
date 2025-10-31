/**
 * Learning Object Links Enhancement
 * Adds toggleable quick-access links (Preview, Details, Launch, Register) to Learning Object detail pages
 * Also provides LOID copy functionality
 */

(function() {
  'use strict';

  // UUID pattern: 8-4-4-4-12 hexadecimal characters
  // Format: xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx
  // where x is any hexadecimal digit and y is one of 8, 9, a, or b (variant bits)
  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Cache for LOID element once found
  let cachedLoidElement = null;
  let hasSearchedForLoid = false;
  let loidInitialized = false; // Flag to prevent re-initialization

  // Check if LOID element exists - looks for a span with UUID content
  function getLoidElement() {
    // Return cached element if we've already found it
    if (cachedLoidElement && document.contains(cachedLoidElement)) {
      return cachedLoidElement;
    }
    
    // Clear cache if element is no longer in DOM
    if (cachedLoidElement && !document.contains(cachedLoidElement)) {
      cachedLoidElement = null;
      window.__loLinksLoidFound = false;
      loidInitialized = false; // Allow re-initialization if element removed
    }
    
    // Only search and log once - if already initialized, return cached or null
    if (loidInitialized && cachedLoidElement === null) {
      return null;
    }
    
    // Only log on first search
    if (!hasSearchedForLoid) {
      console.log('LO Links: Checking span elements for UUID');
      hasSearchedForLoid = true;
    }
    
    // Get all span elements and check their text content
    const spans = document.querySelectorAll('span');
    
    for (let span of spans) {
      // Try textContent first (includes hidden text)
      let text = span.textContent ? span.textContent.trim() : '';
      let matches = false;
      
      if (text) {
        matches = UUID_PATTERN.test(text);
      }
      
      // If textContent didn't match, try innerText (visible text only)
      if (!matches && span.innerText) {
        text = span.innerText.trim();
        if (text) {
          matches = UUID_PATTERN.test(text);
        }
      }
      
      // Check if the span's text content is exactly a UUID
      if (text && matches) {
        console.log('LO Links: Found LOID element:', text);
        // Cache the element
        cachedLoidElement = span;
        loidInitialized = true;
        // Store a flag that LOID was found (for popup detection)
        window.__loLinksLoidFound = true;
        window.__loLinksLoidValue = text;
        return span;
      }
    }
    
    return null;
  }

  // Extract LOID from element
  function getLoid() {
    const loidElement = getLoidElement();
    if (!loidElement) return null;
    
    // Try to extract just the UUID from the element's text
    const text = loidElement.textContent || '';
    
    // Search for UUID pattern in the text (in case there's other text)
    const match = text.match(UUID_PATTERN);
    if (match) {
      return match[0];
    }
    
    // Fallback: check trimmed text
    const trimmedText = text.trim();
    if (UUID_PATTERN.test(trimmedText)) {
      return trimmedText;
    }
    
    return null;
  }

  // Find the container for link items
  function findLinkContainer() {
    // Find the span with data-tag="lo_type"
    const loTypeSpan = document.querySelector('span[data-tag="lo_type"]');
    
    if (!loTypeSpan) {
      console.log('LO Links: span[data-tag="lo_type"] not found');
      return null;
    }
    
    // Go up 4 levels from the span to find the container
    let container = loTypeSpan;
    for (let i = 0; i < 4; i++) {
      container = container.parentElement;
      if (!container) {
        console.log('LO Links: Could not traverse up 4 levels');
        return null;
      }
    }
    
    console.log('LO Links: Found container 4 levels up from lo_type span:', container.id || 'no-id', container.className);
    return container;
  }

  // Inject CSS styles
  function injectStyles() {
    const styleId = 'lo-links-enhancement-styles';
    if (document.getElementById(styleId)) return; // Already injected
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #lo-preview i, #lo-details i, #lo-launch i, #lo-register i {
        display: block;
        width: 20px;
        text-align: center;
      }
      .copied-message {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #333;
        color: #fff;
        padding: 5px 10px;
        border-radius: 5px;
        display: none;
        z-index: 10000;
        font-size: 2em;
      }
    `;
    document.head.appendChild(style);
  }

  // Create link HTML
  function createLinkHTML(type, title, label) {
    // Map link types to Font Awesome v3 icon classes (CSOD format: fa-icon-*)
    const iconMap = {
      'preview': 'fa-icon-eye-open',
      'details': 'fa-icon-info-sign',
      'launch': 'fa-icon-play',
      'register': 'fa-icon-plus-sign'
    };
    
    // Fallback to a generic link icon if specific icon not found
    const iconClass = iconMap[type] || 'fa-icon-link';
    
    return `
      <div id="lo-${type}" class="cr-flexcol-xs-6 cr-flexcol-sm-12">
        <div class="cr-flexgrid gt-medium middle-xs">
          <div class="cr-flexcol-xs-auto">
            <i class="${iconClass}" style="font-size: 1.4em; color: #999;"></i>
          </div>
          <div class="cr-flexcol-xs-fill">
            <a id="${type}-link" class="cso-hyper-link cso-text-medium cso-text-bold" title="${title}" target="_blank">${label}</a>
          </div>
        </div>
      </div>
    `;
  }

  // Build URL for link type
  function buildUrl(type, loid) {
    const baseUrl = window.location.origin;
    switch(type) {
      case 'preview':
        return `${baseUrl}/LMS/scorm/LaunchLo.aspx?countIncrement=false&objectId=${loid}`;
      case 'details':
        return `${baseUrl}/DeepLink/ProcessRedirect.aspx?module=lodetails&lo=${loid}`;
      case 'launch':
        return `${baseUrl}/DeepLink/ProcessRedirect.aspx?module=launchtraining&lo=${loid}`;
      case 'register':
        return `${baseUrl}/DeepLink/ProcessRedirect.aspx?module=loRegisterAndLaunch&lo=${loid}`;
      default:
        return '#';
    }
  }

  // Inject link elements
  function injectLinks() {
    const loid = getLoid();
    if (!loid) {
      console.log('LO Links: No LOID found on page');
      return false;
    }

    const container = findLinkContainer();
    if (!container) {
      console.log('LO Links: Container not found');
      console.log('LO Links: Available containers:', document.querySelectorAll('div[class*="cr-flexgrid"]').length);
      return false;
    }

    console.log('LO Links: Found container:', container.id, container.className);

    // Remove existing links if they exist (to allow re-injection)
    ['lo-preview', 'lo-details', 'lo-launch', 'lo-register'].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
    });

    // Create and inject link elements
    const linkTypes = [
      { type: 'preview', title: 'LO preview', label: 'Preview' },
      { type: 'details', title: 'LO details', label: 'Details' },
      { type: 'launch', title: 'Launch', label: 'Launch' },
      { type: 'register', title: 'Register & launch', label: 'Register & Launch' }
    ];

    linkTypes.forEach(({ type, title, label }) => {
      const linkHTML = createLinkHTML(type, title, label);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = linkHTML;
      const linkElement = tempDiv.firstElementChild;
      
      // Set href
      const link = linkElement.querySelector('a');
      link.href = buildUrl(type, loid);
      
      // Append to container
      container.appendChild(linkElement);
    });

    console.log('LO Links: Links injected successfully into container:', container.id);
    
    // Update visibility after injection
    updateLinkVisibility();
    
    return true;
  }

  // Update link visibility based on settings
  async function updateLinkVisibility() {
    const settings = await chrome.storage.sync.get([
      'loShowPreviewLink',
      'loShowDetailsLink',
      'loShowLaunchLink',
      'loShowRegisterLink'
    ]);

    // If links don't exist and any toggle is enabled, inject them first
    const anyEnabled = settings.loShowPreviewLink || settings.loShowDetailsLink || 
                       settings.loShowLaunchLink || settings.loShowRegisterLink;
    
    if (anyEnabled && !document.getElementById('lo-preview')) {
      // Try to inject links
      injectLinks();
      // Wait a moment for links to be added to DOM, then update visibility
      setTimeout(updateLinkVisibility, 100);
      return;
    }

    const linkVisibility = {
      'lo-preview': settings.loShowPreviewLink || false,
      'lo-details': settings.loShowDetailsLink || false,
      'lo-launch': settings.loShowLaunchLink || false,
      'lo-register': settings.loShowRegisterLink || false
    };

    Object.keys(linkVisibility).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        // Use inline style with !important equivalent by setting display directly
        // This overrides the CSS rule
        if (linkVisibility[id]) {
          element.style.display = 'block';
        } else {
          element.style.display = 'none';
        }
      }
    });
  }

  // Setup LOID copy functionality
  async function setupLoidCopy() {
    const settings = await chrome.storage.sync.get(['loCopyLoid']);
    const enabled = settings.loCopyLoid || false;

    const loidElement = getLoidElement();
    if (!loidElement) return;

    // Remove existing handlers by cloning
    const newLoidElement = loidElement.cloneNode(true);
    loidElement.parentNode.replaceChild(newLoidElement, loidElement);

    if (!enabled) {
      // Remove copy cursor and hyperlink class if disabled
      newLoidElement.style.cursor = '';
      newLoidElement.classList.remove('cso-hyper-link');
      return;
    }
    
    // Add hyperlink class when copy functionality is enabled for styling
    newLoidElement.classList.add('cso-hyper-link');

    // Create "Copied!" message element if it doesn't exist
    let copiedMessage = document.querySelector('.copied-message');
    if (!copiedMessage) {
      copiedMessage = document.createElement('div');
      copiedMessage.className = 'copied-message';
      copiedMessage.textContent = 'Copied!';
      document.body.appendChild(copiedMessage);
    }

    // Show copied message
    function showCopiedMessage() {
      copiedMessage.style.display = 'block';
      copiedMessage.style.opacity = '1';
      setTimeout(() => {
        copiedMessage.style.transition = 'opacity 0.2s';
        copiedMessage.style.opacity = '0';
        setTimeout(() => {
          copiedMessage.style.display = 'none';
        }, 200);
      }, 1000);
    }

    // Add click handler and cursor
    newLoidElement.style.cursor = 'pointer';
    
    newLoidElement.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Extract UUID from element text (in case there's other content)
      const text = this.textContent || '';
      const match = text.match(UUID_PATTERN);
      const loid = match ? match[0] : text.trim();
      
      if (!UUID_PATTERN.test(loid)) {
        console.error('LO Links: Invalid LOID format for copying');
        return;
      }
      
      try {
        // Use modern Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(loid);
          showCopiedMessage();
        } else {
          // Fallback to execCommand
          const textArea = document.createElement('textarea');
          textArea.value = loid;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          
          try {
            document.execCommand('copy');
            showCopiedMessage();
          } catch (err) {
            console.error('Failed to copy LOID:', err);
          }
          
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error('Error copying LOID:', err);
      }
    });

    // Handle copy event (for execCommand fallback)
    newLoidElement.addEventListener('copy', function(e) {
      e.preventDefault();
      if (e.clipboardData) {
        const text = this.textContent || '';
        const match = text.match(UUID_PATTERN);
        const loid = match ? match[0] : text.trim();
        e.clipboardData.setData('text/plain', loid);
      }
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle GET_LOID_STATUS request from popup
    if (message.type === 'GET_LOID_STATUS') {
      const loidFound = window.__loLinksLoidFound === true || getLoidElement() !== null;
      sendResponse({ loidFound: loidFound });
      return true; // Keep message channel open for async response
    }
    
    if (message.type === 'SETTING_CHANGED') {
      const feature = message.feature;
      
      // Only process LO link features if on a valid page
      if (!isValidPage()) {
        return;
      }
      
      if (feature.startsWith('loShow') || feature === 'loCopyLoid') {
        if (feature.startsWith('loShow')) {
          updateLinkVisibility();
        } else if (feature === 'loCopyLoid') {
          setupLoidCopy();
        }
      }
    }
  });

  // Listen for storage changes (settings changed in another tab or on initialization)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      // Only process if on a valid page
      if (!isValidPage()) {
        return;
      }
      
      // Check if any LO link settings changed
      const loFeatures = ['loShowPreviewLink', 'loShowDetailsLink', 'loShowLaunchLink', 'loShowRegisterLink', 'loCopyLoid'];
      
      for (const feature of loFeatures) {
        if (changes[feature]) {
          if (feature === 'loCopyLoid') {
            setupLoidCopy();
          } else {
            updateLinkVisibility();
            break; // Only need to call once for link visibility
          }
        }
      }
    }
  });

  // Check if current page URL contains "Learning/CourseConsole"
  function isValidPage() {
    const url = window.location.href || window.location.pathname;
    return url.includes('Learning/CourseConsole');
  }

  // Initialize on page load
  function init() {
    // Check if this is a valid page for LO links
    if (!isValidPage()) {
      console.log('LO Links: Not on a Learning/CourseConsole page, skipping initialization');
      return;
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Check if LOID element exists
    if (!getLoidElement()) {
      console.log('LO Links: LOID element not found yet, setting up observer...');
      setupLoidObserver();
      return;
    }

    // Inject styles
    injectStyles();

    // Inject links
    injectLinks();

    // Update visibility based on settings
    updateLinkVisibility();

    // Setup LOID copy
    setupLoidCopy();
  }

  // Setup MutationObserver to watch for LOID element to appear
  function setupLoidObserver() {
    // Check immediately every 500ms for up to 20 seconds (40 checks)
    let checkCount = 0;
    const maxChecks = 40;
    const checkInterval = setInterval(() => {
      checkCount++;
      
      // Only check if on a valid page
      if (!isValidPage()) {
        clearInterval(checkInterval);
        return;
      }
      
      if (getLoidElement()) {
        console.log('LO Links: LOID element found, initializing...');
        clearInterval(checkInterval);
        
        // Inject styles
        injectStyles();

        // Inject links
        injectLinks();

        // Update visibility based on settings
        updateLinkVisibility();

        // Setup LOID copy
        setupLoidCopy();
      } else if (checkCount >= maxChecks) {
        console.log('LO Links: LOID element not found after maximum retries');
        clearInterval(checkInterval);
      }
    }, 500);

    // Also use MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations, obs) => {
      // Only check if on a valid page
      if (!isValidPage()) {
        obs.disconnect();
        return;
      }
      
      if (getLoidElement()) {
        console.log('LO Links: LOID element detected via MutationObserver');
        obs.disconnect();
        clearInterval(checkInterval);
        
        // Inject styles
        injectStyles();

        // Inject links
        injectLinks();

        // Update visibility based on settings
        updateLinkVisibility();

        // Setup LOID copy
        setupLoidCopy();
      }
    });

    // Observe the entire document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start initialization
  init();

})();

