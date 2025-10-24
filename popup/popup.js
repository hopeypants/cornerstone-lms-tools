/**
 * Popup Script for Cornerstone LMS Admin Tools
 * Handles settings UI, toggle switches, and storage synchronization
 */

// Default settings for all features
const DEFAULT_SETTINGS = {
  headerLogoutLink: false,
  toggleTentativeColumn: false,
  highlightZeroSessions: false,
  centerNumberColumns: false,
  formatSessionDates: false,
  highlightZeroEnrollments: false,
  centerEnrollmentColumn: false,
  customHeaderLinks: false,
  sessionsCheckboxDefaults: false,
  userStatusDropdownDefaults: false,
  userOuTypeDropdownDefaults: false,
  userCountryDropdownDefaults: false
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
});

/**
 * Load saved settings from Chrome storage and update UI
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    
    // Special handling for customHeaderLinks - check the separate storage key
    if (settings.customHeaderLinks !== undefined) {
      // Check if we have the new storage key
      const customLinksEnabled = await chrome.storage.sync.get(['customHeaderLinksEnabled']);
      if (customLinksEnabled.customHeaderLinksEnabled !== undefined) {
        settings.customHeaderLinks = customLinksEnabled.customHeaderLinksEnabled;
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
              setTimeout(() => {
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
        }
      }
    });
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
      } else if (feature === 'userOuTypeDropdownDefaults') {
        const managementSection = document.getElementById('user-ou-type-dropdown-management');
        if (managementSection) {
          managementSection.style.display = enabled ? 'block' : 'none';
          // Setup event listeners when section becomes visible
          if (enabled) {
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
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
      }
    });
  });
}

/**
 * Save a single setting to Chrome storage
 * @param {string} feature - The feature name
 * @param {boolean} enabled - Whether the feature is enabled
 */
async function saveSetting(feature, enabled) {
  try {
    // Special handling for customHeaderLinks - use separate storage key for toggle state
    if (feature === 'customHeaderLinks') {
      // Save toggle state to a separate key to avoid overwriting the array data
      await chrome.storage.sync.set({ customHeaderLinksEnabled: enabled });
      console.log(`Saved customHeaderLinksEnabled toggle state: ${enabled} (preserved customHeaderLinks array data)`);
    } else {
      await chrome.storage.sync.set({ [feature]: enabled });
    }
    // Status message removed - no confirmation needed
  } catch (error) {
    console.error('Error saving setting:', error);
    showStatus('Error saving setting', true);
  }
}

/**
 * Notify content script about setting changes
 * @param {string} feature - The feature name
 * @param {boolean} enabled - Whether the feature is enabled
 */
async function notifyContentScript(feature, enabled) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Only send message if on a csod.com domain
    if (tab && tab.url && tab.url.includes('csod.com')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SETTING_CHANGED',
        feature: feature,
        enabled: enabled
      }).catch(err => {
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

  // Add remove all button
  const removeAllButton = document.getElementById('remove-all-links');
  removeAllButton.addEventListener('click', () => {
    showRemoveAllConfirmation();
  });


  // Setup header padding control
  setupHeaderPaddingControl();

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
    draggedElement = e.target;
    draggedIndex = parseInt(e.target.dataset.index);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
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
    const allItems = container.querySelectorAll('.custom-link-item');
    let newIndex = 0;
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i] === draggedElement) {
        newIndex = i;
        break;
      }
    }
    
    if (draggedIndex !== newIndex) {
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
    
    // Ensure customLinks is always an array - but preserve existing data
    if (!Array.isArray(customLinks)) {
      console.warn('customLinks is not an array, initializing as empty array but NOT saving:', customLinks);
      customLinks = [];
      // DO NOT save empty array - it might wipe out data during toggle operations
    }
    
    console.log('Current custom links before reorder:', customLinks);
    
    if (fromIndex >= 0 && fromIndex < customLinks.length &&
        toIndex >= 0 && toIndex < customLinks.length) {
      
      // Move the item
      const link = customLinks.splice(fromIndex, 1)[0];
      customLinks.splice(toIndex, 0, link);
      
      console.log('Custom links after reorder:', customLinks);
      
      await chrome.storage.sync.set({ customHeaderLinks: customLinks });
      console.log('Successfully saved reordered custom links to storage');
      
      // Notify content script about the change
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('csod.com')) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'CUSTOM_LINKS_UPDATED',
          customLinks: customLinks
        });
        console.log('Notified content script about reorder');
      }
      
      // Reload the display
      await loadCustomLinks();
      console.log('Reloaded custom links display');
    } else {
      console.warn(`Invalid indices: fromIndex=${fromIndex}, toIndex=${toIndex}, array length=${customLinks.length}`);
    }
  } catch (error) {
    console.error('Error reordering custom links:', error);
    showValidationModal('Error reordering custom links. Please try again.');
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
      <i class="${iconClass}"></i>
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
      openNewTab
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
 * Perform the remove all operation
 */
async function performRemoveAll() {
  try {
    await chrome.storage.sync.set({ customHeaderLinks: [] });
    
    // Notify content script about the change
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('csod.com')) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'CUSTOM_LINKS_UPDATED',
        customLinks: []
      }).catch(err => {
        console.log('Content script not ready:', err);
      });
    }
    
    loadCustomLinks();
  } catch (error) {
    console.error('Error removing all custom links:', error);
    showValidationModal('Error removing all custom links. Please try again.');
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
 * Setup user OU type dropdown defaults management
 */
function setupUserOuTypeDropdownManagement() {
  console.log('User OU Type Dropdown Management: Setting up...');
  
  // Load saved dropdown defaults
  loadUserOuTypeDropdownDefaults();
  
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

