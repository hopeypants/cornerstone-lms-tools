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
  // Only include enhancements that are loaded on this page
  ...(window.ToggleTentativeColumnEnhancement && { toggleTentativeColumn: window.ToggleTentativeColumnEnhancement }),
  ...(window.HighlightZeroSessionsEnhancement && { highlightZeroSessions: window.HighlightZeroSessionsEnhancement }),
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
 * Update ENHANCEMENTS registry with newly loaded enhancements
 */
function updateEnhancementsRegistry() {
  Object.assign(ENHANCEMENTS, {
    customHeaderLinks: window.CustomHeaderLinksEnhancement,
    ...(window.ToggleTentativeColumnEnhancement && { toggleTentativeColumn: window.ToggleTentativeColumnEnhancement }),
    ...(window.HighlightZeroSessionsEnhancement && { highlightZeroSessions: window.HighlightZeroSessionsEnhancement }),
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
  const paddingResult = await chrome.storage.sync.get(['headerPadding']);
  if (paddingResult.headerPadding !== undefined) {
    applyHeaderPadding(paddingResult.headerPadding);
  }
  
  // Listen for setting changes from popup
  chrome.runtime.onMessage.addListener(handleMessage);
  
  console.log('Cornerstone LMS Admin Tools: Ready');
})();

/**
 * Load settings from Chrome storage
 * @returns {Promise<Object>} Settings object
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(Object.keys(ENHANCEMENTS));
    
    // Special handling for customHeaderLinks - check the separate storage key
    const customLinksEnabled = await chrome.storage.sync.get(['customHeaderLinksEnabled']);
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
      const beforeData = await chrome.storage.sync.get(['customHeaderLinks']);
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
      const afterData = await chrome.storage.sync.get(['customHeaderLinks']);
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
    const { enabled: padding } = message;
    applyHeaderPadding(padding);
    return;
  }
  
  if (message.type === 'SETTING_CHANGED') {
    const { feature, enabled } = message;
    
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
    
    if (activeEnhancements.customHeaderLinks) {
      activeEnhancements.customHeaderLinks.customLinks = customLinks;
      activeEnhancements.customHeaderLinks.renderCustomLinks();
    }
  } else if (message.type === 'APPLY_HEADER_PADDING') {
    // Handle header padding changes
    const { padding } = message;
    applyHeaderPadding(padding);
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
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'sync') {
    for (const [feature, change] of Object.entries(changes)) {
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

