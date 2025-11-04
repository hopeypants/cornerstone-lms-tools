/**
 * Content Script Coordinator for Cornerstone LMS Admin Tools
 * Manages initialization and coordination of all enhancements
 */

/**
 * Shared Font Awesome Utility
 * Provides centralized Font Awesome loading for all enhancements
 */
window.FontAwesomeUtil = {
  loaded: false,
  version: null, // 'fa3', 'fa6', or 'none'
  loadPromise: null,
  
  /**
   * Load Font Awesome library (loads once, returns cached promise on subsequent calls)
   * @returns {Promise<string>} The version loaded ('fa3', 'fa6', or 'none')
   */
  async load() {
    // Return cached promise if already loading or loaded
    if (this.loadPromise) {
      return this.loadPromise;
    }
    
    this.loadPromise = this._loadFontAwesome();
    return this.loadPromise;
  },
  
  /**
   * Internal method to detect and load Font Awesome
   * @private
   */
  async _loadFontAwesome() {
    // Check if CSOD's Font Awesome 3.2.1 is already loaded
    const fa3Loaded = document.querySelector('link[href*="fontawesome"]') || 
                      document.querySelector('[class*="fa-icon-"]');
    
    if (fa3Loaded) {
      console.log('Font Awesome Util: Using CSOD\'s Font Awesome 3.2.1');
      this.loaded = true;
      this.version = 'fa3';
      return 'fa3';
    }

    // Fallback: Load Font Awesome 6 if FA3 isn't available
    console.log('Font Awesome Util: Loading Font Awesome 6 as fallback...');
    
    return new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
      link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
      link.crossOrigin = 'anonymous';
      link.referrerPolicy = 'no-referrer';
      
      // Wait for stylesheet to load
      link.onload = () => {
        this.loaded = true;
        this.version = 'fa6';
        console.log('Font Awesome Util: Font Awesome 6 loaded successfully');
        resolve('fa6');
      };
      
      link.onerror = () => {
        console.error('Font Awesome Util: Failed to load Font Awesome 6');
        this.version = 'none';
        resolve('none');
      };
      
      // Add to head
      document.head.appendChild(link);
    });
  },
  
  /**
   * Get the appropriate icon class for a given icon name
   * @param {string} iconName - Generic icon name (e.g., 'signout', 'power-off')
   * @returns {string} The appropriate class for the loaded FA version
   */
  getIconClass(iconName) {
    const iconMap = {
      'signout': {
        fa3: 'fa-icon-signout',
        fa6: 'fa-solid fa-right-from-bracket',
        none: '→'
      },
      'power-off': {
        fa3: 'fa-icon-power-off',
        fa6: 'fa-solid fa-power-off',
        none: '⏻'
      },
      'settings': {
        fa3: 'fa-icon-cog',
        fa6: 'fa-solid fa-gear',
        none: '⚙'
      },
      'user': {
        fa3: 'fa-icon-user',
        fa6: 'fa-solid fa-user',
        none: '👤'
      }
    };
    
    const icon = iconMap[iconName];
    if (!icon) {
      console.warn(`Font Awesome Util: Unknown icon name "${iconName}"`);
      return this.version === 'fa3' ? 'fa-icon-question' : 
             this.version === 'fa6' ? 'fa-solid fa-question' : '?';
    }
    
    return icon[this.version] || icon.none;
  }
};

// Registry of all available enhancements
const ENHANCEMENTS = {
  headerLogoutLink: window.HeaderLogoutLinkEnhancement,
  customHeaderLinks: window.CustomHeaderLinksEnhancement,
  ...(window.ResizeAIIconEnhancement && { resizeAIIcon: window.ResizeAIIconEnhancement }),
  ...(window.ResizePinnedLinksIconEnhancement && { resizePinnedLinksIcon: window.ResizePinnedLinksIconEnhancement }),
  ...(window.ProxyAsUserEnhancement && { proxyDefaultText: window.ProxyAsUserEnhancement }),
  ...(window.ProxyAsUserEnhancement && { proxyAutoClickLogin: window.ProxyAsUserEnhancement }),
  ...(window.CustomPagePreviewLinkEnhancement && { customPagePreviewLink: window.CustomPagePreviewLinkEnhancement }),
  ...(window.CustomPageCopyLinkEnhancement && { customPageCopyLink: window.CustomPageCopyLinkEnhancement }),
  // Only include enhancements that are loaded on this page
  ...(window.ToggleTentativeColumnEnhancement && { toggleTentativeColumn: window.ToggleTentativeColumnEnhancement }),
  ...(window.HighlightZeroSessionsEnhancement && { highlightZeroSessions: window.HighlightZeroSessionsEnhancement }),
  ...(window.HighlightFullSessionsEnhancement && { highlightFullSessions: window.HighlightFullSessionsEnhancement }),
  ...(window.CenterNumberColumnsEnhancement && { centerNumberColumns: window.CenterNumberColumnsEnhancement }),
  ...(window.FormatSessionDatesEnhancement && { formatSessionDates: window.FormatSessionDatesEnhancement }),
  ...(window.HighlightZeroEnrollmentsEnhancement && { highlightZeroEnrollments: window.HighlightZeroEnrollmentsEnhancement }),
  ...(window.CenterEnrollmentColumnEnhancement && { centerEnrollmentColumn: window.CenterEnrollmentColumnEnhancement }),
  ...(window.SessionsCheckboxDefaultsEnhancement && { sessionsCheckboxDefaults: window.SessionsCheckboxDefaultsEnhancement }),
  ...(window.UserStatusDropdownDefaultsEnhancement && { userStatusDropdownDefaults: window.UserStatusDropdownDefaultsEnhancement }),
  ...(window.UserOuTypeDropdownDefaultsEnhancement && { userOuTypeDropdownDefaults: window.UserOuTypeDropdownDefaultsEnhancement }),
  ...(window.UserCountryDropdownDefaultsEnhancement && { userCountryDropdownDefaults: window.UserCountryDropdownDefaultsEnhancement }),
};

// Debug: Log what enhancements are available
console.log('Content Script Coordinator: Available enhancements:', Object.keys(ENHANCEMENTS));
console.log('Content Script Coordinator: Current URL:', window.location.href);

// Store active enhancement instances
const activeEnhancements = {};

/**
 * Helper function to safely access chrome APIs (handles extension context invalidated errors)
 * @param {Function} fn - Function that uses chrome APIs
 * @returns {Promise<any>} Result of the function or null if context is invalidated
 */
async function safeChromeCall(fn) {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.runtime) {
      return null;
    }
    return await fn();
  } catch (error) {
    if (error.message && error.message.includes('Extension context invalidated')) {
      // Extension was reloaded, ignore this error
      console.log('Content Script: Extension context invalidated, ignoring API call');
      return null;
    }
    throw error;
  }
}

/**
 * Update ENHANCEMENTS registry with newly loaded enhancements
 */
function updateEnhancementsRegistry() {
  Object.assign(ENHANCEMENTS, {
    customHeaderLinks: window.CustomHeaderLinksEnhancement,
    ...(window.CustomPagePreviewLinkEnhancement && { customPagePreviewLink: window.CustomPagePreviewLinkEnhancement }),
    ...(window.CustomPageCopyLinkEnhancement && { customPageCopyLink: window.CustomPageCopyLinkEnhancement }),
    ...(window.ToggleTentativeColumnEnhancement && { toggleTentativeColumn: window.ToggleTentativeColumnEnhancement }),
    ...(window.HighlightZeroSessionsEnhancement && { highlightZeroSessions: window.HighlightZeroSessionsEnhancement }),
    ...(window.HighlightFullSessionsEnhancement && { highlightFullSessions: window.HighlightFullSessionsEnhancement }),
    ...(window.CenterNumberColumnsEnhancement && { centerNumberColumns: window.CenterNumberColumnsEnhancement }),
    ...(window.FormatSessionDatesEnhancement && { formatSessionDates: window.FormatSessionDatesEnhancement }),
    ...(window.HighlightZeroEnrollmentsEnhancement && { highlightZeroEnrollments: window.HighlightZeroEnrollmentsEnhancement }),
    ...(window.CenterEnrollmentColumnEnhancement && { centerEnrollmentColumn: window.CenterEnrollmentColumnEnhancement }),
    ...(window.SessionsCheckboxDefaultsEnhancement && { sessionsCheckboxDefaults: window.SessionsCheckboxDefaultsEnhancement }),
    ...(window.UserStatusDropdownDefaultsEnhancement && { userStatusDropdownDefaults: window.UserStatusDropdownDefaultsEnhancement }),
    ...(window.UserOuTypeDropdownDefaultsEnhancement && { userOuTypeDropdownDefaults: window.UserOuTypeDropdownDefaultsEnhancement }),
    ...(window.UserCountryDropdownDefaultsEnhancement && { userCountryDropdownDefaults: window.UserCountryDropdownDefaultsEnhancement }),
  });
  console.log('Content Script Coordinator: Updated enhancements:', Object.keys(ENHANCEMENTS));
}

/**
 * Initialize the extension when page loads
 */
(async function initialize() {
  console.log('Cornerstone LMS Admin Tools: Initializing...');
  
  // Wait a bit for enhancement scripts to load
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Update registry with any newly loaded enhancements
  updateEnhancementsRegistry();
  
  // Load settings and initialize enabled enhancements
  const settings = await loadSettings();
  await initializeEnhancements(settings);
  
  // Load and apply header padding
  const paddingResult = await safeChromeCall(async () => {
    return await chrome.storage.sync.get(['headerPadding']);
  }) || {};
  
  if (paddingResult.headerPadding !== undefined && paddingResult.headerPadding !== null) {
    applyHeaderPadding(paddingResult.headerPadding);
  }
  
  // Listen for setting changes from popup
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleMessage);
    }
  } catch (error) {
    if (error.message && !error.message.includes('Extension context invalidated')) {
      console.error('Error setting up message listener:', error);
    }
  }
  
  console.log('Cornerstone LMS Admin Tools: Ready');
})();

/**
 * Load settings from Chrome storage
 * @returns {Promise<Object>} Settings object
 */
async function loadSettings() {
  try {
    const settings = await safeChromeCall(async () => {
      return await chrome.storage.sync.get(Object.keys(ENHANCEMENTS));
    }) || {};
    
    // Special handling for customHeaderLinks - check the separate storage key
    const customLinksEnabled = await safeChromeCall(async () => {
      return await chrome.storage.sync.get(['customHeaderLinksEnabled']);
    }) || {};
    
    if (customLinksEnabled.customHeaderLinksEnabled !== undefined) {
      settings.customHeaderLinks = customLinksEnabled.customHeaderLinksEnabled;
      console.log('Content Script: Loaded customHeaderLinksEnabled:', customLinksEnabled.customHeaderLinksEnabled);
    }
    
    console.log('Content Script: Final settings:', settings);
    return settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    return {};
  }
}

/**
 * Initialize all enabled enhancements
 * @param {Object} settings - Settings object with feature flags
 */
async function initializeEnhancements(settings) {
  for (const [featureName, EnhancementClass] of Object.entries(ENHANCEMENTS)) {
    if (settings[featureName] && EnhancementClass) {
      await enableEnhancement(featureName, EnhancementClass);
    }
  }
  
  // Special case: Handle customHeaderLinks initialization
  // Check the explicit toggle state (not just settings.customHeaderLinks which might be derived)
  const customLinksEnabledState = await safeChromeCall(async () => {
    return await chrome.storage.sync.get(['customHeaderLinksEnabled']);
  }) || {};
  const toggleState = customLinksEnabledState.customHeaderLinksEnabled;
  
  if (toggleState === false) {
    // Explicitly disabled - make sure enhancement is not active
    if (activeEnhancements.customHeaderLinks) {
      console.log('Content Script: customHeaderLinks is explicitly disabled, disabling enhancement');
      await disableEnhancement('customHeaderLinks');
    }
  } else if (settings.customHeaderLinks === true || toggleState === true) {
    // Explicitly enabled - ensure it's active (this should already be handled above, but double-check)
    if (!activeEnhancements.customHeaderLinks) {
      const EnhancementClass = ENHANCEMENTS.customHeaderLinks;
      if (EnhancementClass) {
        await enableEnhancement('customHeaderLinks', EnhancementClass);
      }
    }
  } else if (toggleState === undefined) {
    // Toggle state not set - auto-enable if links exist
    const customLinksResult = await safeChromeCall(async () => {
      return await chrome.storage.sync.get(['customHeaderLinks']);
    }) || {};
    const customLinks = customLinksResult.customHeaderLinks;
    if (Array.isArray(customLinks) && customLinks.length > 0 && !activeEnhancements.customHeaderLinks) {
      const EnhancementClass = ENHANCEMENTS.customHeaderLinks;
      if (EnhancementClass) {
        console.log('Content Script: Auto-enabling customHeaderLinks because links exist and toggle is not set');
        await enableEnhancement('customHeaderLinks', EnhancementClass);
        await safeChromeCall(async () => {
          await chrome.storage.sync.set({ customHeaderLinksEnabled: true });
        });
      }
    }
  }
}

/**
 * Enable a specific enhancement
 * @param {string} featureName - Name of the feature
 * @param {Function} EnhancementClass - Enhancement class constructor
 */
async function enableEnhancement(featureName, EnhancementClass) {
  try {
    // Don't initialize if already active
    if (activeEnhancements[featureName]) {
      console.log(`Enhancement "${featureName}" already active`);
      return;
    }
    
    // Special handling for format-session-dates if it was auto-initialized
    if (featureName === 'formatSessionDates' && window.formatSessionDatesInstance) {
      console.log(`Enhancement "${featureName}" was auto-initialized, using existing instance`);
      activeEnhancements[featureName] = window.formatSessionDatesInstance;
      return;
    }
    
    // Create new instance and initialize
    const enhancement = new EnhancementClass();
    await enhancement.initialize();
    
    activeEnhancements[featureName] = enhancement;
    console.log(`Enhancement "${featureName}" enabled`);
  } catch (error) {
    console.error(`Error enabling enhancement "${featureName}":`, error);
  }
}

/**
 * Disable a specific enhancement
 * @param {string} featureName - Name of the feature
 */
async function disableEnhancement(featureName) {
  try {
    const enhancement = activeEnhancements[featureName];
    
    if (!enhancement) {
      console.log(`Enhancement "${featureName}" not active`);
      return;
    }
    
    // Check data before cleanup
    if (featureName === 'customHeaderLinks') {
      const beforeData = await safeChromeCall(async () => {
        return await chrome.storage.sync.get(['customHeaderLinks']);
      }) || {};
      console.log(`Data before disabling ${featureName}:`, beforeData);
    }
    
    // Call cleanup if available
    if (typeof enhancement.cleanup === 'function') {
      await enhancement.cleanup();
    }
    
    delete activeEnhancements[featureName];
    console.log(`Enhancement "${featureName}" disabled`);
    
    // Check data after cleanup
    if (featureName === 'customHeaderLinks') {
      const afterData = await safeChromeCall(async () => {
        return await chrome.storage.sync.get(['customHeaderLinks']);
      }) || {};
      console.log(`Data after disabling ${featureName}:`, afterData);
    }
  } catch (error) {
    console.error(`Error disabling enhancement "${featureName}":`, error);
  }
}

/**
 * Handle messages from popup or background script
 * @param {Object} message - Message object
 * @param {Object} sender - Sender information
 * @param {Function} sendResponse - Response callback
 */
async function handleMessage(message, sender, sendResponse) {
  // Handle header padding changes first (before general enhancement check)
  if (message.type === 'SETTING_CHANGED' && message.feature === 'headerPadding') {
    const padding = message.value !== undefined ? message.value : message.enabled;
    if (padding !== undefined && padding !== null) {
      applyHeaderPadding(padding);
    }
    return;
  }
  
  if (message.type === 'SETTING_CHANGED') {
    const { feature, enabled } = message;
    
    // Skip LO link features - they handle their own messages via lo-links.js
    if (feature.startsWith('loShow') || feature === 'loCopyLoid') {
      // lo-links.js will handle this message directly
      return;
    }
    
    // Skip transcript features - they handle their own messages via highlight-transcript-statuses.js
    if (feature === 'highlightTranscriptStatuses' || feature === 'transcriptSettingsChanged' || feature.startsWith('transcript')) {
      // highlight-transcript-statuses.js will handle this message directly
      return;
    }
    
    // Skip assignment status features - they handle their own messages via highlight-assignment-statuses.js
    if (feature === 'highlightAssignmentStatuses' || feature === 'assignmentSettingsChanged' || feature.startsWith('assignment')) {
      // highlight-assignment-statuses.js will handle this message directly
      return;
    }
    
    // Skip custom pages container features - they handle their own messages via resize-custom-pages-container.js
    if (feature === 'resizeCustomPagesContainer' || feature === 'customPagesContainerWidth') {
      // resize-custom-pages-container.js will handle this message directly
      return;
    }
    
    // Skip environment features - they handle their own messages via highlight-environments.js
    if (feature === 'highlightEnvironments' || feature === 'environmentSettingsChanged' || feature.startsWith('environment')) {
      // highlight-environments.js will handle this message directly
      return;
    }
    
    // Skip proxy default text value - it's handled by proxy-as-user.js
    if (feature === 'proxyDefaultTextValue') {
      // proxy-as-user.js will handle this message directly
      return;
    }
    
    // Skip icon size settings - they're handled by specific message types
    if (feature === 'resizeAIIconSize' || feature === 'resizePinnedLinksIconSize' || feature === 'customLinkIconSize') {
      // These are handled by specific APPLY_*_ICON_SIZE messages
      return;
    }
    
    // Update registry before checking for enhancement
    updateEnhancementsRegistry();
    
    const EnhancementClass = ENHANCEMENTS[feature];
    
    if (!EnhancementClass) {
      console.warn(`Unknown enhancement: ${feature}`);
      return;
    }
    
    if (enabled) {
      await enableEnhancement(feature, EnhancementClass);
    } else {
      await disableEnhancement(feature);
    }
  } else if (message.type === 'CUSTOM_LINKS_UPDATED') {
    // Handle custom links updates
    const { customLinks } = message;
    
    // If we have links but the enhancement isn't active, enable it first
    if (customLinks && customLinks.length > 0 && !activeEnhancements.customHeaderLinks) {
      const EnhancementClass = ENHANCEMENTS.customHeaderLinks;
      if (EnhancementClass) {
        console.log('Content Script: Auto-enabling customHeaderLinks enhancement');
        await enableEnhancement('customHeaderLinks', EnhancementClass);
        // Also update storage to reflect that the feature is enabled
        await safeChromeCall(async () => {
          await chrome.storage.sync.set({ customHeaderLinksEnabled: true });
        });
        
        // Wait a moment for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (activeEnhancements.customHeaderLinks) {
      console.log('Content Script: Updating custom links, count:', customLinks?.length || 0);
      activeEnhancements.customHeaderLinks.customLinks = customLinks;
      activeEnhancements.customHeaderLinks.renderCustomLinks();
    } else {
      console.warn('Content Script: customHeaderLinks enhancement not active, cannot render links');
      // If we still don't have an active enhancement, try one more time
      if (customLinks && customLinks.length > 0) {
        console.log('Content Script: Retrying to enable customHeaderLinks');
        const EnhancementClass = ENHANCEMENTS.customHeaderLinks;
        if (EnhancementClass) {
          const enhancement = new EnhancementClass();
          await enhancement.initialize();
          activeEnhancements.customHeaderLinks = enhancement;
          enhancement.customLinks = customLinks;
          enhancement.renderCustomLinks();
        }
      }
    }
  } else if (message.type === 'APPLY_HEADER_PADDING') {
    // Handle header padding changes
    const { padding } = message;
    applyHeaderPadding(padding);
  } else if (message.type === 'APPLY_CUSTOM_LINK_ICON_SIZE') {
    // Handle custom link icon size changes
    const { size } = message;
    console.log(`Content Script: Received APPLY_CUSTOM_LINK_ICON_SIZE message with size: ${size}`);
    if (activeEnhancements.customHeaderLinks) {
      console.log(`Content Script: Updating icon size to ${size}px`);
      activeEnhancements.customHeaderLinks.iconSize = size;
      activeEnhancements.customHeaderLinks.applyIconSizeToAll();
    } else {
      // Enhancement not active, but we still want to apply icon sizes to default CSOD icons
      // Initialize a minimal instance just for icon sizing
      const EnhancementClass = ENHANCEMENTS.customHeaderLinks;
      if (EnhancementClass) {
        try {
          const enhancement = new EnhancementClass();
          enhancement.iconSize = size;
          // Load icon size and apply without needing custom links
          await enhancement.loadIconSize();
          enhancement.iconSize = size; // Override with the new size
          enhancement.applyIconSizeToAll();
          console.log(`Content Script: Applied icon size ${size}px without full enhancement initialization`);
        } catch (error) {
          console.warn('Content Script: Could not apply icon size - enhancement initialization failed:', error);
        }
      }
    }
  } else if (message.type === 'GET_AI_ICON_STATUS') {
    // Check if AI icon exists on the page
    const iconElement = document.querySelector('.csxGalaxyAIAnnouncement-icon');
    const iconFound = iconElement !== null;
    sendResponse({ iconFound: iconFound });
    return true; // Indicates we will send a response synchronously
  } else if (message.type === 'GET_PINNED_LINKS_ICON_STATUS') {
    // Check if Pinned Links icon exists on the page
    const iconElement = document.querySelector('.quickLinksTooltip-icon');
    const iconFound = iconElement !== null;
    sendResponse({ iconFound: iconFound });
    return true; // Indicates we will send a response synchronously
  } else if (message.type === 'GET_OU_TYPE_OPTIONS') {
    // Get OU Type dropdown options from the page
    const dropdown = document.getElementById('ouFilter_ouFilterSelector_ddlTypesList') ||
                     document.querySelector('select[data-tag="ddlTypesList"]');
    
    if (!dropdown) {
      sendResponse({ options: null });
      return true;
    }
    
    const options = [];
    const optionElements = dropdown.querySelectorAll('option');
    
    optionElements.forEach(option => {
      options.push({
        value: option.value,
        text: option.textContent.trim()
      });
    });
    
    sendResponse({ options: options.length > 0 ? options : null });
    return true; // Indicates we will send a response synchronously
  } else if (message.type === 'APPLY_AI_ICON_SIZE') {
    // Handle AI icon size changes
    const { size } = message;
    if (activeEnhancements.resizeAIIcon) {
      activeEnhancements.resizeAIIcon.applyIconSize(size);
    }
  } else if (message.type === 'APPLY_PINNED_LINKS_ICON_SIZE') {
    // Handle Pinned Links icon size changes
    const { size } = message;
    if (activeEnhancements.resizePinnedLinksIcon) {
      activeEnhancements.resizePinnedLinksIcon.applyIconSize(size);
    }
  } else if (message.type === 'RESET_AI_ICON') {
    // Handle AI icon reset
    if (activeEnhancements.resizeAIIcon) {
      activeEnhancements.resizeAIIcon.resetIconSize();
    }
  } else if (message.type === 'RESET_PINNED_LINKS_ICON') {
    // Handle Pinned Links icon reset
    if (activeEnhancements.resizePinnedLinksIcon) {
      activeEnhancements.resizePinnedLinksIcon.resetIconSize();
    }
  } else if (message.feature === 'sessionsCheckboxDefaults' && message.enabled === 'update') {
    // Handle sessions checkbox defaults update
    if (activeEnhancements.sessionsCheckboxDefaults) {
      activeEnhancements.sessionsCheckboxDefaults.loadSettings();
      activeEnhancements.sessionsCheckboxDefaults.applyCheckboxDefaults();
    }
  } else if (message.feature === 'userStatusDropdownDefaults' && message.enabled === 'update') {
    // Handle user status dropdown defaults update
    if (activeEnhancements.userStatusDropdownDefaults) {
      activeEnhancements.userStatusDropdownDefaults.loadSettings();
      activeEnhancements.userStatusDropdownDefaults.applyDropdownDefaults();
    }
  } else if (message.feature === 'userOuTypeDropdownDefaults' && message.enabled === 'update') {
    // Handle user OU type dropdown defaults update
    if (activeEnhancements.userOuTypeDropdownDefaults) {
      activeEnhancements.userOuTypeDropdownDefaults.loadSettings();
      activeEnhancements.userOuTypeDropdownDefaults.applyDropdownDefaults();
    }
  } else if (message.feature === 'userCountryDropdownDefaults' && message.enabled === 'update') {
    // Handle user country dropdown defaults update
    if (activeEnhancements.userCountryDropdownDefaults) {
      activeEnhancements.userCountryDropdownDefaults.loadSettings();
      activeEnhancements.userCountryDropdownDefaults.applyDropdownDefaults();
    }
  }
}

/**
 * Apply header padding to header items
 * @param {number} padding - Padding value in pixels
 */
function applyHeaderPadding(padding) {
  // Validate padding value
  if (padding === undefined || padding === null || isNaN(padding)) {
    console.warn(`Content Script: Invalid header padding value: ${padding}, using default 16px`);
    padding = 16; // Default value
  }
  
  // Ensure padding is a number
  padding = Number(padding);
  
  console.log(`Content Script: Applying header padding: ${padding}px`);
  
  // Create or update CSS rule for header padding
  let styleElement = document.getElementById('header-padding-style');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'header-padding-style';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = `
    .c-page-header > .c-hdr-item {
      padding-left: ${padding}px !important;
      padding-right: ${padding}px !important;
    }
    .c-page-header > .c-hdr-item.nav-act {
      padding-right: 32px !important;
    }
  `;
  
  console.log(`Content Script: Header padding applied successfully`);
}

/**
 * Listen for storage changes (settings changed in another tab)
 */
try {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(async (changes, areaName) => {
      if (areaName === 'sync') {
        for (const [feature, change] of Object.entries(changes)) {
          // Skip LO link features - they handle their own storage changes via lo-links.js
          if (feature.startsWith('loShow') || feature === 'loCopyLoid') {
            // lo-links.js will handle this storage change directly
            continue;
          }
          
          // Skip transcript features - they handle their own storage changes via highlight-transcript-statuses.js
          if (feature === 'highlightTranscriptStatuses' || feature.startsWith('transcript')) {
            // highlight-transcript-statuses.js will handle this storage change directly
            continue;
          }
          
          // Skip assignment status features - they handle their own storage changes via highlight-assignment-statuses.js
          if (feature === 'highlightAssignmentStatuses' || feature === 'assignmentSettingsChanged' || feature.startsWith('assignment')) {
            // highlight-assignment-statuses.js will handle this storage change directly
            continue;
          }
          
          // Skip custom pages container features - they handle their own storage changes via resize-custom-pages-container.js
          if (feature === 'resizeCustomPagesContainer' || feature === 'customPagesContainerWidth') {
            // resize-custom-pages-container.js will handle this storage change directly
            continue;
          }
          
          if (feature === 'highlightEnvironments' || feature.startsWith('environment')) {
            // highlight-environments.js will handle this storage change directly
            continue;
          }
          
          // Skip proxy default text value - it's handled by proxy-as-user.js
          if (feature === 'proxyDefaultTextValue') {
            // proxy-as-user.js will handle this storage change directly
            continue;
          }
          
          // Skip icon size settings - they're handled by specific message types
          if (feature === 'resizeAIIconSize' || feature === 'resizePinnedLinksIconSize' || feature === 'customLinkIconSize') {
            // These are handled by specific APPLY_*_ICON_SIZE messages
            continue;
          }
          
          // Special handling for customHeaderLinksEnabled
          if (feature === 'customHeaderLinksEnabled') {
            const enabled = change.newValue;
            const EnhancementClass = ENHANCEMENTS.customHeaderLinks;
            
            if (enabled) {
              await enableEnhancement('customHeaderLinks', EnhancementClass);
            } else {
              await disableEnhancement('customHeaderLinks');
            }
          } else if (ENHANCEMENTS[feature]) {
            const enabled = change.newValue;
            const EnhancementClass = ENHANCEMENTS[feature];
            
            if (enabled) {
              await enableEnhancement(feature, EnhancementClass);
            } else {
              await disableEnhancement(feature);
            }
          }
        }
      }
    });
  }
} catch (error) {
  if (error.message && !error.message.includes('Extension context invalidated')) {
    console.error('Error setting up storage change listener:', error);
  }
}

