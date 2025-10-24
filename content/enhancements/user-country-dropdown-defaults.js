/**
 * User Country Dropdown Defaults Enhancement
 * Controls which option is selected by default in the Country dropdown
 */

window.UserCountryDropdownDefaultsEnhancement = class {
  constructor() {
    this.name = 'User Country Dropdown Defaults';
    this.defaultSettings = ''; // Default to empty (Country placeholder)
    this.settings = this.defaultSettings;
    this.elements = [];
    this.styleElement = null;
    this.retryCount = 0;
    this.maxRetries = 10;
  }

  async initialize() {
    console.log('User Country Dropdown Defaults: Initializing...');

    // Check if we're on a Users page by looking for the Country dropdown
    const countryDropdown = document.getElementById('countryList') ||
                            document.querySelector('select[data-tag="countryList"]');

    if (!countryDropdown) {
      console.log('User Country Dropdown Defaults: Not on Users page (Country dropdown not found), skipping initialization');
      return;
    }

    console.log('User Country Dropdown Defaults: On Users page, proceeding with initialization');

    // Load settings from storage
    await this.loadSettings();

    // Try to apply dropdown defaults immediately
    this.applyDropdownDefaults();

    // Set up a retry mechanism in case dropdown loads later
    this.setupRetryMechanism();

    console.log('User Country Dropdown Defaults: Initialized successfully');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['userCountryDropdownDefaultsSettings']);
      console.log('User Country Dropdown Defaults: Raw storage result:', result);

      if (result.userCountryDropdownDefaultsSettings !== undefined) {
        this.settings = result.userCountryDropdownDefaultsSettings;
        console.log('User Country Dropdown Defaults: Loaded settings:', this.settings);
      } else {
        console.log('User Country Dropdown Defaults: No saved settings found, using defaults:', this.defaultSettings);
        this.settings = this.defaultSettings;
      }
    } catch (error) {
      console.error('User Country Dropdown Defaults: Error loading settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ userCountryDropdownDefaultsSettings: this.settings });
      console.log('User Country Dropdown Defaults: Settings saved:', this.settings);
    } catch (error) {
      console.error('User Country Dropdown Defaults: Error saving settings:', error);
    }
  }

  applyDropdownDefaults() {
    console.log('User Country Dropdown Defaults: Applying dropdown defaults...');

    const dropdown = document.getElementById('countryList') ||
                     document.querySelector('select[data-tag="countryList"]');

    if (!dropdown) {
      console.log('User Country Dropdown Defaults: Dropdown not found');
      return;
    }

    this.applyToDropdown(dropdown);
  }

  applyToDropdown(dropdown) {
    const options = dropdown.querySelectorAll('option');
    console.log(`User Country Dropdown Defaults: Found ${options.length} options`);

    if (options.length === 0) {
      console.log('User Country Dropdown Defaults: No options found');
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
      
      console.log(`User Country Dropdown Defaults: Set option with value ${this.settings} as selected`);

      // Trigger change event to ensure any JavaScript handlers are notified
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      console.log(`User Country Dropdown Defaults: Option with value ${this.settings} not found`);
    }

    console.log('User Country Dropdown Defaults: Applied dropdown defaults');
  }

  setupRetryMechanism() {
    if (this.retryCount >= this.maxRetries) {
      console.log('User Country Dropdown Defaults: Max retries reached, giving up');
      return;
    }

    this.retryCount++;
    console.log(`User Country Dropdown Defaults: Setting up retry ${this.retryCount}/${this.maxRetries}`);

    setTimeout(() => {
      const dropdown = document.getElementById('countryList') ||
                       document.querySelector('select[data-tag="countryList"]');

      if (dropdown) {
        console.log('User Country Dropdown Defaults: Dropdown found on retry, applying defaults');
        this.applyToDropdown(dropdown);
      } else {
        console.log('User Country Dropdown Defaults: Dropdown still not found, will retry');
        this.setupRetryMechanism();
      }
    }, 1000);
  }

  cleanup() {
    console.log('User Country Dropdown Defaults: Cleaning up...');
    
    // Remove any added elements
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    this.elements = [];
    
    // Reset retry count
    this.retryCount = 0;
    
    console.log('User Country Dropdown Defaults: Cleanup complete');
  }
};
