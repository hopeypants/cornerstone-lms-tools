/**
 * User Status Dropdown Defaults Enhancement
 * Controls which option is selected by default in the User Status dropdown
 */

window.UserStatusDropdownDefaultsEnhancement = class {
  constructor() {
    this.name = 'User Status Dropdown Defaults';
    this.defaultSettings = '1'; // Default to "Active" (value="1")
    this.settings = this.defaultSettings;
    this.elements = [];
    this.styleElement = null;
    this.retryCount = 0;
    this.maxRetries = 10;
  }

  async initialize() {
    console.log('User Status Dropdown Defaults: Initializing...');

    // Check if we're on a Users page by looking for the User Status dropdown
    const userStatusDropdown = document.getElementById('UserStatus') ||
                               document.querySelector('select[data-tag="UserStatus"]');

    if (!userStatusDropdown) {
      console.log('User Status Dropdown Defaults: Not on Users page (User Status dropdown not found), skipping initialization');
      return;
    }

    console.log('User Status Dropdown Defaults: On Users page, proceeding with initialization');

    // Load settings from storage
    await this.loadSettings();

    // Try to apply dropdown defaults immediately
    this.applyDropdownDefaults();

    // Set up a retry mechanism in case dropdown loads later
    this.setupRetryMechanism();

    console.log('User Status Dropdown Defaults: Initialized successfully');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['userStatusDropdownDefaultsSettings']);
      console.log('User Status Dropdown Defaults: Raw storage result:', result);

      if (result.userStatusDropdownDefaultsSettings !== undefined) {
        this.settings = result.userStatusDropdownDefaultsSettings;
        console.log('User Status Dropdown Defaults: Loaded settings:', this.settings);
      } else {
        console.log('User Status Dropdown Defaults: No saved settings found, using defaults:', this.defaultSettings);
        this.settings = this.defaultSettings;
      }
    } catch (error) {
      console.error('User Status Dropdown Defaults: Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ userStatusDropdownDefaultsSettings: this.settings });
      console.log('User Status Dropdown Defaults: Settings saved:', this.settings);
    } catch (error) {
      console.error('User Status Dropdown Defaults: Error saving settings:', error);
    }
  }

  applyDropdownDefaults() {
    console.log('User Status Dropdown Defaults: Applying dropdown defaults...');

    const dropdown = document.getElementById('UserStatus') ||
                     document.querySelector('select[data-tag="UserStatus"]');

    if (!dropdown) {
      console.log('User Status Dropdown Defaults: Dropdown not found');
      return;
    }

    this.applyToDropdown(dropdown);
  }

  applyToDropdown(dropdown) {
    const options = dropdown.querySelectorAll('option');
    console.log(`User Status Dropdown Defaults: Found ${options.length} options`);

    if (options.length === 0) {
      console.log('User Status Dropdown Defaults: No options found');
      return;
    }

    // Find the option with the matching value
    let targetOption = null;
    options.forEach(option => {
      if (option.value === this.settings) {
        targetOption = option;
      }
    });

    if (targetOption) {
      // Remove selected from all options
      options.forEach(option => {
        option.selected = false;
        option.removeAttribute('selected');
      });

      // Set the desired option as selected
      targetOption.selected = true;
      targetOption.setAttribute('selected', 'selected');
      
      console.log(`User Status Dropdown Defaults: Set option with value ${this.settings} as selected`);

      // Trigger change event to ensure any JavaScript handlers are notified
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log(`User Status Dropdown Defaults: Option with value ${this.settings} not found`);
    }

    console.log('User Status Dropdown Defaults: Applied dropdown defaults');
  }

  setupRetryMechanism() {
    if (this.retryCount >= this.maxRetries) {
      console.log('User Status Dropdown Defaults: Max retries reached, giving up');
      return;
    }

    this.retryCount++;
    console.log(`User Status Dropdown Defaults: Setting up retry ${this.retryCount}/${this.maxRetries}`);

    setTimeout(() => {
      const dropdown = document.getElementById('UserStatus') ||
                       document.querySelector('select[data-tag="UserStatus"]');

      if (dropdown) {
        console.log('User Status Dropdown Defaults: Dropdown found on retry, applying defaults');
        this.applyToDropdown(dropdown);
      } else {
        console.log('User Status Dropdown Defaults: Dropdown still not found, will retry');
        this.setupRetryMechanism();
      }
    }, 1000);
  }

  cleanup() {
    console.log('User Status Dropdown Defaults: Cleaning up...');
    
    // Remove any added elements
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    this.elements = [];
    
    // Reset retry count
    this.retryCount = 0;
    
    console.log('User Status Dropdown Defaults: Cleanup complete');
  }
};
