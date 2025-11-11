/**
 * Background Service Worker for Cornerstone LMS Admin Tools
 * Handles extension lifecycle, message coordination, and background tasks
 */

importScripts('../shared/storage-manager.js');

/**
 * Initialize default settings on installation
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Cornerstone LMS Admin Tools installed');
    
    // Set default settings
    const defaultSettings = {
      headerLogoutLink: false,
      toggleTentativeColumn: false,
      highlightZeroSessions: false,
      centerNumberColumns: false,
      formatSessionDates: false,
      highlightZeroEnrollments: false,
      centerEnrollmentColumn: false,
      customHeaderLinks: false
    };
    
    await chrome.storage.sync.set(defaultSettings);
    console.log('Default settings initialized');
    
    // Optionally open welcome page or instructions
    // chrome.tabs.create({ url: 'welcome.html' });
  } else if (details.reason === 'update') {
    console.log('Cornerstone LMS Admin Tools updated to version', chrome.runtime.getManifest().version);
  }
});

/**
 * Handle messages from popup or content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  // Handle different message types
  switch (message.type) {
    case 'GET_SETTINGS':
      handleGetSettings(sendResponse);
      return true; // Keep channel open for async response
      
    case 'UPDATE_SETTING':
      handleUpdateSetting(message.feature, message.enabled, sendResponse);
      return true;
      
    case 'NOTIFY_ALL_TABS':
      handleNotifyAllTabs(message.data);
      break;
      
    default:
      console.log('Unknown message type:', message.type);
  }
});

/**
 * Get current settings
 * @param {Function} sendResponse - Response callback
 */
async function handleGetSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get(null);
    sendResponse({ success: true, settings });
  } catch (error) {
    console.error('Error getting settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Update a setting and notify all tabs
 * @param {string} feature - Feature name
 * @param {boolean} enabled - Whether the feature is enabled
 * @param {Function} sendResponse - Response callback
 */
async function handleUpdateSetting(feature, enabled, sendResponse) {
  try {
    await chrome.storage.sync.set({ [feature]: enabled });
    
    // Notify all csod.com tabs about the change
    const tabs = await chrome.tabs.query({ url: 'https://*.csod.com/*' });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SETTING_CHANGED',
        feature: feature,
        enabled: enabled
      }).catch(err => {
        // Tab might not have content script loaded
        console.log('Could not notify tab:', tab.id, err);
      });
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error updating setting:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Notify all csod.com tabs with custom data
 * @param {Object} data - Data to send to tabs
 */
async function handleNotifyAllTabs(data) {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://*.csod.com/*' });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, data).catch(err => {
        console.log('Could not notify tab:', tab.id, err);
      });
    });
  } catch (error) {
    console.error('Error notifying tabs:', error);
  }
}

/**
 * Listen for storage changes and log them
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('Storage changed in', areaName);
  Object.keys(changes).forEach(key => {
    console.log(`  ${key}: ${changes[key].oldValue} → ${changes[key].newValue}`);
  });
});

/**
 * Handle extension icon clicks (optional)
 * Note: This won't fire if action.default_popup is set in manifest
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
  // Custom logic here if needed
});

/**
 * Monitor tab updates to inject content scripts if needed
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('csod.com')) {
    console.log('Cornerstone LMS page loaded:', tab.url);
    // Content scripts are automatically injected by manifest
    // Additional logic can be added here if needed
  }
});

console.log('Cornerstone LMS Admin Tools: Background service worker ready');

