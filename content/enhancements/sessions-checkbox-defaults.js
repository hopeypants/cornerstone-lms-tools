/**
 * Sessions Checkbox Defaults Enhancement
 * Controls the default checked state of status checkboxes on the Sessions page
 */

class SessionsCheckboxDefaultsEnhancement {
  constructor() {
    this.name = 'Sessions Checkbox Defaults';
    this.defaultSettings = {
      tentative: true,
      approved: true,
      completed: false,
      cancelled: false
    };
    this.settings = { ...this.defaultSettings };
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log('Sessions Checkbox Defaults: Initializing...');
    
    // Check if we're on a Sessions page by looking for the checkbox table
    const checkboxTable = document.getElementById('ctl00_ContentPlaceHolder1_StatusTypeList') || 
                         document.querySelector('table.NewUI-checkboxlist') ||
                         document.querySelector('table[class*="checkboxlist"]') ||
                         document.querySelector('table.checkboxlist');
    
    if (!checkboxTable) {
      console.log('Sessions Checkbox Defaults: Not on Sessions page (checkbox table not found), skipping initialization');
      return;
    }
    
    console.log('Sessions Checkbox Defaults: On Sessions page, proceeding with initialization');
    
    // Load settings from storage
    await this.loadSettings();
    
    // Try to apply checkbox defaults immediately
    this.applyCheckboxDefaults();
    
    // Set up a retry mechanism in case checkboxes load later
    this.setupRetryMechanism();
    
    console.log('Sessions Checkbox Defaults: Initialized successfully');
  }

  /**
   * Set up retry mechanism for late-loading checkboxes
   */
  setupRetryMechanism() {
    let retryCount = 0;
    const maxRetries = 10;
    
    const retryInterval = setInterval(() => {
      retryCount++;
      
      // Check if checkboxes are now available
        const checkboxTable = document.getElementById('ctl00_ContentPlaceHolder1_StatusTypeList') || 
                             document.querySelector('table.NewUI-checkboxlist') ||
                             document.querySelector('table[class*="checkboxlist"]') ||
                             document.querySelector('table.checkboxlist');
      
      if (checkboxTable) {
        console.log(`Sessions Checkbox Defaults: Found checkboxes on retry ${retryCount}`);
        this.applyCheckboxDefaults();
        clearInterval(retryInterval);
      } else if (retryCount >= maxRetries) {
        console.log('Sessions Checkbox Defaults: Max retries reached, giving up');
        clearInterval(retryInterval);
      }
    }, 500); // Retry every 500ms
  }

  /**
   * Load settings from Chrome storage
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['sessionsCheckboxDefaultsSettings']);
      console.log('Sessions Checkbox Defaults: Raw storage result:', result);
      
      if (result.sessionsCheckboxDefaultsSettings) {
        this.settings = { ...this.defaultSettings, ...result.sessionsCheckboxDefaultsSettings };
        console.log('Sessions Checkbox Defaults: Loaded settings:', this.settings);
      } else {
        console.log('Sessions Checkbox Defaults: No saved settings found, using defaults:', this.defaultSettings);
        this.settings = { ...this.defaultSettings };
      }
    } catch (error) {
      console.error('Sessions Checkbox Defaults: Error loading settings:', error);
    }
  }

  /**
   * Save settings to Chrome storage
   */
  async saveSettings() {
    try {
      await chrome.storage.sync.set({ sessionsCheckboxDefaultsSettings: this.settings });
      console.log('Sessions Checkbox Defaults: Settings saved:', this.settings);
    } catch (error) {
      console.error('Sessions Checkbox Defaults: Error saving settings:', error);
    }
  }

  /**
   * Apply the checkbox defaults to the page
   */
  applyCheckboxDefaults() {
    console.log('Sessions Checkbox Defaults: Looking for checkbox table...');
    
    const checkboxTable = document.getElementById('ctl00_ContentPlaceHolder1_StatusTypeList');
    if (!checkboxTable) {
      console.log('Sessions Checkbox Defaults: Checkbox table not found, trying alternative selectors...');
      
      // Try alternative selectors
      const altTable = document.querySelector('table.NewUI-checkboxlist') ||
                       document.querySelector('table[class*="checkboxlist"]') ||
                       document.querySelector('table.checkboxlist');
      if (altTable) {
        console.log('Sessions Checkbox Defaults: Found table with checkboxlist class');
        this.applyToTable(altTable);
        return;
      }
      
      console.log('Sessions Checkbox Defaults: No checkbox table found');
      return;
    }

    console.log('Sessions Checkbox Defaults: Found checkbox table');
    this.applyToTable(checkboxTable);
  }

  /**
   * Apply defaults to a specific table
   */
  applyToTable(table) {
    const checkboxes = table.querySelectorAll('input[type="checkbox"]');
    console.log(`Sessions Checkbox Defaults: Found ${checkboxes.length} checkboxes`);
    
    if (checkboxes.length !== 4) {
      console.log('Sessions Checkbox Defaults: Expected 4 checkboxes, found', checkboxes.length);
      return;
    }

    // Map checkbox indices to status types
    const statusTypes = ['tentative', 'approved', 'completed', 'cancelled'];
    
    checkboxes.forEach((checkbox, index) => {
      const statusType = statusTypes[index];
      const shouldBeChecked = this.settings[statusType];
      
      console.log(`Sessions Checkbox Defaults: Checkbox ${index} (${statusType}) - current: ${checkbox.checked}, should be: ${shouldBeChecked}`);
      
      if (checkbox.checked !== shouldBeChecked) {
        checkbox.checked = shouldBeChecked;
        console.log(`Sessions Checkbox Defaults: Set ${statusType} checkbox to ${shouldBeChecked}`);
        
        // Trigger change event to ensure any JavaScript handlers are notified
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    console.log('Sessions Checkbox Defaults: Applied checkbox defaults');
  }

  /**
   * Update settings and reapply
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.defaultSettings, ...newSettings };
    await this.saveSettings();
    this.applyCheckboxDefaults();
  }

  /**
   * Cleanup when enhancement is disabled
   */
  cleanup() {
    console.log('Sessions Checkbox Defaults: Cleaning up...');
    // No cleanup needed - we don't modify the DOM permanently
  }
}

// Make the enhancement available globally
window.SessionsCheckboxDefaultsEnhancement = SessionsCheckboxDefaultsEnhancement;
