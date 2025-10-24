/**
 * User OU Type Dropdown Defaults Enhancement
 * Controls which option is selected by default in the OU Type dropdown
 */

window.UserOuTypeDropdownDefaultsEnhancement = class {
  constructor() {
    this.name = 'User OU Type Dropdown Defaults';
    this.defaultSettings = '-2'; // Default to "Select OU Criteria"
    this.settings = this.defaultSettings;
    this.elements = [];
    this.styleElement = null;
    this.retryCount = 0;
    this.maxRetries = 10;
  }

  async initialize() {
    console.log('User OU Type Dropdown Defaults: Initializing...');

    // Check if we're on a Users page by looking for the OU Type dropdown
    const ouTypeDropdown = document.getElementById('ouFilter_ouFilterSelector_ddlTypesList') ||
                           document.querySelector('select[data-tag="ddlTypesList"]');

    if (!ouTypeDropdown) {
      console.log('User OU Type Dropdown Defaults: Not on Users page (OU Type dropdown not found), skipping initialization');
      return;
    }

    console.log('User OU Type Dropdown Defaults: On Users page, proceeding with initialization');

    // Load settings from storage
    await this.loadSettings();

    // Try to apply dropdown defaults immediately
    this.applyDropdownDefaults();

    // Set up a retry mechanism in case dropdown loads later
    this.setupRetryMechanism();

    console.log('User OU Type Dropdown Defaults: Initialized successfully');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['userOuTypeDropdownDefaultsSettings']);
      console.log('User OU Type Dropdown Defaults: Raw storage result:', result);

      if (result.userOuTypeDropdownDefaultsSettings !== undefined) {
        this.settings = result.userOuTypeDropdownDefaultsSettings;
        console.log('User OU Type Dropdown Defaults: Loaded settings:', this.settings);
      } else {
        console.log('User OU Type Dropdown Defaults: No saved settings found, using defaults:', this.defaultSettings);
        this.settings = this.defaultSettings;
      }
    } catch (error) {
      console.error('User OU Type Dropdown Defaults: Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ userOuTypeDropdownDefaultsSettings: this.settings });
      console.log('User OU Type Dropdown Defaults: Settings saved:', this.settings);
    } catch (error) {
      console.error('User OU Type Dropdown Defaults: Error saving settings:', error);
    }
  }

  applyDropdownDefaults() {
    console.log('User OU Type Dropdown Defaults: Applying dropdown defaults...');

    const dropdown = document.getElementById('ouFilter_ouFilterSelector_ddlTypesList') ||
                     document.querySelector('select[data-tag="ddlTypesList"]');

    if (!dropdown) {
      console.log('User OU Type Dropdown Defaults: Dropdown not found');
      return;
    }

    this.applyToDropdown(dropdown);
  }

  applyToDropdown(dropdown) {
    const options = dropdown.querySelectorAll('option');
    console.log(`User OU Type Dropdown Defaults: Found ${options.length} options`);

    if (options.length === 0) {
      console.log('User OU Type Dropdown Defaults: No options found');
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
      
      console.log(`User OU Type Dropdown Defaults: Set option with value ${this.settings} as selected`);

      // Trigger change event to ensure any JavaScript handlers are notified
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log(`User OU Type Dropdown Defaults: Option with value ${this.settings} not found`);
    }

    console.log('User OU Type Dropdown Defaults: Applied dropdown defaults');
  }

  setupRetryMechanism() {
    if (this.retryCount >= this.maxRetries) {
      console.log('User OU Type Dropdown Defaults: Max retries reached, giving up');
      return;
    }

    this.retryCount++;
    console.log(`User OU Type Dropdown Defaults: Setting up retry ${this.retryCount}/${this.maxRetries}`);

    setTimeout(() => {
      const dropdown = document.getElementById('ouFilter_ouFilterSelector_ddlTypesList') ||
                       document.querySelector('select[data-tag="ddlTypesList"]');

      if (dropdown) {
        console.log('User OU Type Dropdown Defaults: Dropdown found on retry, applying defaults');
        this.applyToDropdown(dropdown);
      } else {
        console.log('User OU Type Dropdown Defaults: Dropdown still not found, will retry');
        this.setupRetryMechanism();
      }
    }, 1000);
  }

  cleanup() {
    console.log('User OU Type Dropdown Defaults: Cleaning up...');
    
    // Remove any added elements
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    this.elements = [];
    
    // Reset retry count
    this.retryCount = 0;
    
    console.log('User OU Type Dropdown Defaults: Cleanup complete');
  }
};
