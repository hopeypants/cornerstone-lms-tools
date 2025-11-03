/**
 * Popup Script for Cornerstone LMS Admin Tools
 * Handles settings UI, toggle switches, and storage synchronization
 */

// Theme management
const THEME_STORAGE_KEY = 'popupTheme';
const DEFAULT_THEME = 'dark'; // Dark mode is default

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', async () => {
  await initializeTheme();
});

async function initializeTheme() {
  try {
    const result = await chrome.storage.sync.get([THEME_STORAGE_KEY]);
    const theme = result[THEME_STORAGE_KEY] || DEFAULT_THEME;
    applyTheme(theme);
  } catch (error) {
    console.error('Error loading theme:', error);
    applyTheme(DEFAULT_THEME);
  }
  
  // Setup theme toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    // Update icon based on current theme
    updateThemeIcon();
  }
}

function updateThemeIcon() {
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    const isDark = document.body.classList.contains('dark-mode');
    // Use emoji as they're more reliable than Font Awesome icons which may not be available
    // Sun emoji in dark mode (click to switch to light), moon emoji in light mode (click to switch to dark)
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    themeIcon.className = ''; // Clear any icon classes
  }
}

function applyTheme(theme) {
  const body = document.body;
  
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
  } else {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  }
  
  updateThemeIcon();
}

async function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  applyTheme(newTheme);
  
  try {
    await chrome.storage.sync.set({ [THEME_STORAGE_KEY]: newTheme });
  } catch (error) {
    console.error('Error saving theme:', error);
  }
}

// Default settings for all features
const DEFAULT_SETTINGS = {
  headerLogoutLink: false,
  toggleTentativeColumn: false,
  highlightZeroSessions: false,
  centerNumberColumns: false,
  highlightFullSessions: false,
  formatSessionDates: false,
  highlightZeroEnrollments: false,
  centerEnrollmentColumn: false,
  // customHeaderLinks is stored as an array, not a boolean - use customHeaderLinksEnabled for the toggle
  resizeAIIcon: false,
  resizeAIIconSize: 32,
  resizePinnedLinksIcon: false,
  resizePinnedLinksIconSize: 22,
  customLinkIconSize: 20,
  sessionsCheckboxDefaults: false,
  userStatusDropdownDefaults: false,
  userOuTypeDropdownDefaults: false,
  userCountryDropdownDefaults: false,
  loShowPreviewLink: false,
  loShowDetailsLink: false,
  loShowLaunchLink: false,
  loShowRegisterLink: false,
  loCopyLoid: false,
  highlightTranscriptStatuses: false,
  transcriptPastDueEnabled: true,
  transcriptPastDueColor: '#ff0000',
  transcriptPastDueOpacity: 10,
  transcriptInProgressEnabled: true,
  transcriptInProgressColor: '#0066cc',
  transcriptInProgressOpacity: 10,
  transcriptPendingEnabled: true,
  transcriptPendingColor: '#ffaa00',
  transcriptPendingOpacity: 10,
  transcriptRegisteredEnabled: true,
  transcriptRegisteredColor: '#9333ea',
  transcriptRegisteredOpacity: 10,
  transcriptCompletedEnabled: true,
  transcriptCompletedColor: '#00aa00',
  transcriptCompletedOpacity: 10,
  transcriptInactiveEnabled: true,
  transcriptInactiveColor: '#888888',
  transcriptInactiveOpacity: 10,
  transcriptWithdrawnEnabled: true,
  transcriptWithdrawnColor: '#6b7280',
  transcriptWithdrawnOpacity: 10,
  transcriptCancelledEnabled: true,
  transcriptCancelledColor: '#000000',
  transcriptCancelledOpacity: 10,
  transcriptDeniedEnabled: true,
  transcriptDeniedColor: '#dc2626',
  transcriptDeniedOpacity: 10,
  // Misc
  proxyDefaultText: false,
  proxyDefaultTextValue: '',
  proxyAutoClickLogin: false,
  customPagePreviewLink: false,
  customPageCopyLink: false,
  resizeCustomPagesContainer: false,
  customPagesContainerWidth: 55,
  highlightEnvironments: false,
  environmentProductionExpanded: false,
  environmentProductionEnabled: true,
  environmentProductionHeaderColorEnabled: false,
  environmentProductionColor: '#950606',
  environmentProductionHeaderOpacity: 100,
  environmentProductionWatermark: false,
  environmentProductionWatermarkColor: '#000000',
  environmentProductionWatermarkOpacity: 50,
  environmentStagingExpanded: false,
  environmentStagingEnabled: true,
  environmentStagingHeaderColorEnabled: false,
  environmentStagingColor: '#06402B',
  environmentStagingHeaderOpacity: 100,
  environmentStagingWatermark: false,
  environmentStagingWatermarkColor: '#000000',
  environmentStagingWatermarkOpacity: 50,
  environmentPilotExpanded: false,
  environmentPilotEnabled: true,
  environmentPilotHeaderColorEnabled: false,
  environmentPilotColor: '#111184',
  environmentPilotHeaderOpacity: 100,
  environmentPilotWatermark: false,
  environmentPilotWatermarkColor: '#000000',
  environmentPilotWatermarkOpacity: 50,
  highlightAssignmentStatuses: false,
  assignmentActiveEnabled: true,
  assignmentActiveColor: '#0066cc',
  assignmentActiveOpacity: 10,
  assignmentQueuedEnabled: true,
  assignmentQueuedColor: '#ffaa00',
  assignmentQueuedOpacity: 10,
  assignmentProcessedEnabled: true,
  assignmentProcessedColor: '#00aa00',
  assignmentProcessedOpacity: 10,
  assignmentCancelledEnabled: true,
  assignmentCancelledColor: '#000000',
  assignmentCancelledOpacity: 10,
  assignmentInactiveEnabled: true,
  assignmentInactiveColor: '#888888',
  assignmentInactiveOpacity: 10,
  assignmentDraftsEnabled: true,
  assignmentDraftsColor: '#6b7280',
  assignmentDraftsOpacity: 10
};

/**
 * Initialize the popup when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  setupTabNavigation();
  await loadSelectedTab(); // Restore the previously selected tab
  setupCustomLinksManagement();
  setupSessionsCheckboxManagement();
  setupUserStatusDropdownManagement();
  setupUserOuTypeDropdownManagement();
  setupUserCountryDropdownManagement();
  setupMiscProxySection();
  setupResetButtons();
  setupAIIconSizeControl();
  setupCustomPagesContainerWidth();
  setupPinnedLinksIconSizeControl();
  checkAIIconAvailability();
  checkPinnedLinksIconAvailability();
  setupSettingsExportImport();
  setupSettingsManagement();
  // LOID check will be done in loadSelectedTab if Catalog tab is active
});

// Track icon availability state
let aiIconAvailable = false;
let pinnedLinksIconAvailable = false;

/**
 * Load saved settings from Chrome storage and update UI
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    // Special handling for customHeaderLinks - always check the separate storage key
    // customHeaderLinks is not in DEFAULT_SETTINGS (it's an array, not a boolean)
    // So we always need to check customHeaderLinksEnabled separately
    const customLinksEnabled = await chrome.storage.sync.get(['customHeaderLinksEnabled']);
    if (customLinksEnabled.customHeaderLinksEnabled !== undefined) {
      settings.customHeaderLinks = customLinksEnabled.customHeaderLinksEnabled;
    } else {
      // If not set, check if links exist and default to enabled if they do
      const customLinksResult = await chrome.storage.sync.get(['customHeaderLinks']);
      const customLinks = customLinksResult.customHeaderLinks;
      if (Array.isArray(customLinks) && customLinks.length > 0) {
        settings.customHeaderLinks = true;
      } else {
        settings.customHeaderLinks = false;
      }
    }
    
    // Update all toggle switches based on saved settings
    Object.keys(settings).forEach(feature => {
      const toggle = document.querySelector(`[data-feature="${feature}"]`);
      if (toggle) {
        toggle.checked = settings[feature];
        
        // Show/hide management sections based on toggle state
        if (feature === 'customHeaderLinks') {
          const managementSection = document.getElementById('custom-links-management');
          if (managementSection) {
            managementSection.style.display = settings[feature] ? 'block' : 'none';
          }
        } else if (feature === 'sessionsCheckboxDefaults') {
          const managementSection = document.getElementById('sessions-checkbox-management');
          if (managementSection) {
            managementSection.style.display = settings[feature] ? 'block' : 'none';
            // Setup event listeners when section becomes visible
            if (settings[feature]) {
              // Use setTimeout to ensure DOM is updated
              setTimeout(() => {
                setupSessionsCheckboxEventListeners();
              }, 100);
            }
          }
        } else if (feature === 'userStatusDropdownDefaults') {
          const managementSection = document.getElementById('user-status-dropdown-management');
          if (managementSection) {
            managementSection.style.display = settings[feature] ? 'block' : 'none';
            // Setup event listeners when section becomes visible
            if (settings[feature]) {
              // Use setTimeout to ensure DOM is updated
              setTimeout(() => {
                setupUserStatusDropdownEventListeners();
              }, 100);
            }
          }
        } else if (feature === 'userOuTypeDropdownDefaults') {
          const managementSection = document.getElementById('user-ou-type-dropdown-management');
          if (managementSection) {
            managementSection.style.display = settings[feature] ? 'block' : 'none';
            // Setup event listeners when section becomes visible
            if (settings[feature]) {
              // Use setTimeout to ensure DOM is updated
              setTimeout(async () => {
                await updateOuTypeDropdownAvailability();
                await populateOuTypeDropdown();
                setupUserOuTypeDropdownEventListeners();
              }, 100);
            }
          }
        } else if (feature === 'userCountryDropdownDefaults') {
          const managementSection = document.getElementById('user-country-dropdown-management');
          if (managementSection) {
            managementSection.style.display = settings[feature] ? 'block' : 'none';
            // Setup event listeners when section becomes visible
            if (settings[feature]) {
              // Use setTimeout to ensure DOM is updated
              setTimeout(() => {
                setupUserCountryDropdownEventListeners();
              }, 100);
            }
          }
        } else if (feature === 'highlightTranscriptStatuses') {
          const settingsSection = document.getElementById('transcript-status-settings');
          if (settingsSection) {
            settingsSection.style.display = settings[feature] ? 'block' : 'none';
            if (settings[feature]) {
              setTimeout(() => {
                setupTranscriptStatusSettings();
              }, 100);
            }
          }
        } else if (feature === 'resizeCustomPagesContainer') {
          const config = document.getElementById('resize-custom-pages-container-config');
          if (config) config.style.display = settings[feature] ? 'block' : 'none';
          
          // Load width value
          const widthInput = document.getElementById('custom-pages-container-width');
          const widthValue = document.getElementById('custom-pages-container-width-value');
          if (widthInput && widthValue) {
            const width = settings.customPagesContainerWidth || 55;
            widthInput.value = width;
            widthValue.textContent = `${width}vw`;
          }
        } else if (feature === 'proxyDefaultText') {
          const config = document.getElementById('proxy-default-text-config');
          if (config) config.style.display = settings[feature] ? 'block' : 'none';
          
          // Update auto-click toggle based on both proxy toggle AND text value
          const autoClickToggle = document.getElementById('proxy-auto-click-login');
          const autoClickItem = document.getElementById('proxy-auto-click-item');
          if (autoClickToggle && autoClickItem) {
            const hasText = settings.proxyDefaultTextValue && settings.proxyDefaultTextValue.trim().length > 0;
            const shouldEnable = settings[feature] && hasText;
            autoClickToggle.disabled = !shouldEnable;
            autoClickItem.style.opacity = shouldEnable ? '1' : '0.6';
            
            // If disabled due to conditions, uncheck it
            if (!shouldEnable && autoClickToggle.checked) {
              autoClickToggle.checked = false;
              saveSetting('proxyAutoClickLogin', false).catch(err => {
                console.error('Error saving proxyAutoClickLogin:', err);
              });
            }
          }
        } else if (feature === 'resizeAIIcon') {
          const config = document.getElementById('ai-icon-size-config');
          if (config) config.style.display = settings[feature] ? 'block' : 'none';
          if (settings[feature]) {
            setTimeout(() => {
              setupAIIconSizeControl();
            }, 100);
          }
        } else if (feature === 'resizePinnedLinksIcon') {
          const config = document.getElementById('pinned-links-icon-size-config');
          if (config) config.style.display = settings[feature] ? 'block' : 'none';
          if (settings[feature]) {
            setTimeout(() => {
              setupPinnedLinksIconSizeControl();
            }, 100);
          }
        } else if (feature === 'highlightAssignmentStatuses') {
          const settingsSection = document.getElementById('assignment-status-settings');
          if (settingsSection) {
            settingsSection.style.display = settings[feature] ? 'block' : 'none';
            if (settings[feature]) {
              setTimeout(() => {
                setupAssignmentStatusSettings();
              }, 100);
            }
          }
        } else if (feature === 'highlightEnvironments') {
          const settingsSection = document.getElementById('environment-settings');
          if (settingsSection) {
            settingsSection.style.display = settings[feature] ? 'block' : 'none';
            if (settings[feature]) {
              setTimeout(() => {
                setupEnvironmentSettings();
              }, 100);
            }
          }
        }
      }
    });
    
    // Load transcript status color and opacity settings
    loadTranscriptStatusSettings(settings);
    
    // Load assignment status color and opacity settings
    loadAssignmentStatusSettings(settings);
    
    // Load environment settings
    loadEnvironmentSettings(settings);
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings', true);
  }
}

/**
 * Setup event listeners for all toggle switches
 */
function setupEventListeners() {
  const toggles = document.querySelectorAll('[data-feature]');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('change', async (event) => {
      const feature = event.target.dataset.feature;
      const enabled = event.target.checked;
      
      await saveSetting(feature, enabled);
      await notifyContentScript(feature, enabled);
      
      // Show/hide management sections based on toggle state
      if (feature === 'customHeaderLinks') {
        const managementSection = document.getElementById('custom-links-management');
        if (managementSection) {
          managementSection.style.display = enabled ? 'block' : 'none';
        }
      } else if (feature === 'sessionsCheckboxDefaults') {
        const managementSection = document.getElementById('sessions-checkbox-management');
        if (managementSection) {
          managementSection.style.display = enabled ? 'block' : 'none';
          // Setup event listeners when section becomes visible
          if (enabled) {
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
              setupSessionsCheckboxEventListeners();
            }, 100);
          }
        }
      } else if (feature === 'userStatusDropdownDefaults') {
        const managementSection = document.getElementById('user-status-dropdown-management');
        if (managementSection) {
          managementSection.style.display = enabled ? 'block' : 'none';
          // Setup event listeners when section becomes visible
          if (enabled) {
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
              setupUserStatusDropdownEventListeners();
            }, 100);
          }
        }
      } else if (feature === 'highlightTranscriptStatuses') {
        const settingsSection = document.getElementById('transcript-status-settings');
        if (settingsSection) {
          settingsSection.style.display = enabled ? 'block' : 'none';
          if (enabled) {
            setTimeout(() => {
              setupTranscriptStatusSettings();
            }, 100);
          }
        }
      } else if (feature === 'userOuTypeDropdownDefaults') {
        const managementSection = document.getElementById('user-ou-type-dropdown-management');
        if (managementSection) {
          managementSection.style.display = enabled ? 'block' : 'none';
          // Setup event listeners when section becomes visible
          if (enabled) {
            // Use setTimeout to ensure DOM is updated
            setTimeout(async () => {
              await updateOuTypeDropdownAvailability();
              await populateOuTypeDropdown();
              setupUserOuTypeDropdownEventListeners();
            }, 100);
          }
        }
      } else if (feature === 'userCountryDropdownDefaults') {
        const managementSection = document.getElementById('user-country-dropdown-management');
        if (managementSection) {
          managementSection.style.display = enabled ? 'block' : 'none';
          // Setup event listeners when section becomes visible
          if (enabled) {
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
              setupUserCountryDropdownEventListeners();
            }, 100);
          }
        }
      } else if (feature === 'resizeCustomPagesContainer') {
        // Show/hide config section
        const config = document.getElementById('resize-custom-pages-container-config');
        if (config) config.style.display = enabled ? 'block' : 'none';
      } else if (feature === 'proxyDefaultText') {
        // Enable/disable dependent toggle and show/hide config
        const config = document.getElementById('proxy-default-text-config');
        if (config) config.style.display = enabled ? 'block' : 'none';
        
        // Update auto-click toggle based on both proxy toggle AND text value
        const autoClickToggle = document.getElementById('proxy-auto-click-login');
        const autoClickItem = document.getElementById('proxy-auto-click-item');
        if (autoClickToggle && autoClickItem) {
          // Check text value from storage
          chrome.storage.sync.get(['proxyDefaultTextValue'], (result) => {
            const hasText = result.proxyDefaultTextValue && result.proxyDefaultTextValue.trim().length > 0;
            const shouldEnable = enabled && hasText;
            autoClickToggle.disabled = !shouldEnable;
            autoClickItem.style.opacity = shouldEnable ? '1' : '0.6';
            
            // If disabled due to conditions, uncheck it
            if (!shouldEnable && autoClickToggle.checked) {
              autoClickToggle.checked = false;
              saveSetting('proxyAutoClickLogin', false).catch(err => {
                console.error('Error saving proxyAutoClickLogin:', err);
              });
            }
          });
        }
      } else if (feature === 'resizeAIIcon') {
        const config = document.getElementById('ai-icon-size-config');
        if (config) config.style.display = enabled ? 'block' : 'none';
        if (enabled) {
          setTimeout(() => {
            setupAIIconSizeControl();
          }, 100);
        }
      } else if (feature === 'resizePinnedLinksIcon') {
        const config = document.getElementById('pinned-links-icon-size-config');
        if (config) config.style.display = enabled ? 'block' : 'none';
        if (enabled) {
          setTimeout(() => {
            setupPinnedLinksIconSizeControl();
          }, 100);
        }
      } else if (feature === 'highlightAssignmentStatuses') {
        const settingsSection = document.getElementById('assignment-status-settings');
        if (settingsSection) {
          settingsSection.style.display = enabled ? 'block' : 'none';
          if (enabled) {
            setTimeout(() => {
              setupAssignmentStatusSettings();
            }, 100);
          }
        }
      } else if (feature === 'highlightEnvironments') {
        const settingsSection = document.getElementById('environment-settings');
        if (settingsSection) {
          settingsSection.style.display = enabled ? 'block' : 'none';
          if (enabled) {
            setTimeout(() => {
              setupEnvironmentSettings();
            }, 100);
          }
        }
      }
    });
  });
}

/**
 * Save a single setting to Chrome storage
 * @param {string} feature - The feature name
 * @param {any} value - The value to save (can be boolean, string, number, etc.)
 */
async function saveSetting(feature, value) {
  try {
    // Special handling for customHeaderLinks - use separate storage key for toggle state
    if (feature === 'customHeaderLinks') {
      // Save toggle state to a separate key to avoid overwriting the array data
      await chrome.storage.sync.set({ customHeaderLinksEnabled: value });
      console.log(`Saved customHeaderLinksEnabled toggle state: ${value} (preserved customHeaderLinks array data)`);
    } else {
      const update = { [feature]: value };
      await chrome.storage.sync.set(update);
      console.log(`Saved setting: ${feature} = ${value}`);
    }
    // Status message removed - no confirmation needed
  } catch (error) {
    console.error('Error saving setting:', error);
    console.error('Feature:', feature, 'Value:', value, 'Type:', typeof value);
    showStatus('Error saving setting', true);
    throw error; // Re-throw so caller can handle if needed
  }
}

/**
 * Setup Misc > Proxy section
 */
function setupMiscProxySection() {
  const textInput = document.getElementById('proxy-default-text-value');
  if (!textInput) return;

  // Function to update auto-click toggle availability
  const updateAutoClickToggleAvailability = async () => {
    const autoClickToggle = document.getElementById('proxy-auto-click-login');
    const autoClickItem = document.getElementById('proxy-auto-click-item');
    
    if (!autoClickToggle || !autoClickItem) return;
    
    // Check both conditions: proxyDefaultText is enabled AND text has at least one character
    const result = await chrome.storage.sync.get(['proxyDefaultText', 'proxyDefaultTextValue']);
    const isProxyEnabled = result.proxyDefaultText === true;
    const hasText = result.proxyDefaultTextValue && result.proxyDefaultTextValue.trim().length > 0;
    const shouldEnable = isProxyEnabled && hasText;
    
    autoClickToggle.disabled = !shouldEnable;
    autoClickItem.style.opacity = shouldEnable ? '1' : '0.6';
    
    // If auto-click is disabled due to conditions, uncheck it
    if (!shouldEnable && autoClickToggle.checked) {
      autoClickToggle.checked = false;
      await saveSetting('proxyAutoClickLogin', false);
    }
  };

  // Load saved text
  chrome.storage.sync.get(['proxyDefaultTextValue'], (result) => {
    textInput.value = result.proxyDefaultTextValue || '';
    // Update auto-click toggle availability after loading
    updateAutoClickToggleAvailability();
  });

  // Save on input
  textInput.addEventListener('input', async (e) => {
    const val = e.target.value || '';
    await saveSetting('proxyDefaultTextValue', val);
    await notifyContentScript('proxyDefaultTextValue', val);
    
    // Update auto-click toggle availability when text changes
    updateAutoClickToggleAvailability();
  });
  
  // Also update when proxyDefaultText toggle changes
  const proxyToggle = document.querySelector('[data-feature="proxyDefaultText"]');
  if (proxyToggle) {
    proxyToggle.addEventListener('change', async () => {
      // Wait a moment for the toggle state to update
      setTimeout(() => {
        updateAutoClickToggleAvailability();
      }, 100);
    });
  }
  
  // Initial check
  updateAutoClickToggleAvailability();
}

/**
 * Setup Custom Pages Container Width control
 */
function setupCustomPagesContainerWidth() {
  const widthInput = document.getElementById('custom-pages-container-width');
  const widthValue = document.getElementById('custom-pages-container-width-value');
  
  if (!widthInput || !widthValue) return;
  
  // Load saved width
  chrome.storage.sync.get(['customPagesContainerWidth'], (result) => {
    const width = result.customPagesContainerWidth || 55;
    widthInput.value = width;
    widthValue.textContent = `${width}vw`;
  });
  
  // Debounce handler for width changes
  let widthTimeout;
  widthInput.addEventListener('input', async (e) => {
    const width = parseInt(e.target.value);
    widthValue.textContent = `${width}vw`;
    
    // Debounce the save operation
    if (widthTimeout) {
      clearTimeout(widthTimeout);
    }
    widthTimeout = setTimeout(async () => {
      await saveSetting('customPagesContainerWidth', width);
      await notifyContentScript('customPagesContainerWidth', width);
    }, 150);
  });
}

/**
 * Notify content script about setting changes
 * @param {string} feature - The feature name
 * @param {boolean|number|string} value - The value (enabled boolean for toggles, or other value types)
 */
async function notifyContentScript(feature, value) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Only send message if on a csod.com domain
    if (tab && tab.url && tab.url.includes('csod.com')) {
      const message = {
        type: 'SETTING_CHANGED',
        feature: feature
      };
      
      // If value is a boolean, use 'enabled', otherwise use 'value'
      if (typeof value === 'boolean') {
        message.enabled = value;
      } else {
        message.value = value;
      }
      
      chrome.tabs.sendMessage(tab.id, message).catch(err => {
        // Content script might not be loaded yet, that's okay
        console.log('Content script not ready:', err);
      });
    }
  } catch (error) {
    console.error('Error notifying content script:', error);
  }
}

/**
 * Display a status message to the user
 * @param {string} message - The message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showStatus(message, isError = false) {
  const statusElement = document.getElementById('status-message');
  
  statusElement.textContent = message;
  statusElement.classList.toggle('error', isError);
  
  // Clear message after 3 seconds
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.classList.remove('error');
  }, 3000);
}

/**
 * Format feature name for display
 * @param {string} featureName - Camel case feature name
 * @returns {string} - Formatted feature name
 */
function formatFeatureName(featureName) {
  return featureName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Setup tab navigation functionality
 */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const targetTab = button.dataset.tab;
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
      
      // Save the selected tab to storage
      await saveSelectedTab(targetTab);
      
      // If Catalog tab is opened, check LOID availability
      if (targetTab === 'catalog') {
        await checkLoidAvailability();
      }
      
      // If Users tab is opened, check OU Type dropdown availability
      if (targetTab === 'users') {
        await updateOuTypeDropdownAvailability();
      }
    });
  });
}

/**
 * Save the selected tab to Chrome storage
 * @param {string} tabName - The name of the selected tab
 */
async function saveSelectedTab(tabName) {
  try {
    await chrome.storage.local.set({ selectedTab: tabName });
  } catch (error) {
    console.error('Error saving selected tab:', error);
  }
}

/**
 * Load and restore the selected tab from Chrome storage
 */
async function loadSelectedTab() {
  try {
    const result = await chrome.storage.local.get(['selectedTab']);
    const selectedTab = result.selectedTab || 'global'; // Default to 'global' tab
    
    // Find and activate the saved tab
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to the saved tab
    const targetButton = document.querySelector(`[data-tab="${selectedTab}"]`);
    const targetContent = document.getElementById(`${selectedTab}-tab`);
    
    if (targetButton && targetContent) {
      targetButton.classList.add('active');
      targetContent.classList.add('active');
      
      // If Catalog tab is restored, check LOID availability
      if (selectedTab === 'catalog') {
        await checkLoidAvailability();
      }
      
      // If Users tab is restored, check OU Type dropdown availability
      if (selectedTab === 'users') {
        await updateOuTypeDropdownAvailability();
      }
    } else {
      // Fallback to global tab if saved tab doesn't exist
      const globalButton = document.querySelector('[data-tab="global"]');
      const globalContent = document.getElementById('global-tab');
      if (globalButton && globalContent) {
        globalButton.classList.add('active');
        globalContent.classList.add('active');
      }
    }
  } catch (error) {
    console.error('Error loading selected tab:', error);
    // Fallback to global tab on error
    const globalButton = document.querySelector('[data-tab="global"]');
    const globalContent = document.getElementById('global-tab');
    if (globalButton && globalContent) {
      globalButton.classList.remove('active');
      globalContent.classList.remove('active');
      globalButton.classList.add('active');
      globalContent.classList.add('active');
    }
  }
}

/**
 * Setup custom links management functionality
 */
function setupCustomLinksManagement() {
  const customLinksToggle = document.getElementById('custom-header-links');
  const managementSection = document.getElementById('custom-links-management');
  const addButton = document.getElementById('add-custom-link');

  // Show/hide management section based on toggle
  customLinksToggle.addEventListener('change', async () => {
    console.log('Custom links toggle changed to:', customLinksToggle.checked);
    
    // Check data before toggle change
    const beforeData = await chrome.storage.sync.get(['customHeaderLinks']);
    console.log('Data before toggle change:', beforeData);
    
    managementSection.style.display = customLinksToggle.checked ? 'block' : 'none';
    if (customLinksToggle.checked) {
      loadCustomLinks();
    }
    
    // Check data after toggle change
    const afterData = await chrome.storage.sync.get(['customHeaderLinks']);
    console.log('Data after toggle change:', afterData);
    
    // Don't clear custom links when toggling off - just hide the management section
  });

  // Add new link button
  addButton.addEventListener('click', () => {
    showLinkForm();
  });

  // Add separator button
  const addSeparatorButton = document.getElementById('add-separator');
  addSeparatorButton.addEventListener('click', () => {
    addSeparator();
  });

  // Add transcript links button
  const addTranscriptLinksButton = document.getElementById('add-transcript-links');
  addTranscriptLinksButton.addEventListener('click', () => {
    addTranscriptLinks();
  });

  // Add remove all button
  const removeAllButton = document.getElementById('remove-all-links');
  removeAllButton.addEventListener('click', () => {
    showRemoveAllConfirmation();
  });


  // Setup header padding control
  setupHeaderPaddingControl();
  
  // Setup custom link icon size control
  setupCustomLinkIconSizeControl();

  // Load custom links on initialization if feature is enabled
  if (customLinksToggle.checked) {
    managementSection.style.display = 'block';
    loadCustomLinks();
  }

  // Set up event delegation for edit/delete buttons (only once)
  const container = document.getElementById('custom-links-list');
  container.addEventListener('click', (e) => {
    if (e.target.matches('[data-action="edit"]')) {
      const index = parseInt(e.target.dataset.index);
      editCustomLink(index);
    } else if (e.target.matches('[data-action="delete"]')) {
      const index = parseInt(e.target.dataset.index);
      deleteCustomLink(index);
    }
  });

  // Set up drag and drop functionality (only once)
  setupDragAndDrop(container);
}

/**
 * Available icons for custom links - Only FontAwesome 3.2.1 icons
 * Reference: https://fontawesome.com/v3/icons/
 */
const AVAILABLE_ICONS = [
  { value: 'home', label: 'Home', fa3: 'fa-icon-home', fa6: 'fa-solid fa-house', none: '🏠' },
  { value: 'settings', label: 'Settings', fa3: 'fa-icon-cog', fa6: 'fa-solid fa-gear', none: '⚙️' },
  { value: 'user', label: 'User', fa3: 'fa-icon-user', fa6: 'fa-solid fa-user', none: '👤' },
  { value: 'help', label: 'Help', fa3: 'fa-icon-question-sign', fa6: 'fa-solid fa-circle-question', none: '❓' },
  { value: 'info', label: 'Info', fa3: 'fa-icon-info-sign', fa6: 'fa-solid fa-circle-info', none: 'ℹ️' },
  { value: 'download', label: 'Download', fa3: 'fa-icon-download', fa6: 'fa-solid fa-download', none: '⬇️' },
  { value: 'upload', label: 'Upload', fa3: 'fa-icon-upload', fa6: 'fa-solid fa-upload', none: '⬆️' },
  { value: 'edit', label: 'Edit', fa3: 'fa-icon-edit', fa6: 'fa-solid fa-pen', none: '✏️' },
  { value: 'search', label: 'Search', fa3: 'fa-icon-search', fa6: 'fa-solid fa-magnifying-glass', none: '🔍' },
  { value: 'calendar', label: 'Calendar', fa3: 'fa-icon-calendar', fa6: 'fa-solid fa-calendar', none: '📅' },
  { value: 'chart', label: 'Chart', fa3: 'fa-icon-bar-chart', fa6: 'fa-solid fa-chart-bar', none: '📊' },
  { value: 'folder', label: 'Folder', fa3: 'fa-icon-folder-close', fa6: 'fa-solid fa-folder', none: '📁' },
  { value: 'file', label: 'File', fa3: 'fa-icon-file', fa6: 'fa-solid fa-file', none: '📄' },
  { value: 'link', label: 'Link', fa3: 'fa-icon-link', fa6: 'fa-solid fa-link', none: '🔗' },
  { value: 'external', label: 'External Link', fa3: 'fa-icon-external-link', fa6: 'fa-solid fa-arrow-up-right-from-square', none: '↗️' },
  { value: 'plus', label: 'Plus', fa3: 'fa-icon-plus', fa6: 'fa-solid fa-plus', none: '➕' },
  { value: 'minus', label: 'Minus', fa3: 'fa-icon-minus', fa6: 'fa-solid fa-minus', none: '➖' },
  { value: 'check', label: 'Check', fa3: 'fa-icon-check', fa6: 'fa-solid fa-check', none: '✅' },
  { value: 'times', label: 'Close', fa3: 'fa-icon-remove', fa6: 'fa-solid fa-xmark', none: '❌' },
  { value: 'star', label: 'Star', fa3: 'fa-icon-star', fa6: 'fa-solid fa-star', none: '⭐' },
  { value: 'heart', label: 'Heart', fa3: 'fa-icon-heart', fa6: 'fa-solid fa-heart', none: '❤️' },
  { value: 'bell', label: 'Bell', fa3: 'fa-icon-bell', fa6: 'fa-solid fa-bell', none: '🔔' },
  { value: 'envelope', label: 'Email', fa3: 'fa-icon-envelope', fa6: 'fa-solid fa-envelope', none: '✉️' },
  { value: 'phone', label: 'Phone', fa3: 'fa-icon-phone', fa6: 'fa-solid fa-phone', none: '📞' },
  { value: 'camera', label: 'Camera', fa3: 'fa-icon-camera', fa6: 'fa-solid fa-camera', none: '📷' },
  { value: 'image', label: 'Image', fa3: 'fa-icon-picture', fa6: 'fa-solid fa-image', none: '🖼️' },
  { value: 'video', label: 'Video', fa3: 'fa-icon-film', fa6: 'fa-solid fa-video', none: '🎥' },
  { value: 'music', label: 'Music', fa3: 'fa-icon-music', fa6: 'fa-solid fa-music', none: '🎵' },
  { value: 'book', label: 'Book', fa3: 'fa-icon-book', fa6: 'fa-solid fa-book', none: '📚' },
  { value: 'globe', label: 'Globe', fa3: 'fa-icon-globe', fa6: 'fa-solid fa-globe', none: '🌐' },
  { value: 'lock', label: 'Lock', fa3: 'fa-icon-lock', fa6: 'fa-solid fa-lock', none: '🔒' },
  { value: 'unlock', label: 'Unlock', fa3: 'fa-icon-unlock', fa6: 'fa-solid fa-unlock', none: '🔓' },
  { value: 'key', label: 'Key', fa3: 'fa-icon-key', fa6: 'fa-solid fa-key', none: '🔑' },
  { value: 'shield', label: 'Shield', fa3: 'fa-icon-shield', fa6: 'fa-solid fa-shield', none: '🛡️' },
  { value: 'wrench', label: 'Wrench', fa3: 'fa-icon-wrench', fa6: 'fa-solid fa-wrench', none: '🔧' },
  { value: 'fire', label: 'Fire', fa3: 'fa-icon-fire', fa6: 'fa-solid fa-fire', none: '🔥' },
  { value: 'bolt', label: 'Bolt', fa3: 'fa-icon-bolt', fa6: 'fa-solid fa-bolt', none: '⚡' },
  { value: 'flag', label: 'Flag', fa3: 'fa-icon-flag', fa6: 'fa-solid fa-flag', none: '🚩' },
  { value: 'trophy', label: 'Trophy', fa3: 'fa-icon-trophy', fa6: 'fa-solid fa-trophy', none: '🏆' },
  { value: 'gift', label: 'Gift', fa3: 'fa-icon-gift', fa6: 'fa-solid fa-gift', none: '🎁' },
  { value: 'custom', label: 'Custom', fa3: 'fa-icon-magic', fa6: 'fa-solid fa-paintbrush', none: '🎨' }
];

// Use FA3 for popup to match the webpage
const getIconClassForPopup = (iconName) => {
  const icon = AVAILABLE_ICONS.find(i => i.value === iconName);
  if (!icon) return 'icon-link';
  
  // Convert fa-icon-* to icon-* for FontAwesome 3
  const fa3Class = icon.fa3;
  if (fa3Class.startsWith('fa-icon-')) {
    return fa3Class.replace('fa-icon-', 'icon-');
  }
  return fa3Class || 'icon-link';
};

/**
 * Add default transcript links to custom links
 */
async function addTranscriptLinks() {
  try {
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array - but preserve existing data
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, initializing as empty array but NOT saving:', customLinks);
      customLinks = [];
      // DO NOT save empty array - it might wipe out data during toggle operations
    }
    
    // Define the 4 transcript links in reverse order
    // We'll unshift them, so we define them backwards to get the correct final order
    const transcriptLinks = [
      {
        label: 'Transcript: Archived',
        url: '/phnx/driver.aspx?routename=Social/UniversalProfile/Transcript&preSelectedCategoryId=2',
        icon: 'custom',
        customIcon: 'icon-archive',
        tooltip: 'Transcript: Archived',
        openNewTab: false,
        iconColor: '#ffffff'
      },
      {
        label: 'Transcript: Completed',
        url: '/phnx/driver.aspx?routename=Social/UniversalProfile/Transcript&preSelectedCategoryId=3',
        icon: 'custom',
        customIcon: 'icon-check',
        tooltip: 'Transcript: Completed',
        openNewTab: false,
        iconColor: '#ffffff'
      },
      {
        label: 'Transcript: Active',
        url: '/phnx/driver.aspx?routename=Social/UniversalProfile/Transcript&preSelectedCategoryId=1',
        icon: 'custom',
        customIcon: 'icon-edit',
        tooltip: 'Transcript: Active',
        openNewTab: false,
        iconColor: '#ffffff'
      },
      {
        label: 'Transcript: All',
        url: '/phnx/driver.aspx?routename=Social/UniversalProfile/Transcript&preSelectedCategoryId=9',
        icon: 'custom',
        customIcon: 'icon-list-alt',
        tooltip: 'Transcript: All',
        openNewTab: false,
        iconColor: '#ffffff'
      }
    ];
    
    // Add all transcript links at the beginning (top of list = leftmost in header)
    // unshift adds to the front, so we add them in reverse order to get the correct display order
    for (let i = 0; i < transcriptLinks.length; i++) {
      customLinks.unshift(transcriptLinks[i]);
    }
    
    await chrome.storage.sync.set({ customHeaderLinks: customLinks });
    
    // If we're adding links and the feature isn't enabled, enable it
    const toggle = document.querySelector('[data-feature="customHeaderLinks"]');
    if (toggle && !toggle.checked) {
      toggle.checked = true;
      await saveSetting('customHeaderLinks', true);
      console.log('Automatically enabled customHeaderLinks feature');
    }
    
    // Notify content script about the change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('csod.com')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CUSTOM_LINKS_UPDATED',
        customLinks: customLinks
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
    
    // Reload the custom links list
    loadCustomLinks();
    showStatus('Transcript links added successfully.', false);
  } catch (error) {
    console.error('Error adding transcript links:', error);
    showStatus('Error adding transcript links', true);
  }
}

/**
 * Add a separator to custom links
 */
async function addSeparator() {
  try {
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array - but preserve existing data
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, initializing as empty array but NOT saving:', customLinks);
      customLinks = [];
      // DO NOT save empty array - it might wipe out data during toggle operations
    }
    
    // Add separator object at the beginning (top of list = leftmost in header)
    const separator = {
      type: 'separator',
      label: 'Separator',
      id: `separator-${Date.now()}`
    };
    
    customLinks.unshift(separator);
    
    await chrome.storage.sync.set({ customHeaderLinks: customLinks });
    
    // If we're adding a separator and the feature isn't enabled, enable it
    const toggle = document.querySelector('[data-feature="customHeaderLinks"]');
    if (toggle && !toggle.checked) {
      toggle.checked = true;
      await saveSetting('customHeaderLinks', true);
      console.log('Automatically enabled customHeaderLinks feature');
    }
    
    // Notify content script about the change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('csod.com')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CUSTOM_LINKS_UPDATED',
        customLinks: customLinks
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
    
    loadCustomLinks();
  } catch (error) {
    console.error('Error adding separator:', error);
    showValidationModal('Error adding separator. Please try again.');
  }
}

/**
 * Setup drag and drop functionality for custom links
 * @param {Element} container - The container element
 */
function setupDragAndDrop(container) {
  let draggedElement = null;
  let draggedIndex = null;

  // Function to setup drag and drop for a single item
  function setupItemDragDrop(item, index) {
    // Remove existing listeners to prevent duplicates
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragend', handleDragEnd);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('drop', handleDrop);

    item.draggable = true;
    item.dataset.index = index;

    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
  }

  // Event handlers
  function handleDragStart(e) {
    // Find the actual custom-link-item element (might be clicking on a child)
    draggedElement = e.target.closest('.custom-link-item');
    if (!draggedElement) {
      draggedElement = e.target;
    }
    draggedIndex = parseInt(draggedElement.dataset.index);
    
    // Validate the index
    if (isNaN(draggedIndex) || draggedIndex < 0) {
      console.error('Invalid dragged index:', draggedElement.dataset.index);
      e.preventDefault();
      return;
    }
    
    draggedElement.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.outerHTML);
  }

  function handleDragEnd(e) {
    if (draggedElement) {
      draggedElement.classList.remove('dragging');
    }
    draggedElement = null;
    draggedIndex = null;
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(container, e.clientY);
    if (afterElement == null) {
      container.appendChild(draggedElement);
    } else {
      container.insertBefore(draggedElement, afterElement);
    }
  }

  async function handleDrop(e) {
    e.preventDefault();
    
    // Calculate the new index based on the current position in the DOM
    const allItems = container.querySelectorAll('.custom-link-item:not(.dragging)');
    
    // Recalculate indices for all items in their current order
    // This ensures indices match the actual storage array
    let newIndex = 0;
    let found = false;
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i] === draggedElement || allItems[i].contains(draggedElement)) {
        newIndex = i;
        found = true;
        break;
      }
    }
    
    // If not found in non-dragging items, it might still be dragging
    if (!found) {
      const allItemsIncludingDragging = container.querySelectorAll('.custom-link-item');
      for (let i = 0; i < allItemsIncludingDragging.length; i++) {
        if (allItemsIncludingDragging[i] === draggedElement) {
          newIndex = i;
          found = true;
          break;
        }
      }
    }
    
    // Only reorder if indices are different and both are valid
    if (found && draggedIndex !== null && draggedIndex !== undefined && 
        newIndex !== null && newIndex !== undefined && 
        draggedIndex !== newIndex) {
      await reorderCustomLinks(draggedIndex, newIndex);
    }
  }

  // Setup drag and drop for all existing items
  const linkItems = container.querySelectorAll('.custom-link-item');
  linkItems.forEach((item, index) => {
    setupItemDragDrop(item, index);
  });

  // Expose setupItemDragDrop for use when new items are added
  window.setupItemDragDrop = setupItemDragDrop;
}

/**
 * Get the element after which to insert the dragged element
 * @param {Element} container - The container element
 * @param {number} y - The Y coordinate of the mouse
 * @returns {Element|null} - The element to insert after, or null for end
 */
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.custom-link-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Reorder custom links
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 */
async function reorderCustomLinks(fromIndex, toIndex) {
  try {
    console.log(`Reordering custom links from index ${fromIndex} to index ${toIndex}`);
    
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, initializing as empty array:', customLinks);
      customLinks = [];
      await chrome.storage.sync.set({ customHeaderLinks: [] });
      showValidationModal('Custom links data was corrupted. Please refresh and try again.');
      return;
    }
    
    // Validate indices
    if (fromIndex < 0 || fromIndex >= customLinks.length) {
      console.error(`Invalid fromIndex: ${fromIndex}, array length: ${customLinks.length}`);
      showValidationModal('Invalid source position. Please try again.');
      return;
    }
    
    if (toIndex < 0 || toIndex >= customLinks.length) {
      console.error(`Invalid toIndex: ${toIndex}, array length: ${customLinks.length}`);
      showValidationModal('Invalid destination position. Please try again.');
      return;
    }
    
    // If indices are the same, nothing to do
    if (fromIndex === toIndex) {
      console.log('Indices are the same, no reorder needed');
      return;
    }
    
    console.log('Current custom links before reorder:', customLinks);
    
    // Move the item
    const link = customLinks.splice(fromIndex, 1)[0];
    if (!link) {
      console.error('Failed to extract link at index', fromIndex);
      showValidationModal('Failed to move link. Please refresh and try again.');
      return;
    }
    
    customLinks.splice(toIndex, 0, link);
    
    console.log('Custom links after reorder:', customLinks);
    
    await chrome.storage.sync.set({ customHeaderLinks: customLinks });
    console.log('Successfully saved reordered custom links to storage');
    
    // Notify content script about the change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('csod.com')) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CUSTOM_LINKS_UPDATED',
          customLinks: customLinks
        });
        console.log('Notified content script about reorder');
      } catch (msgError) {
        console.warn('Could not notify content script:', msgError);
        // Don't fail the operation if content script notification fails
      }
    }
    
    // Reload the display
    await loadCustomLinks();
    console.log('Reloaded custom links display');
  } catch (error) {
    console.error('Error reordering custom links:', error);
    console.error('Error stack:', error.stack);
    showValidationModal(`Error reordering custom links: ${error.message}. Please try again.`);
  }
}

/**
 * Load and display custom links
 */
async function loadCustomLinks() {
  try {
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, resetting to empty array:', customLinks);
      customLinks = [];
      // Save the corrected data back to storage
      await chrome.storage.sync.set({ customHeaderLinks: customLinks });
    }
    
    renderCustomLinks(customLinks);
  } catch (error) {
    console.error('Error loading custom links:', error);
  }
}

/**
 * Render custom links in the UI
 * @param {Array} customLinks - Array of custom link objects
 */
function renderCustomLinks(customLinks) {
  const container = document.getElementById('custom-links-list');
  container.innerHTML = '';

  if (customLinks.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280; font-size: 13px; padding: 20px;">No custom links added yet. Click "Add New Link" to get started.</p>';
    return;
  }

  customLinks.forEach((link, index) => {
    const linkElement = createCustomLinkElement(link, index);
    container.appendChild(linkElement);
    
    // Setup drag and drop for the new item
    if (window.setupItemDragDrop) {
      window.setupItemDragDrop(linkElement, index);
    }
  });
}

/**
 * Create a custom link element for the management interface
 * @param {Object} link - Link configuration
 * @param {number} index - Link index
 * @returns {Element} - The link element
 */
function createCustomLinkElement(link, index) {
  const linkElement = document.createElement('div');
  linkElement.className = 'custom-link-item';
  linkElement.dataset.index = index;

  // Handle separators differently
  if (link.type === 'separator') {
    linkElement.innerHTML = `
      <div class="custom-link-drag-handle" title="Drag to reorder">⋮⋮</div>
      <div class="custom-link-icon">
        <span style="font-size: 16px; color: #9ca3af;">|</span>
      </div>
      <div class="custom-link-info">
        <div class="custom-link-label" style="color: #9ca3af; font-style: italic;">Separator</div>
      </div>
      <div class="custom-link-actions">
        <button class="btn btn-danger" data-action="delete" data-index="${index}">Delete</button>
      </div>
    `;
  } else {
    // Handle custom icons properly
    let iconClass;
    if (link.icon === 'custom' && link.customIcon) {
      // Use the custom icon class directly
      iconClass = link.customIcon;
    } else {
      // Use the regular icon
      iconClass = getIconClassForPopup(link.icon);
    }

  linkElement.innerHTML = `
    <div class="custom-link-drag-handle" title="Drag to reorder">⋮⋮</div>
    <div class="custom-link-icon">
      <i class="${iconClass}" ${link.iconColor && link.iconColor !== '#ffffff' ? `style="color: ${link.iconColor};"` : ''}></i>
    </div>
    <div class="custom-link-info">
      <div class="custom-link-label">${link.label}</div>
      <div class="custom-link-url">${link.url}</div>
    </div>
    <div class="custom-link-actions">
      <button class="btn btn-secondary" data-action="edit" data-index="${index}">Edit</button>
      <button class="btn btn-danger" data-action="delete" data-index="${index}">Delete</button>
    </div>
  `;
  }

  return linkElement;
}

/**
 * Show the link form modal
 * @param {Object} link - Link to edit (optional)
 * @param {number} index - Link index for editing (optional)
 */
function showLinkForm(link = null, index = null) {
  const modal = document.createElement('div');
  modal.className = 'link-form-modal';
  
  const isEditing = link !== null;
  const title = isEditing ? 'Edit Custom Link' : 'Add Custom Link';
  
  modal.innerHTML = `
    <div class="link-form-content">
      <h3 class="link-form-title">${title}</h3>
      
      <div class="form-group">
        <label class="form-label" for="link-label">Label</label>
        <input type="text" id="link-label" class="form-input" placeholder="e.g., Reports" value="${link?.label || ''}" maxlength="20">
      </div>
      
      <div class="form-group">
        <label class="form-label" for="link-url">URL</label>
        <input type="text" id="link-url" class="form-input" placeholder="e.g., /Analytics/ReportBuilder/index.aspx" value="${link?.url || ''}">
        <small style="color: #6b7280; font-size: 11px;">Use relative URLs (e.g., /Analytics/ReportBuilder/index.aspx) or full URLs</small>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="link-icon">Icon</label>
        <div class="fa-icon-grid">
          ${AVAILABLE_ICONS.map(icon => 
            icon.value === 'custom' 
              ? `<div class="fa-icon-option custom-empty-option" data-icon="${icon.value}" title="${icon.label}">
                </div>`
              : `<div class="fa-icon-option" data-icon="${icon.value}" title="${icon.label}">
                  <i class="${getIconClassForPopup(icon.value)}"></i>
                </div>`
          ).join('')}
        </div>
        <div class="custom-icon-section" style="margin-top: 12px; padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; margin-bottom: 6px;">
            <i class="icon-paintbrush" style="margin-right: 6px; color: #6366f1;"></i>
            <span style="font-size: 12px; font-weight: 500; color: #374151;">Custom Icon</span>
          </div>
          <input type="text" id="custom-icon-class" class="form-input" placeholder="e.g., icon-rocket or fa-icon-rocket" value="${link?.customIcon || ''}" style="font-size: 12px;">
          <small style="color: #6b7280; font-size: 10px;">
            Enter any Font Awesome v3 class (e.g., icon-rocket, icon-github, etc.)&emsp;|&emsp;<a href="https://fontawesome.com/v3/icons/" target="_blank" style="color: #3b82f6; text-decoration: underline;">View all available icons →</a>
          </small>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">
          <input type="checkbox" id="open-new-tab" ${link?.openNewTab ? 'checked' : ''} style="margin-right: 8px;">
          Open in new tab
        </label>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="link-tooltip">Tooltip (optional)</label>
        <input type="text" id="link-tooltip" class="form-input" placeholder="e.g., View Reports" value="${link?.tooltip || ''}" maxlength="50">
      </div>
      
      <div class="form-group">
        <label class="form-label" for="link-icon-color-text">Icon Color (optional)</label>
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="text" id="link-icon-color-text" class="form-input" placeholder="#ffffff" value="${link?.iconColor || '#ffffff'}" style="flex: 1; max-width: 150px; font-family: monospace;" pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" autocomplete="off">
          <input type="color" id="link-icon-color" value="${link?.iconColor || '#ffffff'}" style="width: 50px; height: 36px; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; background: var(--bg-primary);" title="Pick a color (values will be in hex format)">
          <button type="button" class="btn btn-secondary" id="reset-icon-color" style="padding: 4px 12px; font-size: 11px;">Reset</button>
        </div>
        <small style="color: var(--text-secondary); font-size: 11px; margin-top: 4px; display: block;">
          Enter a hex color code or use the color picker. Color picker values are returned in hex format. Default is white (#ffffff).
        </small>
      </div>
      
      <div class="form-actions">
        <button class="btn btn-secondary" id="cancel-link-btn">Cancel</button>
        <button class="btn btn-primary" id="save-link-btn" data-index="${index !== null ? index : ''}">${isEditing ? 'Update' : 'Add'} Link</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners for buttons
  const cancelBtn = modal.querySelector('#cancel-link-btn');
  const saveBtn = modal.querySelector('#save-link-btn');
  
  // Setup color picker synchronization
  const colorPicker = modal.querySelector('#link-icon-color');
  const colorText = modal.querySelector('#link-icon-color-text');
  const resetColorBtn = modal.querySelector('#reset-icon-color');
  
  // Sync color picker to text input (color picker always returns hex)
  colorPicker.addEventListener('input', (e) => {
    colorText.value = e.target.value;
  });
  
  // Sync text input to color picker (with validation)
  colorText.addEventListener('input', (e) => {
    const colorValue = e.target.value.trim();
    // Auto-add # if user types without it (for common hex codes)
    if (colorValue.length > 0 && !colorValue.startsWith('#') && /^[A-Fa-f0-9]{3,6}$/.test(colorValue)) {
      e.target.value = '#' + colorValue;
      colorPicker.value = '#' + colorValue;
    } else if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorValue)) {
      // Update color picker if valid hex
      const normalizedColor = colorValue.length === 4 
        ? `#${colorValue[1]}${colorValue[1]}${colorValue[2]}${colorValue[2]}${colorValue[3]}${colorValue[3]}`
        : colorValue;
      colorPicker.value = normalizedColor;
    }
  });
  
  // Reset color button
  resetColorBtn.addEventListener('click', () => {
    colorPicker.value = '#ffffff';
    colorText.value = '#ffffff';
  });
  
  cancelBtn.addEventListener('click', closeLinkForm);
  saveBtn.addEventListener('click', () => {
    const indexAttr = saveBtn.dataset.index;
    const index = indexAttr === '' ? null : parseInt(indexAttr);
    saveCustomLink(index);
  });

  // Handle icon selection
  const iconGrid = modal.querySelector('.fa-icon-grid');
  const customIconInput = modal.querySelector('#custom-icon-class');
  let selectedIconValue = link?.icon || 'link';

  // Handle icon grid clicks
  iconGrid.addEventListener('click', (e) => {
    const iconOption = e.target.closest('.fa-icon-option');
    if (iconOption) {
      const iconValue = iconOption.dataset.icon;
      selectedIconValue = iconValue;
      updateIconGridSelection(iconValue);
    }
  });

  // Handle custom icon input
  customIconInput.addEventListener('input', () => {
    const customClass = customIconInput.value.trim();
    if (customClass) {
      selectedIconValue = 'custom';
      updateIconGridSelection('custom');
    } else {
      // If custom input is cleared, revert to the original icon selection
      selectedIconValue = link?.icon || 'link';
      updateIconGridSelection(selectedIconValue);
    }
  });

  // Initialize icon grid selection
  if (link?.customIcon) {
    updateIconGridSelection('custom');
  } else {
    updateIconGridSelection(selectedIconValue);
  }

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLinkForm();
    }
  });
}

/**
 * Close the link form modal
 */
function closeLinkForm() {
  const modal = document.querySelector('.link-form-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Update icon grid selection highlighting
 * @param {string} selectedIcon - The currently selected icon value
 */
function updateIconGridSelection(selectedIcon) {
  const modal = document.querySelector('.link-form-modal');
  if (!modal) return;
  
  const iconOptions = modal.querySelectorAll('.fa-icon-option');
  iconOptions.forEach(option => {
    if (option.dataset.icon === selectedIcon) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

/**
 * Save a custom link
 * @param {number|null} index - Index for editing, null for adding
 */
async function saveCustomLink(index) {
  const label = document.getElementById('link-label').value.trim();
  const url = document.getElementById('link-url').value.trim();
  const tooltip = document.getElementById('link-tooltip').value.trim();
  const openNewTab = document.getElementById('open-new-tab').checked;
  // Get color from hex text input
  const iconColorText = document.getElementById('link-icon-color-text').value.trim();
  // Validate hex format and normalize (expand 3-digit to 6-digit)
  let iconColor = '#ffffff'; // default
  if (iconColorText) {
    if (/^#([A-Fa-f0-9]{6})$/.test(iconColorText)) {
      iconColor = iconColorText;
    } else if (/^#([A-Fa-f0-9]{3})$/.test(iconColorText)) {
      // Expand 3-digit hex to 6-digit
      iconColor = `#${iconColorText[1]}${iconColorText[1]}${iconColorText[2]}${iconColorText[2]}${iconColorText[3]}${iconColorText[3]}`;
    } else if (/^([A-Fa-f0-9]{6})$/.test(iconColorText)) {
      // Handle hex without #
      iconColor = '#' + iconColorText;
    } else if (/^([A-Fa-f0-9]{3})$/.test(iconColorText)) {
      // Handle 3-digit hex without #
      iconColor = `#${iconColorText[0]}${iconColorText[0]}${iconColorText[1]}${iconColorText[1]}${iconColorText[2]}${iconColorText[2]}`;
    }
  }
  
  // Get selected icon from the modal's selected icon option
  const modal = document.querySelector('.link-form-modal');
  const iconGrid = modal.querySelector('.fa-icon-grid');
  const customIconInput = modal.querySelector('#custom-icon-class');
  const selectedIconOption = iconGrid.querySelector('.fa-icon-option.selected');
  
  let icon = 'link';
  let customIcon = null;
  
  // Check if custom icon input has content
  const customClass = customIconInput.value.trim();
  if (customClass) {
    icon = 'custom';
    customIcon = customClass;
  } else if (selectedIconOption) {
    // Regular icon
    icon = selectedIconOption.dataset.icon;
  }

  // Validation
  if (!label) {
    showValidationModal('Please enter a label for the link.');
    return;
  }
  if (!url) {
    showValidationModal('Please enter a URL for the link.');
    return;
  }
  
  // Check if custom icon is selected but no custom icon class is provided
  if (icon === 'custom' && !customIcon) {
    showValidationModal('Please enter a custom icon class (e.g., icon-rocket, icon-github) in the Custom Icon field.');
    return;
  }

  try {
    console.log('Saving custom link:', { label, url, icon, tooltip, index });
    
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, resetting to empty array:', customLinks);
      customLinks = [];
    }
    
    console.log('Current custom links:', customLinks);

    const linkData = { 
      label, 
      url, 
      icon, 
      tooltip: tooltip || label,
      customIcon,
      openNewTab,
      iconColor: iconColor || '#ffffff'
    };
    console.log('Link data to save:', linkData);

    if (index !== null) {
      // Editing existing link
      if (index >= 0 && index < customLinks.length) {
      customLinks[index] = linkData;
        console.log('Updated link at index', index);
      } else {
        throw new Error(`Invalid index ${index} for editing link`);
      }
    } else {
      // Adding new link - insert at the beginning (top of list = leftmost in header)
      customLinks.unshift(linkData);
      console.log('Added new link at the beginning:', linkData);
    }

    console.log('Saving to storage:', customLinks);
    await chrome.storage.sync.set({ customHeaderLinks: customLinks });
    console.log('Successfully saved to storage');
    
    // If we're adding/updating links and the feature isn't enabled, enable it
    const toggle = document.querySelector('[data-feature="customHeaderLinks"]');
    if (toggle && !toggle.checked) {
      toggle.checked = true;
      await saveSetting('customHeaderLinks', true);
      console.log('Automatically enabled customHeaderLinks feature');
    }
    
    // Notify content script about the change
    try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('csod.com')) {
        await chrome.tabs.sendMessage(tab.id, {
        type: 'CUSTOM_LINKS_UPDATED',
        customLinks: customLinks
      });
        console.log('Notified content script');
      }
    } catch (err) {
      console.log('Could not notify content script (this is okay):', err);
    }

    closeLinkForm();
    await loadCustomLinks();
    console.log('Successfully completed save operation');
  } catch (error) {
    console.error('Error saving custom link:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    showValidationModal(`Error saving custom link: ${error.message}. Please try again.`);
  }
}

/**
 * Edit a custom link
 * @param {number} index - Link index
 */
async function editCustomLink(index) {
  try {
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array - but preserve existing data
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, initializing as empty array but NOT saving:', customLinks);
      customLinks = [];
      // DO NOT save empty array - it might wipe out data during toggle operations
    }
    
    if (index >= 0 && index < customLinks.length) {
      showLinkForm(customLinks[index], index);
    }
  } catch (error) {
    console.error('Error loading custom link for editing:', error);
  }
}

/**
 * Delete a custom link
 * @param {number} index - Link index
 */
async function deleteCustomLink(index) {
  // Check if it's a separator - skip confirmation for separators
  const result = await chrome.storage.sync.get(['customHeaderLinks']);
  const customLinks = result.customHeaderLinks || [];
  const link = customLinks[index];
  
  if (link && link.type === 'separator') {
    // Delete separator without confirmation
    await performDelete(index);
  } else {
    // Show confirmation for regular links
    showDeleteConfirmation(index);
  }
}

/**
 * Show delete confirmation modal
 * @param {number} index - Link index to delete
 */
function showDeleteConfirmation(index) {
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  
  modal.innerHTML = `
    <div class="confirmation-content">
      <h3 class="confirmation-title">Delete Custom Link</h3>
      <p class="confirmation-message">Are you sure you want to delete this custom link? This action cannot be undone.</p>
      
      <div class="confirmation-actions">
        <button class="btn btn-secondary" id="cancel-delete-btn">Cancel</button>
        <button class="btn btn-danger" id="confirm-delete-btn" data-index="${index}">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners for buttons
  const cancelBtn = modal.querySelector('#cancel-delete-btn');
  const confirmBtn = modal.querySelector('#confirm-delete-btn');
  
  cancelBtn.addEventListener('click', closeDeleteConfirmation);
  confirmBtn.addEventListener('click', async () => {
    const indexToDelete = parseInt(confirmBtn.dataset.index);
    closeDeleteConfirmation();
    await performDelete(indexToDelete);
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeDeleteConfirmation();
    }
  });
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteConfirmation() {
  const modal = document.querySelector('.confirmation-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Show remove all confirmation modal
 */
function showRemoveAllConfirmation() {
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  
  modal.innerHTML = `
    <div class="confirmation-content">
      <h3 class="confirmation-title">Remove All Custom Links</h3>
      <p class="confirmation-message">Are you sure you want to delete ALL custom links and separators? This action cannot be undone.</p>
      
      <div class="confirmation-actions">
        <button class="btn btn-secondary" id="cancel-remove-all-btn">Cancel</button>
        <button class="btn btn-danger" id="confirm-remove-all-btn">Remove All</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners for buttons
  const cancelBtn = modal.querySelector('#cancel-remove-all-btn');
  const confirmBtn = modal.querySelector('#confirm-remove-all-btn');
  
  cancelBtn.addEventListener('click', closeRemoveAllConfirmation);
  confirmBtn.addEventListener('click', async () => {
    closeRemoveAllConfirmation();
    await performRemoveAll();
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeRemoveAllConfirmation();
    }
  });
}

/**
 * Close the remove all confirmation modal
 */
function closeRemoveAllConfirmation() {
  const modal = document.querySelector('.confirmation-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * Show a custom alert dialog (replaces alert())
 * @param {string} message - The alert message
 * @param {string} title - The dialog title (optional)
 * @returns {Promise<void>} - Promise that resolves when the dialog is closed
 */
function showAlertDialog(message, title = 'Alert') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    modal.innerHTML = `
      <div class="confirmation-content">
        <h3 class="confirmation-title">${title}</h3>
        <p class="confirmation-message">${message.replace(/\n/g, '<br>')}</p>
        
        <div class="confirmation-actions">
          <button class="btn btn-primary" id="ok-alert-btn">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listener for OK button
    const okBtn = modal.querySelector('#ok-alert-btn');
    
    const closeModal = () => {
      modal.remove();
      resolve();
    };
    
    okBtn.addEventListener('click', () => {
      closeModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Close modal on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Focus the OK button for keyboard accessibility
    okBtn.focus();
  });
}

/**
 * Show a custom confirmation dialog (replaces confirm())
 * @param {string} message - The confirmation message
 * @param {string} title - The dialog title (optional)
 * @returns {Promise<boolean>} - Promise that resolves to true if confirmed, false if cancelled
 */
function showConfirmationDialog(message, title = 'Confirm Action') {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    
    modal.innerHTML = `
      <div class="confirmation-content">
        <h3 class="confirmation-title">${title}</h3>
        <p class="confirmation-message">${message.replace(/\n/g, '<br>')}</p>
        
        <div class="confirmation-actions">
          <button class="btn btn-secondary" id="cancel-confirm-btn">Cancel</button>
          <button class="btn btn-primary" id="confirm-confirm-btn">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners for buttons
    const cancelBtn = modal.querySelector('#cancel-confirm-btn');
    const confirmBtn = modal.querySelector('#confirm-confirm-btn');
    
    const closeModal = () => {
      modal.remove();
    };
    
    cancelBtn.addEventListener('click', () => {
      closeModal();
      resolve(false);
    });
    
    confirmBtn.addEventListener('click', () => {
      closeModal();
      resolve(true);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
        resolve(false);
      }
    });
    
    // Close modal on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        resolve(false);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  });
}

/**
 * Perform the remove all operation
 */
async function performRemoveAll() {
  try {
    // Clear the custom links array
    await chrome.storage.sync.set({ customHeaderLinks: [] });
    
    // Notify content script about the change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('csod.com')) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CUSTOM_LINKS_UPDATED',
          customLinks: []
        });
      } catch (err) {
        console.log('Content script not ready:', err);
        // Don't fail the operation if content script isn't ready
      }
    }
    
    // Reload the UI to reflect the changes
    await loadCustomLinks();
    
    console.log('Successfully removed all custom links');
  } catch (error) {
    console.error('Error removing all custom links:', error);
    console.error('Error stack:', error.stack);
    showValidationModal(`Error removing all custom links: ${error.message}. Please try again.`);
  }
}


/**
 * Perform the actual delete operation
 * @param {number} index - Link index to delete
 */
async function performDelete(index) {
  try {
    const result = await chrome.storage.sync.get(['customHeaderLinks']);
    let customLinks = result.customHeaderLinks;
    
    // Ensure customLinks is always an array - but preserve existing data
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, initializing as empty array but NOT saving:', customLinks);
      customLinks = [];
      // DO NOT save empty array - it might wipe out data during toggle operations
    }
    
    if (index >= 0 && index < customLinks.length) {
      customLinks.splice(index, 1);
      await chrome.storage.sync.set({ customHeaderLinks: customLinks });
      
      // Notify content script about the change
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('csod.com')) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'CUSTOM_LINKS_UPDATED',
          customLinks: customLinks
        }).catch(err => {
          console.log('Content script not ready:', err);
        });
      }
      
      loadCustomLinks();
    }
  } catch (error) {
    console.error('Error deleting custom link:', error);
    showValidationModal('Error deleting custom link. Please try again.');
  }
}

/**
 * Setup custom link icon size control
 */
function setupCustomLinkIconSizeControl() {
  const sizeSlider = document.getElementById('custom-link-icon-size');
  const sizeValue = document.getElementById('custom-link-icon-size-value');
  
  if (!sizeSlider || !sizeValue) return;
  
  // Load saved icon size value
  chrome.storage.sync.get(['customLinkIconSize'], (result) => {
    const savedSize = result.customLinkIconSize || 20;
    sizeSlider.value = savedSize;
    sizeValue.textContent = `${savedSize}px`;
    applyCustomLinkIconSize(savedSize);
  });
  
  // Handle slider changes
  sizeSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    sizeValue.textContent = `${size}px`;
    
    // Save to storage (storage listener will apply the change)
    chrome.storage.sync.set({ customLinkIconSize: size });
    
    // Also send direct message for immediate update
    applyCustomLinkIconSize(size);
  });
  
  // Handle reset button
  const resetButton = document.getElementById('reset-custom-link-icon-size');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      sizeSlider.value = 20;
      sizeValue.textContent = '20px';
      
      // Save to storage (storage listener will apply the change)
      chrome.storage.sync.set({ customLinkIconSize: 20 });
      
      // Also send direct message for immediate update
      applyCustomLinkIconSize(20);
    });
  }
}

/**
 * Apply custom link icon size to the page
 * @param {number} size - Icon size in pixels
 */
function applyCustomLinkIconSize(size) {
  // Send message to content script to apply the size
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('csod.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'APPLY_CUSTOM_LINK_ICON_SIZE',
        size: size
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
  });
}

/**
 * Setup header padding control
 */
function setupHeaderPaddingControl() {
  const paddingSlider = document.getElementById('header-padding');
  const paddingValue = document.getElementById('header-padding-value');
  
  if (!paddingSlider || !paddingValue) return;
  
  // Load saved padding value
  chrome.storage.sync.get(['headerPadding'], (result) => {
    const savedPadding = result.headerPadding || 16;
    paddingSlider.value = savedPadding;
    paddingValue.textContent = `${savedPadding}px`;
    applyHeaderPadding(savedPadding);
  });
  
  // Handle slider changes
  paddingSlider.addEventListener('input', (e) => {
    const padding = parseInt(e.target.value);
    paddingValue.textContent = `${padding}px`;
    applyHeaderPadding(padding);
    
    // Save to storage
    chrome.storage.sync.set({ headerPadding: padding });
    
    // Notify content script
    notifyContentScript('headerPadding', padding);
  });
  
  // Handle reset button
  const resetButton = document.getElementById('reset-header-padding');
  resetButton.addEventListener('click', () => {
    paddingSlider.value = 16;
    paddingValue.textContent = '16px';
    applyHeaderPadding(16);
    
    // Save to storage
    chrome.storage.sync.set({ headerPadding: 16 });
    
    // Notify content script
    notifyContentScript('headerPadding', 16);
  });
}

/**
 * Apply header padding to the page
 * @param {number} padding - Padding value in pixels
 */
function applyHeaderPadding(padding) {
  // Send message to content script to apply the padding
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('csod.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'APPLY_HEADER_PADDING',
        padding: padding
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
  });
}

/**
 * Setup AI icon size control
 */
function setupAIIconSizeControl() {
  const sizeSlider = document.getElementById('ai-icon-size');
  const sizeValue = document.getElementById('ai-icon-size-value');
  const configSection = document.getElementById('ai-icon-size-config');
  
  if (!sizeSlider || !sizeValue || !configSection) return;
  
  // Only setup if config section is visible
  if (configSection.style.display === 'none') return;
  
  // Load saved size value
  chrome.storage.sync.get(['resizeAIIconSize'], (result) => {
    const savedSize = result.resizeAIIconSize || 32;
    sizeSlider.value = savedSize;
    sizeValue.textContent = `${savedSize}px`;
    applyAIIconSize(savedSize);
  });
  
  // Handle slider changes
  sizeSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    sizeValue.textContent = `${size}px`;
    applyAIIconSize(size);
    
    // Save to storage (this will trigger the enhancement via storage listener)
    chrome.storage.sync.set({ resizeAIIconSize: size });
  });
  
  // Handle reset button
  const resetButton = document.getElementById('reset-ai-icon-size');
  if (resetButton) {
    resetButton.addEventListener('click', async () => {
      sizeSlider.value = 32;
      sizeValue.textContent = '32px';
      
      // Reset icon size and restore margins
      resetAIIcon();
      
      // Turn off the toggle to keep margins restored
      const toggle = document.getElementById('resize-ai-icon');
      if (toggle && toggle.checked) {
        toggle.checked = false;
        await saveSetting('resizeAIIcon', false);
        await notifyContentScript('resizeAIIcon', false);
        
        // Hide config section
        const config = document.getElementById('ai-icon-size-config');
        if (config) config.style.display = 'none';
      }
      
      // Save to storage (this will trigger the enhancement via storage listener)
      chrome.storage.sync.set({ resizeAIIconSize: 32 });
    });
  }
}

/**
 * Apply AI icon size to the page
 * @param {number} size - Icon size in pixels
 */
function applyAIIconSize(size) {
  // Send message to content script to apply the size
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('csod.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'APPLY_AI_ICON_SIZE',
        size: size
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
  });
}

/**
 * Reset AI icon to default size and restore margins
 */
function resetAIIcon() {
  // Send message to content script to reset the icon
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('csod.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'RESET_AI_ICON'
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
  });
}

/**
 * Check if AI icon is available on the current page
 */
async function checkAIIconAvailability() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('csod.com')) {
      // Not on a CSOD page - hide the toggle
      updateAIIconToggleAvailability(false);
      return;
    }
    
    // Try to get AI icon status from content script via message passing
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_AI_ICON_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be ready, try script injection as fallback
          console.log('Content script not responding, trying script injection:', chrome.runtime.lastError.message);
          checkAIIconViaScriptInjection(tab.id);
        } else if (response && typeof response === 'object') {
          // Icon found - show toggle
          const iconFound = response.iconFound === true;
          console.log('AI icon status:', iconFound);
          updateAIIconToggleAvailability(iconFound);
        } else {
          // No response or unexpected format - hide toggle
          console.log('No response or unexpected format, trying script injection');
          checkAIIconViaScriptInjection(tab.id);
        }
      });
    } catch (msgError) {
      console.error('Error sending message to content script:', msgError);
      // Fallback to script injection
      checkAIIconViaScriptInjection(tab.id);
    }
    
  } catch (error) {
    console.error('Error checking AI icon availability:', error);
    // On error, hide toggle
    updateAIIconToggleAvailability(false);
  }
}

/**
 * Fallback function to check AI icon via script injection
 */
async function checkAIIconViaScriptInjection(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      code: `
        (function() {
          const icon = document.querySelector('.csxGalaxyAIAnnouncement-icon');
          return icon !== null;
        })();
      `
    });
    
    const iconExists = results && results[0] && results[0].result === true;
    updateAIIconToggleAvailability(iconExists);
  } catch (error) {
    console.error('Script injection also failed:', error);
    // On error, hide toggle
    updateAIIconToggleAvailability(false);
  }
}

/**
 * Update AI icon toggle availability based on icon presence
 * @param {boolean} available - Whether the AI icon was found
 */
function updateAIIconToggleAvailability(available) {
  aiIconAvailable = available;
  const toggleItem = document.getElementById('resize-ai-icon-item');
  const configSection = document.getElementById('ai-icon-size-config');
  
  if (toggleItem) {
    toggleItem.style.display = available ? 'flex' : 'none';
  }
  
  // Always hide config if icon not available, regardless of toggle state
  if (configSection) {
    if (!available) {
      configSection.style.display = 'none';
    } else {
      // Icon is available - show config only if toggle is enabled
      const toggle = document.getElementById('resize-ai-icon');
      if (toggle && toggle.checked) {
        configSection.style.display = 'block';
      } else {
        configSection.style.display = 'none';
      }
    }
  }
  
  // Update Header Icons section visibility
  updateHeaderIconsSectionVisibility();
}

/**
 * Setup Pinned Links icon size control
 */
function setupPinnedLinksIconSizeControl() {
  const sizeSlider = document.getElementById('pinned-links-icon-size');
  const sizeValue = document.getElementById('pinned-links-icon-size-value');
  const configSection = document.getElementById('pinned-links-icon-size-config');
  
  if (!sizeSlider || !sizeValue || !configSection) return;
  
  // Only setup if config section is visible
  if (configSection.style.display === 'none') return;
  
  // Load saved size value
  chrome.storage.sync.get(['resizePinnedLinksIconSize'], (result) => {
    const savedSize = result.resizePinnedLinksIconSize || 22;
    sizeSlider.value = savedSize;
    sizeValue.textContent = `${savedSize}px`;
    applyPinnedLinksIconSize(savedSize);
  });
  
  // Handle slider changes
  sizeSlider.addEventListener('input', (e) => {
    const size = parseInt(e.target.value);
    sizeValue.textContent = `${size}px`;
    applyPinnedLinksIconSize(size);
    
    // Save to storage (this will trigger the enhancement via storage listener)
    chrome.storage.sync.set({ resizePinnedLinksIconSize: size });
  });
  
  // Handle reset button
  const resetButton = document.getElementById('reset-pinned-links-icon-size');
  if (resetButton) {
    resetButton.addEventListener('click', async () => {
      sizeSlider.value = 22;
      sizeValue.textContent = '22px';
      
      // Reset icon size and restore margins
      resetPinnedLinksIcon();
      
      // Turn off the toggle to keep margins restored
      const toggle = document.getElementById('resize-pinned-links-icon');
      if (toggle && toggle.checked) {
        toggle.checked = false;
        await saveSetting('resizePinnedLinksIcon', false);
        await notifyContentScript('resizePinnedLinksIcon', false);
        
        // Hide config section
        const config = document.getElementById('pinned-links-icon-size-config');
        if (config) config.style.display = 'none';
      }
      
      // Save to storage (this will trigger the enhancement via storage listener)
      chrome.storage.sync.set({ resizePinnedLinksIconSize: 22 });
    });
  }
}

/**
 * Apply Pinned Links icon size to the page
 * @param {number} size - Icon size in pixels
 */
function applyPinnedLinksIconSize(size) {
  // Send message to content script to apply the size
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('csod.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'APPLY_PINNED_LINKS_ICON_SIZE',
        size: size
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
  });
}

/**
 * Reset Pinned Links icon to default size and restore margins
 */
function resetPinnedLinksIcon() {
  // Send message to content script to reset the icon
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('csod.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'RESET_PINNED_LINKS_ICON'
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
  });
}

/**
 * Check if Pinned Links icon is available on the current page
 */
async function checkPinnedLinksIconAvailability() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('csod.com')) {
      // Not on a CSOD page - hide the toggle
      updatePinnedLinksIconToggleAvailability(false);
      return;
    }
    
    // Try to get Pinned Links icon status from content script via message passing
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PINNED_LINKS_ICON_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be ready, try script injection as fallback
          console.log('Content script not responding, trying script injection:', chrome.runtime.lastError.message);
          checkPinnedLinksIconViaScriptInjection(tab.id);
        } else if (response && typeof response === 'object') {
          // Icon found - show toggle
          const iconFound = response.iconFound === true;
          console.log('Pinned Links icon status:', iconFound);
          updatePinnedLinksIconToggleAvailability(iconFound);
        } else {
          // No response or unexpected format - hide toggle
          console.log('No response or unexpected format, trying script injection');
          checkPinnedLinksIconViaScriptInjection(tab.id);
        }
      });
    } catch (msgError) {
      console.error('Error sending message to content script:', msgError);
      // Fallback to script injection
      checkPinnedLinksIconViaScriptInjection(tab.id);
    }
    
  } catch (error) {
    console.error('Error checking Pinned Links icon availability:', error);
    // On error, hide toggle
    updatePinnedLinksIconToggleAvailability(false);
  }
}

/**
 * Fallback function to check Pinned Links icon via script injection
 */
async function checkPinnedLinksIconViaScriptInjection(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      code: `
        (function() {
          const icon = document.querySelector('.quickLinksTooltip-icon');
          return icon !== null;
        })();
      `
    });
    
    const iconExists = results && results[0] && results[0].result === true;
    updatePinnedLinksIconToggleAvailability(iconExists);
  } catch (error) {
    console.error('Script injection also failed:', error);
    // On error, hide toggle
    updatePinnedLinksIconToggleAvailability(false);
  }
}

/**
 * Update Pinned Links icon toggle availability based on icon presence
 * @param {boolean} available - Whether the Pinned Links icon was found
 */
function updatePinnedLinksIconToggleAvailability(available) {
  pinnedLinksIconAvailable = available;
  const toggleItem = document.getElementById('resize-pinned-links-icon-item');
  const configSection = document.getElementById('pinned-links-icon-size-config');
  
  if (toggleItem) {
    toggleItem.style.display = available ? 'flex' : 'none';
  }
  
  // Always hide config if icon not available, regardless of toggle state
  if (configSection) {
    if (!available) {
      configSection.style.display = 'none';
    } else {
      // Icon is available - show config only if toggle is enabled
      const toggle = document.getElementById('resize-pinned-links-icon');
      if (toggle && toggle.checked) {
        configSection.style.display = 'block';
      } else {
        configSection.style.display = 'none';
      }
    }
  }
  
  // Update Header Icons section visibility
  updateHeaderIconsSectionVisibility();
}

/**
 * Update Header Icons section visibility based on icon availability
 * Hide the section if both icons are not available
 */
function updateHeaderIconsSectionVisibility() {
  const headerIconsSection = document.getElementById('header-icons-section');
  
  if (headerIconsSection) {
    // Show section if at least one icon is available, hide if both are unavailable
    if (aiIconAvailable || pinnedLinksIconAvailable) {
      headerIconsSection.style.display = 'block';
    } else {
      headerIconsSection.style.display = 'none';
    }
  }
}

/**
 * Show a validation/error modal
 * @param {string} message - The message to display
 */
function showValidationModal(message) {
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  
  modal.innerHTML = `
    <div class="confirmation-content">
      <h3 class="confirmation-title">Notice</h3>
      <p class="confirmation-message">${message}</p>
      
      <div class="confirmation-actions">
        <button class="btn btn-primary" id="ok-validation-btn">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listener for OK button
  const okBtn = modal.querySelector('#ok-validation-btn');
  okBtn.addEventListener('click', () => {
    modal.remove();
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Setup sessions checkbox defaults management
 */
function setupSessionsCheckboxManagement() {
  console.log('Sessions Checkbox Management: Setting up...');
  
  // Load saved checkbox defaults
  loadSessionsCheckboxDefaults();
  
  console.log('Sessions Checkbox Management: Setup complete');
}

/**
 * Setup event listeners for sessions checkbox defaults
 */
function setupSessionsCheckboxEventListeners() {
  console.log('Sessions Checkbox Event Listeners: Setting up...');
  
  // Check if listeners are already set up to avoid duplicates
  if (window.sessionsCheckboxListenersSetup) {
    console.log('Sessions Checkbox Event Listeners: Already set up, skipping');
    return;
  }
  
  // Setup event listeners for checkbox changes
  const checkboxes = document.querySelectorAll('#sessions-checkbox-management input[data-status]');
  console.log(`Sessions Checkbox Event Listeners: Found ${checkboxes.length} checkboxes`);
  
  if (checkboxes.length === 0) {
    console.log('Sessions Checkbox Event Listeners: No checkboxes found, skipping');
    return;
  }
  
  checkboxes.forEach(checkbox => {
    console.log(`Sessions Checkbox Event Listeners: Setting up listener for ${checkbox.dataset.status}`);
    checkbox.addEventListener('change', async (event) => {
      const status = event.target.dataset.status;
      const checked = event.target.checked;
      
      console.log(`Sessions Checkbox Event Listeners: Checkbox ${status} changed to ${checked}`);
      
      await saveSessionsCheckboxDefault(status, checked);
      await notifyContentScript('sessionsCheckboxDefaults', 'update');
    });
  });
  
  // Mark as set up
  window.sessionsCheckboxListenersSetup = true;
  
  // Add test button listener
  const testButton = document.getElementById('test-checkboxes');
  if (testButton) {
    testButton.addEventListener('click', () => {
      console.log('=== MANUAL CHECKBOX TEST ===');
      const checkboxes = document.querySelectorAll('#sessions-checkbox-management input[data-status]');
      console.log('Found checkboxes:', checkboxes.length);
      
      checkboxes.forEach((cb, i) => {
        console.log(`Before: Checkbox ${i} (${cb.dataset.status}) checked=${cb.checked}`);
        cb.checked = !cb.checked; // Toggle
        console.log(`After: Checkbox ${i} (${cb.dataset.status}) checked=${cb.checked}`);
      });
      
      // Test storage
      chrome.storage.sync.get(['sessionsCheckboxDefaultsSettings'], (result) => {
        console.log('Current storage:', result);
      });
      console.log('=== END MANUAL TEST ===');
    });
  }
  
  console.log('Sessions Checkbox Event Listeners: Setup complete');
}

/**
 * Load sessions checkbox defaults from storage
 */
async function loadSessionsCheckboxDefaults() {
  try {
    console.log('Sessions Checkbox Defaults: Loading settings from storage...');
    const result = await chrome.storage.sync.get(['sessionsCheckboxDefaultsSettings']);
    console.log('Sessions Checkbox Defaults: Raw storage result:', result);
    
    const defaults = result.sessionsCheckboxDefaultsSettings || {
      tentative: true,
      approved: true,
      completed: false,
      cancelled: false
    };
    
    console.log('Sessions Checkbox Defaults: Using defaults:', defaults);
    
    // Update UI checkboxes
    Object.keys(defaults).forEach(status => {
      const checkbox = document.getElementById(`default-${status}`);
      console.log(`Sessions Checkbox Defaults: Looking for checkbox default-${status}:`, checkbox);
      if (checkbox) {
        console.log(`Sessions Checkbox Defaults: Setting ${status} checkbox to ${defaults[status]}`);
        checkbox.checked = defaults[status];
      } else {
        console.log(`Sessions Checkbox Defaults: Checkbox default-${status} not found!`);
      }
    });
    
    console.log('Sessions Checkbox Defaults: Loaded settings:', defaults);
  } catch (error) {
    console.error('Sessions Checkbox Defaults: Error loading settings:', error);
  }
}

/**
 * Save a single checkbox default to storage
 * @param {string} status - The status type (tentative, approved, completed, cancelled)
 * @param {boolean} checked - Whether the checkbox should be checked by default
 */
async function saveSessionsCheckboxDefault(status, checked) {
  try {
    console.log(`Sessions Checkbox Defaults: Attempting to save ${status} = ${checked}`);
    
    const result = await chrome.storage.sync.get(['sessionsCheckboxDefaultsSettings']);
    console.log('Sessions Checkbox Defaults: Current storage result:', result);
    
    const defaults = result.sessionsCheckboxDefaultsSettings || {
      tentative: true,
      approved: true,
      completed: false,
      cancelled: false
    };
    
    console.log('Sessions Checkbox Defaults: Before update:', defaults);
    defaults[status] = checked;
    console.log('Sessions Checkbox Defaults: After update:', defaults);
    
    await chrome.storage.sync.set({ sessionsCheckboxDefaultsSettings: defaults });
    
    console.log(`Sessions Checkbox Defaults: Successfully saved ${status} = ${checked}`);
  } catch (error) {
    console.error('Sessions Checkbox Defaults: Error saving setting:', error);
  }
}

/**
 * Setup user status dropdown defaults management
 */
function setupUserStatusDropdownManagement() {
  console.log('User Status Dropdown Management: Setting up...');
  
  // Load saved dropdown defaults
  loadUserStatusDropdownDefaults();
  
  console.log('User Status Dropdown Management: Setup complete');
}

/**
 * Setup event listeners for user status dropdown defaults
 */
function setupUserStatusDropdownEventListeners() {
  console.log('User Status Dropdown Event Listeners: Setting up...');
  
  // Check if listeners are already set up to avoid duplicates
  if (window.userStatusDropdownListenersSetup) {
    console.log('User Status Dropdown Event Listeners: Already set up, skipping');
    return;
  }
  
  // Setup event listeners for dropdown changes
  const dropdown = document.getElementById('user-status-default-select');
  console.log(`User Status Dropdown Event Listeners: Found dropdown:`, dropdown);
  
  if (!dropdown) {
    console.log('User Status Dropdown Event Listeners: No dropdown found, skipping');
    return;
  }
  
  dropdown.addEventListener('change', async (event) => {
    const selectedValue = event.target.value;
    
    console.log(`User Status Dropdown Event Listeners: Dropdown changed to ${selectedValue}`);
    
    await saveUserStatusDropdownDefault(selectedValue);
    await notifyContentScript('userStatusDropdownDefaults', 'update');
  });
  
  // Mark as set up
  window.userStatusDropdownListenersSetup = true;
  
  console.log('User Status Dropdown Event Listeners: Setup complete');
}

/**
 * Load user status dropdown defaults from storage
 */
async function loadUserStatusDropdownDefaults() {
  try {
    console.log('User Status Dropdown Defaults: Loading settings from storage...');
    const result = await chrome.storage.sync.get(['userStatusDropdownDefaultsSettings']);
    console.log('User Status Dropdown Defaults: Raw storage result:', result);
    
    const defaultSelected = result.userStatusDropdownDefaultsSettings || '1';
    
    // If no saved setting exists, set to first option
    if (!result.userStatusDropdownDefaultsSettings) {
      await chrome.storage.sync.set({ userStatusDropdownDefaultsSettings: '1' });
    }
    
    console.log('User Status Dropdown Defaults: Using default:', defaultSelected);
    
    // Update UI dropdown
    const dropdown = document.getElementById('user-status-default-select');
    console.log(`User Status Dropdown Defaults: Looking for dropdown:`, dropdown);
    if (dropdown) {
      console.log(`User Status Dropdown Defaults: Setting dropdown to ${defaultSelected}`);
      dropdown.value = defaultSelected;
    } else {
      console.log(`User Status Dropdown Defaults: Dropdown not found!`);
    }
    
    console.log('User Status Dropdown Defaults: Loaded settings:', defaultSelected);
  } catch (error) {
    console.error('User Status Dropdown Defaults: Error loading settings:', error);
  }
}

/**
 * Save user status dropdown default to storage
 * @param {string} selectedValue - The selected value (active, inactive, pendingApproval, pending, all)
 */
async function saveUserStatusDropdownDefault(selectedValue) {
  try {
    console.log(`User Status Dropdown Defaults: Attempting to save ${selectedValue} as selected`);
    
    await chrome.storage.sync.set({ userStatusDropdownDefaultsSettings: selectedValue });
    
    console.log(`User Status Dropdown Defaults: Successfully saved ${selectedValue} as selected`);
  } catch (error) {
    console.error('User Status Dropdown Defaults: Error saving setting:', error);
  }
}

/**
 * Check if we're on the Users page
 */
async function checkUsersPageAvailability() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('csod.com')) {
      return false;
    }
    
    return tab.url.includes('admin/Users');
  } catch (error) {
    console.error('Error checking Users page availability:', error);
    return false;
  }
}

/**
 * Update OU Type dropdown UI based on page availability
 */
async function updateOuTypeDropdownAvailability() {
  const managementSection = document.getElementById('user-ou-type-dropdown-management');
  const warningMessage = document.getElementById('user-ou-type-page-warning');
  const dropdown = document.getElementById('user-ou-type-default-select');
  
  if (!managementSection || !warningMessage || !dropdown) {
    return;
  }
  
  // Only update if the management section is visible
  if (managementSection.style.display === 'none') {
    return;
  }
  
  const isOnUsersPage = await checkUsersPageAvailability();
  
  if (isOnUsersPage) {
    // On Users page - hide warning, enable dropdown
    warningMessage.style.display = 'none';
    dropdown.disabled = false;
  } else {
    // Not on Users page - show warning, disable dropdown
    warningMessage.style.display = 'block';
    dropdown.disabled = true;
    
    // Setup click handler for the Users link
    const usersLink = warningMessage.querySelector('a');
    if (usersLink) {
      // Remove any existing event listeners by cloning and replacing
      const newLink = usersLink.cloneNode(true);
      usersLink.parentNode.replaceChild(newLink, usersLink);
      
      // Add click handler to open Users page in new tab
      newLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.url && tab.url.includes('csod.com')) {
            const url = new URL(tab.url);
            const usersUrl = `${url.origin}/admin/Users.aspx`;
            await chrome.tabs.create({ url: usersUrl });
          }
        } catch (error) {
          console.error('Error opening Users page:', error);
        }
      });
    }
  }
}

/**
 * Query the page for available OU Type dropdown options
 */
async function loadOuTypeOptionsFromPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('csod.com')) {
      console.log('OU Type Options: Not on CSOD page, using default options');
      return null;
    }
    
    // Only query if on Users page
    if (!tab.url.includes('admin/Users')) {
      console.log('OU Type Options: Not on Users page');
      return null;
    }
    
    // Try to get options from content script via message passing
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_OU_TYPE_OPTIONS' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be ready, try script injection as fallback
          console.log('Content script not responding, trying script injection...');
          loadOuTypeOptionsViaScriptInjection(tab.id).then(resolve).catch(() => resolve(null));
        } else if (response && response.options && Array.isArray(response.options) && response.options.length > 0) {
          resolve(response.options);
        } else {
          console.log('OU Type Options: No options found from content script');
          // Fallback to script injection
          loadOuTypeOptionsViaScriptInjection(tab.id).then(resolve).catch(() => resolve(null));
        }
      });
    });
  } catch (error) {
    console.error('OU Type Options: Error querying page:', error);
    return null;
  }
}

/**
 * Fallback: Query OU Type options via script injection
 */
async function loadOuTypeOptionsViaScriptInjection(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const dropdown = document.getElementById('ouFilter_ouFilterSelector_ddlTypesList') ||
                         document.querySelector('select[data-tag="ddlTypesList"]');
        
        if (!dropdown) {
          return null;
        }
        
        const options = [];
        const optionElements = dropdown.querySelectorAll('option');
        
        optionElements.forEach(option => {
          options.push({
            value: option.value,
            text: option.textContent.trim()
          });
        });
        
        return options.length > 0 ? options : null;
      }
    });
    
    if (results && results[0] && results[0].result) {
      return results[0].result;
    }
    
    return null;
  } catch (error) {
    console.error('OU Type Options: Error with script injection:', error);
    return null;
  }
}

/**
 * Populate OU Type dropdown in popup with options from page
 */
async function populateOuTypeDropdown() {
  const dropdown = document.getElementById('user-ou-type-default-select');
  if (!dropdown) {
    console.log('OU Type Dropdown: Dropdown not found in popup');
    return;
  }
  
  // Query page for options
  const options = await loadOuTypeOptionsFromPage();
  
  if (options && options.length > 0) {
    console.log('OU Type Dropdown: Found', options.length, 'options from page');
    
    // Store current selection
    const currentValue = dropdown.value;
    
    // Clear existing options (except the first one if it's a placeholder)
    dropdown.innerHTML = '';
    
    // Add options from page
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      dropdown.appendChild(optionElement);
    });
    
    // Restore previous selection if it still exists, otherwise use first option
    if (dropdown.querySelector(`option[value="${currentValue}"]`)) {
      dropdown.value = currentValue;
    } else if (dropdown.options.length > 0) {
      dropdown.value = dropdown.options[0].value;
    }
    
    console.log('OU Type Dropdown: Populated with options from page');
  } else {
    console.log('OU Type Dropdown: No options found from page, using default options');
  }
}

/**
 * Setup user OU type dropdown defaults management
 */
async function setupUserOuTypeDropdownManagement() {
  console.log('User OU Type Dropdown Management: Setting up...');
  
  // Update UI based on page availability
  await updateOuTypeDropdownAvailability();
  
  // Populate dropdown with options from page (only if on Users page)
  await populateOuTypeDropdown();
  
  // Load saved dropdown defaults
  await loadUserOuTypeDropdownDefaults();
  
  console.log('User OU Type Dropdown Management: Setup complete');
}

/**
 * Setup event listeners for user OU type dropdown defaults
 */
function setupUserOuTypeDropdownEventListeners() {
  console.log('User OU Type Dropdown Event Listeners: Setting up...');
  
  // Check if listeners are already set up to avoid duplicates
  if (window.userOuTypeDropdownListenersSetup) {
    console.log('User OU Type Dropdown Event Listeners: Already set up, skipping');
    return;
  }
  
  // Setup event listeners for dropdown changes
  const dropdown = document.getElementById('user-ou-type-default-select');
  console.log(`User OU Type Dropdown Event Listeners: Found dropdown:`, dropdown);
  
  if (!dropdown) {
    console.log('User OU Type Dropdown Event Listeners: No dropdown found, skipping');
    return;
  }
  
  dropdown.addEventListener('change', async (event) => {
    const selectedValue = event.target.value;
    
    console.log(`User OU Type Dropdown Event Listeners: Dropdown changed to ${selectedValue}`);
    
    await saveUserOuTypeDropdownDefault(selectedValue);
    await notifyContentScript('userOuTypeDropdownDefaults', 'update');
  });
  
  // Mark as set up
  window.userOuTypeDropdownListenersSetup = true;
  
  console.log('User OU Type Dropdown Event Listeners: Setup complete');
}

/**
 * Load user OU type dropdown defaults from storage
 */
async function loadUserOuTypeDropdownDefaults() {
  try {
    console.log('User OU Type Dropdown Defaults: Loading settings from storage...');
    const result = await chrome.storage.sync.get(['userOuTypeDropdownDefaultsSettings']);
    console.log('User OU Type Dropdown Defaults: Raw storage result:', result);
    
    const defaultSelected = result.userOuTypeDropdownDefaultsSettings || '-2';
    
    // If no saved setting exists, set to first option
    if (!result.userOuTypeDropdownDefaultsSettings) {
      await chrome.storage.sync.set({ userOuTypeDropdownDefaultsSettings: '-2' });
    }
    
    console.log('User OU Type Dropdown Defaults: Using default:', defaultSelected);
    
    // Update UI dropdown
    const dropdown = document.getElementById('user-ou-type-default-select');
    console.log(`User OU Type Dropdown Defaults: Looking for dropdown:`, dropdown);
    if (dropdown) {
      console.log(`User OU Type Dropdown Defaults: Setting dropdown to ${defaultSelected}`);
      dropdown.value = defaultSelected;
    } else {
      console.log(`User OU Type Dropdown Defaults: Dropdown not found!`);
    }
    
    console.log('User OU Type Dropdown Defaults: Loaded settings:', defaultSelected);
  } catch (error) {
    console.error('User OU Type Dropdown Defaults: Error loading settings:', error);
  }
}

/**
 * Save user OU type dropdown default to storage
 * @param {string} selectedValue - The selected value
 */
async function saveUserOuTypeDropdownDefault(selectedValue) {
  try {
    console.log(`User OU Type Dropdown Defaults: Attempting to save ${selectedValue} as selected`);
    
    await chrome.storage.sync.set({ userOuTypeDropdownDefaultsSettings: selectedValue });
    
    console.log(`User OU Type Dropdown Defaults: Successfully saved ${selectedValue} as selected`);
  } catch (error) {
    console.error('User OU Type Dropdown Defaults: Error saving setting:', error);
  }
}

/**
 * Setup user country dropdown defaults management
 */
function setupUserCountryDropdownManagement() {
  console.log('User Country Dropdown Management: Setting up...');
  
  // Load saved dropdown defaults
  loadUserCountryDropdownDefaults();
  
  console.log('User Country Dropdown Management: Setup complete');
}

/**
 * Setup event listeners for user country dropdown defaults
 */
function setupUserCountryDropdownEventListeners() {
  console.log('User Country Dropdown Event Listeners: Setting up...');
  
  // Check if listeners are already set up to avoid duplicates
  if (window.userCountryDropdownListenersSetup) {
    console.log('User Country Dropdown Event Listeners: Already set up, skipping');
    return;
  }
  
  // Setup event listeners for dropdown changes
  const dropdown = document.getElementById('user-country-default-select');
  console.log(`User Country Dropdown Event Listeners: Found dropdown:`, dropdown);
  
  if (!dropdown) {
    console.log('User Country Dropdown Event Listeners: No dropdown found, skipping');
    return;
  }
  
  dropdown.addEventListener('change', async (event) => {
    const selectedValue = event.target.value;
    
    console.log(`User Country Dropdown Event Listeners: Dropdown changed to ${selectedValue}`);
    
    await saveUserCountryDropdownDefault(selectedValue);
    await notifyContentScript('userCountryDropdownDefaults', 'update');
  });
  
  // Mark as set up
  window.userCountryDropdownListenersSetup = true;
  
  console.log('User Country Dropdown Event Listeners: Setup complete');
}

/**
 * Load user country dropdown defaults from storage
 */
async function loadUserCountryDropdownDefaults() {
  try {
    console.log('User Country Dropdown Defaults: Loading settings from storage...');
    const result = await chrome.storage.sync.get(['userCountryDropdownDefaultsSettings']);
    console.log('User Country Dropdown Defaults: Raw storage result:', result);
    
    const defaultSelected = result.userCountryDropdownDefaultsSettings || '';
    
    // If no saved setting exists, set to first option
    if (!result.userCountryDropdownDefaultsSettings) {
      await chrome.storage.sync.set({ userCountryDropdownDefaultsSettings: '' });
    }
    
    console.log('User Country Dropdown Defaults: Using default:', defaultSelected);
    
    // Update UI dropdown
    const dropdown = document.getElementById('user-country-default-select');
    console.log(`User Country Dropdown Defaults: Looking for dropdown:`, dropdown);
    if (dropdown) {
      console.log(`User Country Dropdown Defaults: Setting dropdown to ${defaultSelected}`);
      dropdown.value = defaultSelected;
    } else {
      console.log(`User Country Dropdown Defaults: Dropdown not found!`);
    }
    
    console.log('User Country Dropdown Defaults: Loaded settings:', defaultSelected);
  } catch (error) {
    console.error('User Country Dropdown Defaults: Error loading settings:', error);
  }
}

/**
 * Save user country dropdown default to storage
 * @param {string} selectedValue - The selected value
 */
async function saveUserCountryDropdownDefault(selectedValue) {
  try {
    console.log(`User Country Dropdown Defaults: Attempting to save ${selectedValue} as selected`);
    
    await chrome.storage.sync.set({ userCountryDropdownDefaultsSettings: selectedValue });
    
    console.log(`User Country Dropdown Defaults: Successfully saved ${selectedValue} as selected`);
  } catch (error) {
    console.error('User Country Dropdown Defaults: Error saving setting:', error);
  }
}

/**
 * Check if LOID element exists on the current page
 * This determines if LO link features can be used
 */
async function checkLoidAvailability() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('csod.com')) {
      // Not on a CSOD page - don't show message, toggles stay enabled
      updateLoTogglesAvailability(true, null, false);
      return;
    }
    
    // Check if URL contains "Learning/CourseConsole"
    const isLearningConsolePage = tab.url.includes('Learning/CourseConsole');
    
    if (!isLearningConsolePage) {
      // Not on Learning/CourseConsole page - don't show message, toggles stay enabled
      updateLoTogglesAvailability(true, null, false);
      return;
    }
    
    // On Learning/CourseConsole page - check for LOID
    // First, try to get LOID status from content script via message passing
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_LOID_STATUS' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script might not be ready, try script injection as fallback
          console.log('Content script not responding, trying script injection...');
          checkLoidViaScriptInjection(tab.id, true);
        } else if (response && response.loidFound) {
          // LOID found - don't show message
          updateLoTogglesAvailability(true, null, false);
        } else {
          // Content script is loaded but LOID not found - show message
          updateLoTogglesAvailability(true, null, true);
        }
      });
    } catch (msgError) {
      console.error('Error sending message to content script:', msgError);
      // Fallback to script injection
      checkLoidViaScriptInjection(tab.id, true);
    }
    
  } catch (error) {
    console.error('Error checking LOID availability:', error);
    // On error, keep toggles enabled but don't show message
    updateLoTogglesAvailability(true, null, false);
  }
}

// Fallback function to check LOID via script injection
async function checkLoidViaScriptInjection(tabId, isLearningConsolePage) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      code: `
        (function() {
          // UUID pattern: 8-4-4-4-12 hexadecimal characters
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          
          // Check all span elements for UUID content
          const spans = document.querySelectorAll('span');
          for (let span of spans) {
            let text = span.textContent ? span.textContent.trim() : '';
            let matches = false;
            
            if (text) {
              matches = uuidPattern.test(text);
            }
            
            if (!matches && span.innerText) {
              text = span.innerText.trim();
              if (text) {
                matches = uuidPattern.test(text);
              }
            }
            
            if (text && matches) {
              return true;
            }
          }
          return false;
        })();
      `
    });
    
    const loidExists = results && results[0] && results[0].result === true;
    // Show message only if on Learning/CourseConsole page AND LOID not found
    const shouldShowMessage = isLearningConsolePage && !loidExists;
    updateLoTogglesAvailability(true, null, shouldShowMessage);
  } catch (error) {
    console.error('Script injection also failed:', error);
    // On error, keep toggles enabled but don't show message
    updateLoTogglesAvailability(true, null, false);
  }
}

/**
 * Update LO toggle availability based on LOID presence
 * @param {boolean} available - Whether LOID was found (not used anymore, kept for compatibility)
 * @param {string|null} message - Optional message to display (not used anymore, kept for compatibility)
 * @param {boolean} showMessage - Whether to show the LOID not detected message
 */
async function updateLoTogglesAvailability(available, message, showMessage) {
  // Get all LO-related toggles - always keep them enabled
  const loToggles = [
    document.getElementById('lo-show-preview-link'),
    document.getElementById('lo-show-details-link'),
    document.getElementById('lo-show-launch-link'),
    document.getElementById('lo-show-register-link'),
    document.getElementById('lo-copy-loid')
  ];
  
  // Always enable toggles and remove any disabled styling
  loToggles.forEach(toggle => {
    if (toggle) {
      toggle.disabled = false;
      const toggleItem = toggle.closest('.toggle-item');
      if (toggleItem) {
        toggleItem.style.opacity = '1';
        toggleItem.style.cursor = 'default';
        const slider = toggleItem.querySelector('.slider');
        if (slider) {
          slider.style.opacity = '1';
        }
      }
    }
  });
  
  // Find or create the availability message element
  const catalogTab = document.getElementById('catalog-tab');
  let availabilityMessage = catalogTab.querySelector('.lo-availability-message');
  
  if (!availabilityMessage) {
    availabilityMessage = document.createElement('div');
    availabilityMessage.className = 'lo-availability-message';
    availabilityMessage.style.cssText = 'padding: 12px; margin: 12px 0; border-radius: 6px; font-size: 12px; line-height: 1.5;';
    // Insert before the category section
    const category = catalogTab.querySelector('.category');
    if (category) {
      catalogTab.insertBefore(availabilityMessage, category);
    } else {
      catalogTab.appendChild(availabilityMessage);
    }
  }
  
  // Show message only when on Learning/CourseConsole page and LOID not detected
  if (showMessage) {
    availabilityMessage.style.display = 'block';
    availabilityMessage.style.backgroundColor = '#fef3c7';
    availabilityMessage.style.border = '1px solid #fbbf24';
    availabilityMessage.style.color = '#92400e';
    
    availabilityMessage.innerHTML = `
      <strong>⚠️ Learning Object ID not detected</strong><br>
      This can be enabled via a back end setting. Contact Cornerstone Support to enable this.
    `;
  } else {
    availabilityMessage.style.display = 'none';
  }
}

/**
 * Load transcript status color and opacity settings
 */
function loadTranscriptStatusSettings(settings) {
  const statusMap = {
    'registered': { enabledKey: 'transcriptRegisteredEnabled', colorKey: 'transcriptRegisteredColor', opacityKey: 'transcriptRegisteredOpacity' },
    'in-progress': { enabledKey: 'transcriptInProgressEnabled', colorKey: 'transcriptInProgressColor', opacityKey: 'transcriptInProgressOpacity' },
    'completed': { enabledKey: 'transcriptCompletedEnabled', colorKey: 'transcriptCompletedColor', opacityKey: 'transcriptCompletedOpacity' },
    'past-due': { enabledKey: 'transcriptPastDueEnabled', colorKey: 'transcriptPastDueColor', opacityKey: 'transcriptPastDueOpacity' },
    'pending': { enabledKey: 'transcriptPendingEnabled', colorKey: 'transcriptPendingColor', opacityKey: 'transcriptPendingOpacity' },
    'inactive': { enabledKey: 'transcriptInactiveEnabled', colorKey: 'transcriptInactiveColor', opacityKey: 'transcriptInactiveOpacity' },
    'withdrawn': { enabledKey: 'transcriptWithdrawnEnabled', colorKey: 'transcriptWithdrawnColor', opacityKey: 'transcriptWithdrawnOpacity' },
    'cancelled': { enabledKey: 'transcriptCancelledEnabled', colorKey: 'transcriptCancelledColor', opacityKey: 'transcriptCancelledOpacity' },
    'denied': { enabledKey: 'transcriptDeniedEnabled', colorKey: 'transcriptDeniedColor', opacityKey: 'transcriptDeniedOpacity' }
  };
  
  Object.keys(statusMap).forEach(status => {
    const { enabledKey, colorKey, opacityKey } = statusMap[status];
    const enabledInput = document.getElementById(`transcript-${status}-enabled`);
    const colorInput = document.getElementById(`transcript-${status}-color`);
    const opacityInput = document.getElementById(`transcript-${status}-opacity`);
    const opacityValue = document.getElementById(`transcript-${status}-opacity-value`);
    
    if (enabledInput && settings[enabledKey] !== undefined) {
      enabledInput.checked = settings[enabledKey];
    }
    
    if (colorInput) {
      let colorValue = settings[colorKey];
      // Migrate old green Registered color to new purple
      if (status === 'registered' && colorValue === '#00aa00') {
        colorValue = '#9333ea';
        // Update the saved value
        saveSetting(colorKey, colorValue).catch(err => console.error('Error migrating Registered color:', err));
      }
      // Use default if no saved value
      if (!colorValue) {
        colorValue = DEFAULT_SETTINGS[colorKey];
      }
      if (colorValue) {
        colorInput.value = colorValue;
      }
    }
    
    if (opacityInput && settings[opacityKey] !== undefined) {
      opacityInput.value = settings[opacityKey];
      if (opacityValue) {
        opacityValue.textContent = `${settings[opacityKey]}%`;
      }
    }
  });
}

// Store event handlers to prevent duplicates
const transcriptStatusHandlers = new Map();
// Store opacity timeouts for debouncing
const transcriptStatusTimeouts = new Map();

// Store assignment status event handlers to prevent duplicates
const assignmentStatusHandlers = new Map();
// Store assignment status opacity timeouts for debouncing
const assignmentStatusTimeouts = new Map();

/**
 * Setup transcript status settings event listeners
 */
function setupTranscriptStatusSettings() {
  const statusMap = {
    'registered': { enabledKey: 'transcriptRegisteredEnabled', colorKey: 'transcriptRegisteredColor', opacityKey: 'transcriptRegisteredOpacity' },
    'in-progress': { enabledKey: 'transcriptInProgressEnabled', colorKey: 'transcriptInProgressColor', opacityKey: 'transcriptInProgressOpacity' },
    'completed': { enabledKey: 'transcriptCompletedEnabled', colorKey: 'transcriptCompletedColor', opacityKey: 'transcriptCompletedOpacity' },
    'past-due': { enabledKey: 'transcriptPastDueEnabled', colorKey: 'transcriptPastDueColor', opacityKey: 'transcriptPastDueOpacity' },
    'pending': { enabledKey: 'transcriptPendingEnabled', colorKey: 'transcriptPendingColor', opacityKey: 'transcriptPendingOpacity' },
    'inactive': { enabledKey: 'transcriptInactiveEnabled', colorKey: 'transcriptInactiveColor', opacityKey: 'transcriptInactiveOpacity' },
    'withdrawn': { enabledKey: 'transcriptWithdrawnEnabled', colorKey: 'transcriptWithdrawnColor', opacityKey: 'transcriptWithdrawnOpacity' },
    'cancelled': { enabledKey: 'transcriptCancelledEnabled', colorKey: 'transcriptCancelledColor', opacityKey: 'transcriptCancelledOpacity' },
    'denied': { enabledKey: 'transcriptDeniedEnabled', colorKey: 'transcriptDeniedColor', opacityKey: 'transcriptDeniedOpacity' }
  };
  
  Object.keys(statusMap).forEach(status => {
    const { enabledKey, colorKey, opacityKey } = statusMap[status];
    const enabledInput = document.getElementById(`transcript-${status}-enabled`);
    const colorInput = document.getElementById(`transcript-${status}-color`);
    const opacityInput = document.getElementById(`transcript-${status}-opacity`);
    const opacityValue = document.getElementById(`transcript-${status}-opacity-value`);
    
    // Remove existing listeners if they exist
    const enabledKey_map = `enabled-${status}`;
    const colorKey_map = `color-${status}`;
    const opacityKey_map = `opacity-${status}`;
    
    if (enabledInput) {
      if (transcriptStatusHandlers.has(enabledKey_map)) {
        enabledInput.removeEventListener('change', transcriptStatusHandlers.get(enabledKey_map));
      }
      const enabledHandler = async (e) => {
        await saveSetting(enabledKey, e.target.checked);
        await notifyContentScript('transcriptSettingsChanged', {});
      };
      transcriptStatusHandlers.set(enabledKey_map, enabledHandler);
      enabledInput.addEventListener('change', enabledHandler);
    }
    
    if (colorInput) {
      if (transcriptStatusHandlers.has(colorKey_map)) {
        colorInput.removeEventListener('change', transcriptStatusHandlers.get(colorKey_map));
      }
      const colorHandler = async (e) => {
        try {
          await saveSetting(colorKey, e.target.value);
          await notifyContentScript('transcriptSettingsChanged', {});
        } catch (error) {
          console.error('Error saving color setting:', error);
        }
      };
      transcriptStatusHandlers.set(colorKey_map, colorHandler);
      colorInput.addEventListener('change', colorHandler);
    }
    
    if (opacityInput && opacityValue) {
      if (transcriptStatusHandlers.has(opacityKey_map)) {
        opacityInput.removeEventListener('input', transcriptStatusHandlers.get(opacityKey_map));
        // Clear any pending timeout
        if (transcriptStatusTimeouts.has(opacityKey_map)) {
          clearTimeout(transcriptStatusTimeouts.get(opacityKey_map));
          transcriptStatusTimeouts.delete(opacityKey_map);
        }
      }
      
      const opacityHandler = (e) => {
        const value = e.target.value;
        opacityValue.textContent = `${value}%`;
        
        // Clear previous timeout for this status
        if (transcriptStatusTimeouts.has(opacityKey_map)) {
          clearTimeout(transcriptStatusTimeouts.get(opacityKey_map));
        }
        
        // Debounce the save operation to prevent blocking
        const timeout = setTimeout(async () => {
          await saveSetting(opacityKey, parseInt(value));
          await notifyContentScript('transcriptSettingsChanged', {});
          transcriptStatusTimeouts.delete(opacityKey_map);
        }, 150);
        transcriptStatusTimeouts.set(opacityKey_map, timeout);
      };
      transcriptStatusHandlers.set(opacityKey_map, opacityHandler);
      opacityInput.addEventListener('input', opacityHandler);
    }
  });
}

/**
 * Load assignment status color and opacity settings
 */
function loadAssignmentStatusSettings(settings) {
  const statusMap = {
    'active': { enabledKey: 'assignmentActiveEnabled', colorKey: 'assignmentActiveColor', opacityKey: 'assignmentActiveOpacity' },
    'queued': { enabledKey: 'assignmentQueuedEnabled', colorKey: 'assignmentQueuedColor', opacityKey: 'assignmentQueuedOpacity' },
    'processed': { enabledKey: 'assignmentProcessedEnabled', colorKey: 'assignmentProcessedColor', opacityKey: 'assignmentProcessedOpacity' },
    'cancelled': { enabledKey: 'assignmentCancelledEnabled', colorKey: 'assignmentCancelledColor', opacityKey: 'assignmentCancelledOpacity' },
    'inactive': { enabledKey: 'assignmentInactiveEnabled', colorKey: 'assignmentInactiveColor', opacityKey: 'assignmentInactiveOpacity' },
    'drafts': { enabledKey: 'assignmentDraftsEnabled', colorKey: 'assignmentDraftsColor', opacityKey: 'assignmentDraftsOpacity' }
  };
  
  Object.keys(statusMap).forEach(status => {
    const { enabledKey, colorKey, opacityKey } = statusMap[status];
    const enabledInput = document.getElementById(`assignment-${status}-enabled`);
    const colorInput = document.getElementById(`assignment-${status}-color`);
    const opacityInput = document.getElementById(`assignment-${status}-opacity`);
    const opacityValue = document.getElementById(`assignment-${status}-opacity-value`);
    
    if (enabledInput && settings[enabledKey] !== undefined) {
      enabledInput.checked = settings[enabledKey];
    }
    
    if (colorInput && settings[colorKey]) {
      colorInput.value = settings[colorKey];
    }
    
    if (opacityInput && settings[opacityKey] !== undefined) {
      opacityInput.value = settings[opacityKey];
      if (opacityValue) {
        opacityValue.textContent = `${settings[opacityKey]}%`;
      }
    }
  });
}

/**
 * Setup assignment status settings event listeners
 */
function setupAssignmentStatusSettings() {
  const statusMap = {
    'active': { enabledKey: 'assignmentActiveEnabled', colorKey: 'assignmentActiveColor', opacityKey: 'assignmentActiveOpacity' },
    'queued': { enabledKey: 'assignmentQueuedEnabled', colorKey: 'assignmentQueuedColor', opacityKey: 'assignmentQueuedOpacity' },
    'processed': { enabledKey: 'assignmentProcessedEnabled', colorKey: 'assignmentProcessedColor', opacityKey: 'assignmentProcessedOpacity' },
    'cancelled': { enabledKey: 'assignmentCancelledEnabled', colorKey: 'assignmentCancelledColor', opacityKey: 'assignmentCancelledOpacity' },
    'inactive': { enabledKey: 'assignmentInactiveEnabled', colorKey: 'assignmentInactiveColor', opacityKey: 'assignmentInactiveOpacity' },
    'drafts': { enabledKey: 'assignmentDraftsEnabled', colorKey: 'assignmentDraftsColor', opacityKey: 'assignmentDraftsOpacity' }
  };
  
  Object.keys(statusMap).forEach(status => {
    const { enabledKey, colorKey, opacityKey } = statusMap[status];
    const enabledInput = document.getElementById(`assignment-${status}-enabled`);
    const colorInput = document.getElementById(`assignment-${status}-color`);
    const opacityInput = document.getElementById(`assignment-${status}-opacity`);
    const opacityValue = document.getElementById(`assignment-${status}-opacity-value`);
    
    // Remove existing listeners if they exist
    const enabledKey_map = `enabled-${status}`;
    const colorKey_map = `color-${status}`;
    const opacityKey_map = `opacity-${status}`;
    
    if (enabledInput) {
      if (assignmentStatusHandlers.has(enabledKey_map)) {
        enabledInput.removeEventListener('change', assignmentStatusHandlers.get(enabledKey_map));
      }
      const enabledHandler = async (e) => {
        await saveSetting(enabledKey, e.target.checked);
        await notifyContentScript('assignmentSettingsChanged', {});
      };
      assignmentStatusHandlers.set(enabledKey_map, enabledHandler);
      enabledInput.addEventListener('change', enabledHandler);
    }
    
    if (colorInput) {
      if (assignmentStatusHandlers.has(colorKey_map)) {
        colorInput.removeEventListener('change', assignmentStatusHandlers.get(colorKey_map));
      }
      const colorHandler = async (e) => {
        try {
          await saveSetting(colorKey, e.target.value);
          await notifyContentScript('assignmentSettingsChanged', {});
        } catch (error) {
          console.error('Error saving color setting:', error);
        }
      };
      assignmentStatusHandlers.set(colorKey_map, colorHandler);
      colorInput.addEventListener('change', colorHandler);
    }
    
    if (opacityInput && opacityValue) {
      if (assignmentStatusHandlers.has(opacityKey_map)) {
        opacityInput.removeEventListener('input', assignmentStatusHandlers.get(opacityKey_map));
        // Clear any pending timeout
        if (assignmentStatusTimeouts.has(opacityKey_map)) {
          clearTimeout(assignmentStatusTimeouts.get(opacityKey_map));
          assignmentStatusTimeouts.delete(opacityKey_map);
        }
      }
      
      const opacityHandler = (e) => {
        const value = e.target.value;
        opacityValue.textContent = `${value}%`;
        
        // Clear previous timeout for this status
        if (assignmentStatusTimeouts.has(opacityKey_map)) {
          clearTimeout(assignmentStatusTimeouts.get(opacityKey_map));
        }
        
        // Debounce the save operation to prevent blocking
        const timeout = setTimeout(async () => {
          await saveSetting(opacityKey, parseInt(value));
          await notifyContentScript('assignmentSettingsChanged', {});
          assignmentStatusTimeouts.delete(opacityKey_map);
        }, 150);
        assignmentStatusTimeouts.set(opacityKey_map, timeout);
      };
      assignmentStatusHandlers.set(opacityKey_map, opacityHandler);
      opacityInput.addEventListener('input', opacityHandler);
    }
  });
}

/**
 * Load environment settings
 */
function loadEnvironmentSettings(settings) {
  const environments = ['production', 'staging', 'pilot'];
  
  environments.forEach(env => {
    const envCapitalized = env.charAt(0).toUpperCase() + env.slice(1);
    
    // Expand toggle
    const expandInput = document.getElementById(`environment-${env}-expand`);
    const settingsContainer = document.getElementById(`environment-${env}-settings`);
    if (expandInput) {
      const expanded = settings[`environment${envCapitalized}Expanded`] || false;
      expandInput.checked = expanded;
      if (settingsContainer) {
        settingsContainer.style.display = expanded ? 'block' : 'none';
      }
      
      // Sync enabled state: if collapsed, ensure it's disabled (but settings are preserved)
      // If expanded, use the stored enabled value or default to true
      if (!expanded) {
        // Collapsed = disabled, but don't overwrite settings
        // The enabled state will be set to false when the toggle changes
      }
    }
    
    // Header color toggle
    const headerColorEnabledInput = document.getElementById(`environment-${env}-header-color-enabled`);
    const headerColorOptions = document.getElementById(`environment-${env}-header-color-options`);
    if (headerColorEnabledInput) {
      const enabled = settings[`environment${envCapitalized}HeaderColorEnabled`] || false;
      headerColorEnabledInput.checked = enabled;
      if (headerColorOptions) {
        headerColorOptions.style.display = enabled ? 'block' : 'none';
      }
    }
    
    // Header color
    const colorInput = document.getElementById(`environment-${env}-color`);
    if (colorInput) {
      const colorValue = settings[`environment${envCapitalized}Color`] || DEFAULT_SETTINGS[`environment${envCapitalized}Color`];
      if (colorValue) {
        colorInput.value = colorValue;
      }
    }
    
    // Header opacity
    const headerOpacityInput = document.getElementById(`environment-${env}-header-opacity`);
    const headerOpacityValue = document.getElementById(`environment-${env}-header-opacity-value`);
    if (headerOpacityInput) {
      const opacity = settings[`environment${envCapitalized}HeaderOpacity`] !== undefined ? settings[`environment${envCapitalized}HeaderOpacity`] : 100;
      headerOpacityInput.value = opacity;
      if (headerOpacityValue) {
        headerOpacityValue.textContent = `${opacity}%`;
      }
    }
    
    // Watermark toggle
    const watermarkInput = document.getElementById(`environment-${env}-watermark`);
    const watermarkOptions = document.getElementById(`environment-${env}-watermark-options`);
    if (watermarkInput) {
      const enabled = settings[`environment${envCapitalized}Watermark`] || false;
      watermarkInput.checked = enabled;
      if (watermarkOptions) {
        watermarkOptions.style.display = enabled ? 'block' : 'none';
      }
    }
    
    // Watermark color
    const watermarkColorInput = document.getElementById(`environment-${env}-watermark-color`);
    if (watermarkColorInput) {
      const colorValue = settings[`environment${envCapitalized}WatermarkColor`] || DEFAULT_SETTINGS[`environment${envCapitalized}WatermarkColor`];
      if (colorValue) {
        watermarkColorInput.value = colorValue;
      }
    }
    
    // Watermark opacity
    const watermarkOpacityInput = document.getElementById(`environment-${env}-watermark-opacity`);
    const watermarkOpacityValue = document.getElementById(`environment-${env}-watermark-opacity-value`);
    if (watermarkOpacityInput) {
      const opacity = settings[`environment${envCapitalized}WatermarkOpacity`] !== undefined ? settings[`environment${envCapitalized}WatermarkOpacity`] : 50;
      watermarkOpacityInput.value = opacity;
      if (watermarkOpacityValue) {
        watermarkOpacityValue.textContent = `${opacity}%`;
      }
    }
  });
}

/**
 * Setup environment settings event listeners
 */
function setupEnvironmentSettings() {
  const environments = ['production', 'staging', 'pilot'];
  
  environments.forEach(env => {
    const envCapitalized = env.charAt(0).toUpperCase() + env.slice(1);
    
    // Expand toggle
    const expandInput = document.getElementById(`environment-${env}-expand`);
    const settingsContainer = document.getElementById(`environment-${env}-settings`);
    if (expandInput && settingsContainer) {
      expandInput.addEventListener('change', async (e) => {
        const isExpanded = e.target.checked;
        settingsContainer.style.display = isExpanded ? 'block' : 'none';
        await saveSetting(`environment${envCapitalized}Expanded`, isExpanded);
        
        // When collapsed, disable the environment (but remember settings)
        // When expanded, restore the environment state
        if (!isExpanded) {
          // Save enabled state as false, but keep all other settings
          await saveSetting(`environment${envCapitalized}Enabled`, false);
          await notifyContentScript('environmentSettingsChanged', {});
        } else {
          // When expanded, restore enabled state (settings are already in storage)
          await saveSetting(`environment${envCapitalized}Enabled`, true);
          await notifyContentScript('environmentSettingsChanged', {});
        }
      });
    }
    
    // Header color toggle
    const headerColorEnabledInput = document.getElementById(`environment-${env}-header-color-enabled`);
    const headerColorOptions = document.getElementById(`environment-${env}-header-color-options`);
    if (headerColorEnabledInput && headerColorOptions) {
      headerColorEnabledInput.addEventListener('change', async (e) => {
        const isEnabled = e.target.checked;
        headerColorOptions.style.display = isEnabled ? 'block' : 'none';
        await saveSetting(`environment${envCapitalized}HeaderColorEnabled`, isEnabled);
        await notifyContentScript('environmentSettingsChanged', {});
      });
    }
    
    // Header color
    const colorInput = document.getElementById(`environment-${env}-color`);
    if (colorInput) {
      colorInput.addEventListener('change', async (e) => {
        try {
          await saveSetting(`environment${envCapitalized}Color`, e.target.value);
          await notifyContentScript('environmentSettingsChanged', {});
        } catch (error) {
          console.error('Error saving environment color setting:', error);
        }
      });
    }
    
    // Header opacity
    const headerOpacityInput = document.getElementById(`environment-${env}-header-opacity`);
    const headerOpacityValue = document.getElementById(`environment-${env}-header-opacity-value`);
    if (headerOpacityInput && headerOpacityValue) {
      let headerOpacityTimeout;
      const headerOpacityHandler = (e) => {
        const value = e.target.value;
        headerOpacityValue.textContent = `${value}%`;
        
        if (headerOpacityTimeout) {
          clearTimeout(headerOpacityTimeout);
        }
        
        headerOpacityTimeout = setTimeout(async () => {
          await saveSetting(`environment${envCapitalized}HeaderOpacity`, parseInt(value));
          await notifyContentScript('environmentSettingsChanged', {});
        }, 150);
      };
      headerOpacityInput.addEventListener('input', headerOpacityHandler);
    }
    
    // Watermark toggle
    const watermarkInput = document.getElementById(`environment-${env}-watermark`);
    const watermarkOptions = document.getElementById(`environment-${env}-watermark-options`);
    if (watermarkInput && watermarkOptions) {
      watermarkInput.addEventListener('change', async (e) => {
        const isEnabled = e.target.checked;
        watermarkOptions.style.display = isEnabled ? 'block' : 'none';
        await saveSetting(`environment${envCapitalized}Watermark`, isEnabled);
        await notifyContentScript('environmentSettingsChanged', {});
      });
    }
    
    // Watermark color
    const watermarkColorInput = document.getElementById(`environment-${env}-watermark-color`);
    if (watermarkColorInput) {
      watermarkColorInput.addEventListener('change', async (e) => {
        try {
          await saveSetting(`environment${envCapitalized}WatermarkColor`, e.target.value);
          await notifyContentScript('environmentSettingsChanged', {});
        } catch (error) {
          console.error('Error saving watermark color setting:', error);
        }
      });
    }
    
    // Watermark opacity
    const watermarkOpacityInput = document.getElementById(`environment-${env}-watermark-opacity`);
    const watermarkOpacityValue = document.getElementById(`environment-${env}-watermark-opacity-value`);
    if (watermarkOpacityInput && watermarkOpacityValue) {
      let watermarkOpacityTimeout;
      const watermarkOpacityHandler = (e) => {
        const value = e.target.value;
        watermarkOpacityValue.textContent = `${value}%`;
        
        if (watermarkOpacityTimeout) {
          clearTimeout(watermarkOpacityTimeout);
        }
        
        watermarkOpacityTimeout = setTimeout(async () => {
          await saveSetting(`environment${envCapitalized}WatermarkOpacity`, parseInt(value));
          await notifyContentScript('environmentSettingsChanged', {});
        }, 150);
      };
      watermarkOpacityInput.addEventListener('input', watermarkOpacityHandler);
    }
    
    // Reset button
    const resetButton = document.getElementById(`reset-environment-${env}`);
    if (resetButton) {
      resetButton.addEventListener('click', async () => {
        const confirmed = await showConfirmationDialog(
          `Reset ${envCapitalized} environment settings to defaults?`,
          'Reset to Defaults'
        );
        if (confirmed) {
          await resetEnvironmentToDefaults(env, envCapitalized);
        }
      });
    }
  });
}

/**
 * Reset environment settings to defaults
 */
async function resetEnvironmentToDefaults(env, envCapitalized) {
  // Default values based on environment (only colors and values, not toggles)
  const defaults = {
    production: {
      color: '#950606',
      headerOpacity: 100,
      watermarkColor: '#000000',
      watermarkOpacity: 50
    },
    staging: {
      color: '#06402B',
      headerOpacity: 100,
      watermarkColor: '#000000',
      watermarkOpacity: 50
    },
    pilot: {
      color: '#111184',
      headerOpacity: 100,
      watermarkColor: '#000000',
      watermarkOpacity: 50
    }
  };
  
  const envDefaults = defaults[env];
  
  // Get current toggle states (don't change them)
  const headerColorEnabledInput = document.getElementById(`environment-${env}-header-color-enabled`);
  const watermarkInput = document.getElementById(`environment-${env}-watermark`);
  
  // Only reset color and value settings, keep toggles as they are
  await saveSetting(`environment${envCapitalized}Color`, envDefaults.color);
  await saveSetting(`environment${envCapitalized}HeaderOpacity`, envDefaults.headerOpacity);
  await saveSetting(`environment${envCapitalized}WatermarkColor`, envDefaults.watermarkColor);
  await saveSetting(`environment${envCapitalized}WatermarkOpacity`, envDefaults.watermarkOpacity);
  
  // Update UI - only reset color and value inputs, keep toggles unchanged
  const headerColorInput = document.getElementById(`environment-${env}-color`);
  const headerOpacityInput = document.getElementById(`environment-${env}-header-opacity`);
  const headerOpacityValue = document.getElementById(`environment-${env}-header-opacity-value`);
  const watermarkColorInput = document.getElementById(`environment-${env}-watermark-color`);
  const watermarkOpacityInput = document.getElementById(`environment-${env}-watermark-opacity`);
  const watermarkOpacityValue = document.getElementById(`environment-${env}-watermark-opacity-value`);
  
  if (headerColorInput) {
    headerColorInput.value = envDefaults.color;
  }
  if (headerOpacityInput) {
    headerOpacityInput.value = envDefaults.headerOpacity;
    if (headerOpacityValue) {
      headerOpacityValue.textContent = `${envDefaults.headerOpacity}%`;
    }
  }
  if (watermarkColorInput) {
    watermarkColorInput.value = envDefaults.watermarkColor;
  }
  if (watermarkOpacityInput) {
    watermarkOpacityInput.value = envDefaults.watermarkOpacity;
    if (watermarkOpacityValue) {
      watermarkOpacityValue.textContent = `${envDefaults.watermarkOpacity}%`;
    }
  }
  
  // Notify content script
  await notifyContentScript('environmentSettingsChanged', {});
  
  showStatus(`${envCapitalized} environment colors and values reset to defaults`, false);
}

/**
 * Reset transcript status settings to defaults
 */
async function resetTranscriptStatusSettings() {
  const defaults = {
    transcriptPastDueEnabled: DEFAULT_SETTINGS.transcriptPastDueEnabled,
    transcriptPastDueColor: DEFAULT_SETTINGS.transcriptPastDueColor,
    transcriptPastDueOpacity: DEFAULT_SETTINGS.transcriptPastDueOpacity,
    transcriptInProgressEnabled: DEFAULT_SETTINGS.transcriptInProgressEnabled,
    transcriptInProgressColor: DEFAULT_SETTINGS.transcriptInProgressColor,
    transcriptInProgressOpacity: DEFAULT_SETTINGS.transcriptInProgressOpacity,
    transcriptPendingEnabled: DEFAULT_SETTINGS.transcriptPendingEnabled,
    transcriptPendingColor: DEFAULT_SETTINGS.transcriptPendingColor,
    transcriptPendingOpacity: DEFAULT_SETTINGS.transcriptPendingOpacity,
    transcriptRegisteredEnabled: DEFAULT_SETTINGS.transcriptRegisteredEnabled,
    transcriptRegisteredColor: DEFAULT_SETTINGS.transcriptRegisteredColor,
    transcriptRegisteredOpacity: DEFAULT_SETTINGS.transcriptRegisteredOpacity,
    transcriptCompletedEnabled: DEFAULT_SETTINGS.transcriptCompletedEnabled,
    transcriptCompletedColor: DEFAULT_SETTINGS.transcriptCompletedColor,
    transcriptCompletedOpacity: DEFAULT_SETTINGS.transcriptCompletedOpacity,
    transcriptInactiveEnabled: DEFAULT_SETTINGS.transcriptInactiveEnabled,
    transcriptInactiveColor: DEFAULT_SETTINGS.transcriptInactiveColor,
    transcriptInactiveOpacity: DEFAULT_SETTINGS.transcriptInactiveOpacity,
    transcriptWithdrawnEnabled: DEFAULT_SETTINGS.transcriptWithdrawnEnabled,
    transcriptWithdrawnColor: DEFAULT_SETTINGS.transcriptWithdrawnColor,
    transcriptWithdrawnOpacity: DEFAULT_SETTINGS.transcriptWithdrawnOpacity,
    transcriptCancelledEnabled: DEFAULT_SETTINGS.transcriptCancelledEnabled,
    transcriptCancelledColor: DEFAULT_SETTINGS.transcriptCancelledColor,
    transcriptCancelledOpacity: DEFAULT_SETTINGS.transcriptCancelledOpacity,
    transcriptDeniedEnabled: DEFAULT_SETTINGS.transcriptDeniedEnabled,
    transcriptDeniedColor: DEFAULT_SETTINGS.transcriptDeniedColor,
    transcriptDeniedOpacity: DEFAULT_SETTINGS.transcriptDeniedOpacity
  };
  
  await chrome.storage.sync.set(defaults);
  
  // Reload settings and update UI
  const settings = await chrome.storage.sync.get(null);
  loadTranscriptStatusSettings(settings);
  await notifyContentScript('transcriptSettingsChanged', {});
  showStatus('Transcript status settings reset to defaults', false);
}

/**
 * Reset assignment status settings to defaults
 */
async function resetAssignmentStatusSettings() {
  const defaults = {
    assignmentActiveEnabled: DEFAULT_SETTINGS.assignmentActiveEnabled,
    assignmentActiveColor: DEFAULT_SETTINGS.assignmentActiveColor,
    assignmentActiveOpacity: DEFAULT_SETTINGS.assignmentActiveOpacity,
    assignmentQueuedEnabled: DEFAULT_SETTINGS.assignmentQueuedEnabled,
    assignmentQueuedColor: DEFAULT_SETTINGS.assignmentQueuedColor,
    assignmentQueuedOpacity: DEFAULT_SETTINGS.assignmentQueuedOpacity,
    assignmentProcessedEnabled: DEFAULT_SETTINGS.assignmentProcessedEnabled,
    assignmentProcessedColor: DEFAULT_SETTINGS.assignmentProcessedColor,
    assignmentProcessedOpacity: DEFAULT_SETTINGS.assignmentProcessedOpacity,
    assignmentCancelledEnabled: DEFAULT_SETTINGS.assignmentCancelledEnabled,
    assignmentCancelledColor: DEFAULT_SETTINGS.assignmentCancelledColor,
    assignmentCancelledOpacity: DEFAULT_SETTINGS.assignmentCancelledOpacity,
    assignmentInactiveEnabled: DEFAULT_SETTINGS.assignmentInactiveEnabled,
    assignmentInactiveColor: DEFAULT_SETTINGS.assignmentInactiveColor,
    assignmentInactiveOpacity: DEFAULT_SETTINGS.assignmentInactiveOpacity,
    assignmentDraftsEnabled: DEFAULT_SETTINGS.assignmentDraftsEnabled,
    assignmentDraftsColor: DEFAULT_SETTINGS.assignmentDraftsColor,
    assignmentDraftsOpacity: DEFAULT_SETTINGS.assignmentDraftsOpacity
  };
  
  await chrome.storage.sync.set(defaults);
  
  // Reload settings and update UI
  const settings = await chrome.storage.sync.get(null);
  loadAssignmentStatusSettings(settings);
  await notifyContentScript('assignmentSettingsChanged', {});
  showStatus('Assignment status settings reset to defaults', false);
}

/**
 * Setup reset buttons for transcript and assignment status settings
 */
function setupResetButtons() {
  const resetTranscriptBtn = document.getElementById('reset-transcript-statuses');
  const resetAssignmentBtn = document.getElementById('reset-assignment-statuses');
  
  if (resetTranscriptBtn) {
    resetTranscriptBtn.addEventListener('click', async () => {
      await resetTranscriptStatusSettings();
    });
  }
  
  if (resetAssignmentBtn) {
    resetAssignmentBtn.addEventListener('click', async () => {
      await resetAssignmentStatusSettings();
    });
  }
}

/**
 * Setup settings export and import functionality
 */
function setupSettingsExportImport() {
  const exportButton = document.getElementById('export-settings');
  const importButton = document.getElementById('import-settings');
  const importFileInput = document.getElementById('import-settings-file');

  if (!exportButton || !importButton || !importFileInput) return;

  // Export settings
  exportButton.addEventListener('click', async () => {
    try {
      // Get all settings from storage
      const allSettings = await chrome.storage.sync.get(null);
      
      // Create export object with metadata
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        settings: allSettings
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Create filename with timestamp (YYYY-MM-DD-HH-MM-SS format, filesystem-safe)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
      
      a.download = `cornerstone-lms-tools-settings-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showStatus('Settings exported successfully!', false);
    } catch (error) {
      console.error('Error exporting settings:', error);
      showStatus('Error exporting settings', true);
    }
  });

  // Import settings
  importButton.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Read file content
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data structure
      if (!importData.settings || typeof importData.settings !== 'object') {
        showStatus('Invalid settings file format', true);
        return;
      }

      // Confirm import
      const confirmed = await showConfirmationDialog(
        'This will replace all your current settings. Are you sure you want to continue?\n\n' +
        'Click OK to proceed or Cancel to abort.',
        'Import Settings'
      );

      if (!confirmed) {
        importFileInput.value = '';
        return;
      }

      // Import settings
      await chrome.storage.sync.set(importData.settings);

      // Reload settings to update UI
      await loadSettings();

      // Notify content script about all changes
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('csod.com')) {
        // Notify about major setting changes
        for (const key in importData.settings) {
          await notifyContentScript(key, importData.settings[key]);
        }
      }

      showStatus('Settings imported successfully!', false);
      
      // Reset file input
      importFileInput.value = '';
    } catch (error) {
      console.error('Error importing settings:', error);
      showStatus('Error importing settings. Please check the file format.', true);
      importFileInput.value = '';
    }
  });
}

/**
 * Setup settings management buttons (Turn Off All Features, Reset All Features)
 */
function setupSettingsManagement() {
  const turnOffButton = document.getElementById('turn-off-all-features');
  const resetButton = document.getElementById('reset-all-features');

  if (!turnOffButton || !resetButton) return;

  // Turn off all features
  turnOffButton.addEventListener('click', async () => {
    const confirmed = await showConfirmationDialog(
      'This will turn off ALL features. Are you sure you want to continue?\n\n' +
      'This will disable all enhancements but keep your settings (colors, sizes, etc.).\n\n' +
      'Click OK to proceed or Cancel to abort.',
      'Turn Off All Features'
    );

    if (!confirmed) return;

    try {
      // Get all current settings
      const allSettings = await chrome.storage.sync.get(null);
      
      // Identify all boolean feature flags (features that can be toggled on/off)
      // NOTE: 'customHeaderLinks' is NOT a feature flag - it's the storage key for the links array!
      // We use 'customHeaderLinksEnabled' instead to toggle the feature on/off
      const featureFlags = [
        'headerLogoutLink',
        'toggleTentativeColumn',
        'highlightZeroSessions',
        'centerNumberColumns',
        'highlightFullSessions',
        'formatSessionDates',
        'highlightZeroEnrollments',
        'centerEnrollmentColumn',
        'resizeAIIcon',
        'resizePinnedLinksIcon',
        'sessionsCheckboxDefaults',
        'userStatusDropdownDefaults',
        'userOuTypeDropdownDefaults',
        'userCountryDropdownDefaults',
        'loShowPreviewLink',
        'loShowDetailsLink',
        'loShowLaunchLink',
        'loShowRegisterLink',
        'loCopyLoid',
        'highlightTranscriptStatuses',
        'proxyDefaultText',
        'proxyAutoClickLogin',
        'customPagePreviewLink',
        'customPageCopyLink',
        'highlightAssignmentStatuses'
      ];

      // Turn off all feature flags
      const updates = {};
      featureFlags.forEach(feature => {
        if (allSettings.hasOwnProperty(feature)) {
          updates[feature] = false;
        }
      });

      // Handle customHeaderLinks separately - we only want to disable the feature, not delete the links
      // customHeaderLinksEnabled is the actual feature toggle
      if (allSettings.hasOwnProperty('customHeaderLinksEnabled')) {
        updates.customHeaderLinksEnabled = false;
      }
      // DO NOT touch 'customHeaderLinks' - it contains the actual array of links and should be preserved!

      // Save all updates
      await chrome.storage.sync.set(updates);

      // Reload settings to update UI
      await loadSettings();

      // Notify content scripts about changes
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('csod.com')) {
        for (const feature of Object.keys(updates)) {
          await notifyContentScript(feature, false);
        }
      }

      showStatus('All features have been turned off.', false);
    } catch (error) {
      console.error('Error turning off all features:', error);
      showStatus('Error turning off features', true);
    }
  });

  // Reset all features
  resetButton.addEventListener('click', async () => {
    const confirmed = await showConfirmationDialog(
      'This will RESET ALL features and settings to their defaults. This action cannot be undone!\n\n' +
      'All your customizations (colors, sizes, text, etc.) will be lost.\n\n' +
      'Click OK to proceed or Cancel to abort.',
      'Reset All Features'
    );

    if (!confirmed) return;

    try {
      // Get current customHeaderLinks array to preserve it (or reset to empty array)
      const currentCustomLinks = await chrome.storage.sync.get(['customHeaderLinks']);
      
      // Reset all settings to defaults
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      
      // Reset customHeaderLinks to empty array (preserve structure, clear data)
      await chrome.storage.sync.set({ customHeaderLinks: [] });
      
      // Also ensure customHeaderLinksEnabled is set to false
      await chrome.storage.sync.set({ customHeaderLinksEnabled: false });
      
      // Reset user dropdown defaults to first option in each dropdown
      // Get first option values from the dropdowns
      const statusDropdown = document.getElementById('user-status-default-select');
      const ouTypeDropdown = document.getElementById('user-ou-type-default-select');
      const countryDropdown = document.getElementById('user-country-default-select');
      
      const dropdownResets = {};
      
      if (statusDropdown && statusDropdown.options.length > 0) {
        dropdownResets.userStatusDropdownDefaultsSettings = statusDropdown.options[0].value;
      } else {
        // Fallback to default value
        dropdownResets.userStatusDropdownDefaultsSettings = '1';
      }
      
      if (ouTypeDropdown && ouTypeDropdown.options.length > 0) {
        dropdownResets.userOuTypeDropdownDefaultsSettings = ouTypeDropdown.options[0].value;
      } else {
        // Fallback to default value
        dropdownResets.userOuTypeDropdownDefaultsSettings = '-2';
      }
      
      if (countryDropdown && countryDropdown.options.length > 0) {
        dropdownResets.userCountryDropdownDefaultsSettings = countryDropdown.options[0].value;
      } else {
        // Fallback to default value (empty string)
        dropdownResets.userCountryDropdownDefaultsSettings = '';
      }
      
      // Reset dropdown defaults
      await chrome.storage.sync.set(dropdownResets);
      
      // Reset sessions checkbox defaults to only Tentative and Approved (Active) checked
      const sessionsCheckboxResets = {
        sessionsCheckboxDefaultsSettings: {
          tentative: true,
          approved: true,
          completed: false,
          cancelled: false
        }
      };
      await chrome.storage.sync.set(sessionsCheckboxResets);

      // Reload settings to update UI
      await loadSettings();
      
      // Reload dropdown defaults to update the dropdown UI elements
      await loadUserStatusDropdownDefaults();
      await loadUserOuTypeDropdownDefaults();
      await loadUserCountryDropdownDefaults();
      
      // Reload sessions checkbox defaults to update UI checkboxes
      await loadSessionsCheckboxDefaults();
      
      // Reload transcript and assignment status settings to update color pickers and opacity sliders
      // Get the reset settings to pass to load functions
      const resetSettings = DEFAULT_SETTINGS;
      loadTranscriptStatusSettings(resetSettings);
      loadAssignmentStatusSettings(resetSettings);
      
      // Clear proxy default text value in UI
      const proxyTextInput = document.getElementById('proxy-default-text-value');
      if (proxyTextInput) {
        proxyTextInput.value = '';
      }
      
      // Reset icon size and padding sliders in UI
      // AI Icon Size
      const aiIconSizeSlider = document.getElementById('ai-icon-size');
      const aiIconSizeValue = document.getElementById('ai-icon-size-value');
      if (aiIconSizeSlider && aiIconSizeValue) {
        const defaultAISize = DEFAULT_SETTINGS.resizeAIIconSize || 32;
        aiIconSizeSlider.value = defaultAISize;
        aiIconSizeValue.textContent = `${defaultAISize}px`;
        
        // Save to storage and apply the size change
        await chrome.storage.sync.set({ resizeAIIconSize: defaultAISize });
        applyAIIconSize(defaultAISize);
      }
      
      // Pinned Links Icon Size
      const pinnedLinksIconSizeSlider = document.getElementById('pinned-links-icon-size');
      const pinnedLinksIconSizeValue = document.getElementById('pinned-links-icon-size-value');
      if (pinnedLinksIconSizeSlider && pinnedLinksIconSizeValue) {
        const defaultPinnedLinksSize = DEFAULT_SETTINGS.resizePinnedLinksIconSize || 22;
        pinnedLinksIconSizeSlider.value = defaultPinnedLinksSize;
        pinnedLinksIconSizeValue.textContent = `${defaultPinnedLinksSize}px`;
        
        // Save to storage and apply the size change
        await chrome.storage.sync.set({ resizePinnedLinksIconSize: defaultPinnedLinksSize });
        applyPinnedLinksIconSize(defaultPinnedLinksSize);
      }
      
      // Custom Link Icon Size
      const customLinkIconSizeSlider = document.getElementById('custom-link-icon-size');
      const customLinkIconSizeValue = document.getElementById('custom-link-icon-size-value');
      if (customLinkIconSizeSlider && customLinkIconSizeValue) {
        const defaultCustomLinkSize = DEFAULT_SETTINGS.customLinkIconSize || 20;
        customLinkIconSizeSlider.value = defaultCustomLinkSize;
        customLinkIconSizeValue.textContent = `${defaultCustomLinkSize}px`;
        
        // Save to storage and apply the size change
        await chrome.storage.sync.set({ customLinkIconSize: defaultCustomLinkSize });
        applyCustomLinkIconSize(defaultCustomLinkSize);
      }
      
      // Header Padding (default is 16px based on setupHeaderPaddingControl)
      const headerPaddingSlider = document.getElementById('header-padding');
      const headerPaddingValue = document.getElementById('header-padding-value');
      if (headerPaddingSlider && headerPaddingValue) {
        const defaultPadding = 16;
        headerPaddingSlider.value = defaultPadding;
        headerPaddingValue.textContent = `${defaultPadding}px`;
        
        // Save to storage and apply the padding change
        await chrome.storage.sync.set({ headerPadding: defaultPadding });
        applyHeaderPadding(defaultPadding);
      }

      // Notify content scripts about all changes
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('csod.com')) {
        for (const feature of Object.keys(DEFAULT_SETTINGS)) {
          if (typeof DEFAULT_SETTINGS[feature] === 'boolean') {
            await notifyContentScript(feature, DEFAULT_SETTINGS[feature]);
          } else {
            // For non-boolean settings, send the value directly
            await chrome.tabs.sendMessage(tab.id, {
              type: 'SETTING_CHANGED',
              feature: feature,
              value: DEFAULT_SETTINGS[feature]
            }).catch(err => {
              console.log('Content script not ready:', err);
            });
          }
        }
        
        // Also notify about customHeaderLinks reset
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CUSTOM_LINKS_UPDATED'
        }).catch(err => {
          console.log('Content script not ready:', err);
        });
      }

      showStatus('All features and settings have been reset to defaults.', false);
    } catch (error) {
      console.error('Error resetting all features:', error);
      showStatus('Error resetting features', true);
    }
  });
}

