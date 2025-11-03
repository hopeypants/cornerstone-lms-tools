/**
 * Highlight Environments
 * Changes header background color and adds watermarks based on environment
 */

(function() {
  'use strict';

  let isEnabled = false;
  let isApplying = false; // Flag to prevent infinite loops
  let isInitializing = false; // Flag to prevent multiple simultaneous initializations
  let lastAppliedEnvironment = null; // Track what we last applied
  let observerInstance = null; // Store observer to disable/enable it
  let hasHeaderBeenApplied = false; // Track if we've applied highlighting
  let urlCheckInterval = null; // Store interval for URL checking
  let settings = {
    production: { enabled: true, headerColorEnabled: false, color: '#950606', headerOpacity: 100, watermark: false, watermarkColor: '#000000', watermarkOpacity: 50 },
    staging: { enabled: true, headerColorEnabled: false, color: '#06402B', headerOpacity: 100, watermark: false, watermarkColor: '#000000', watermarkOpacity: 50 },
    pilot: { enabled: true, headerColorEnabled: false, color: '#111184', headerOpacity: 100, watermark: false, watermarkColor: '#000000', watermarkOpacity: 50 }
  };

  /**
   * Convert hex color to rgba
   */
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  /**
   * Detect current environment from URL
   */
  function detectEnvironment() {
    const hostname = window.location.hostname.toLowerCase();
    
    // Check for staging: *-stg.csod.com
    if (hostname.includes('-stg.csod.com')) {
      return 'staging';
    }
    
    // Check for pilot: *-pilot.csod.com
    if (hostname.includes('-pilot.csod.com')) {
      return 'pilot';
    }
    
    // Default to production (anything else ending in csod.com)
    if (hostname.includes('.csod.com')) {
      return 'production';
    }
    
    // Fallback to production if not a csod.com domain
    return 'production';
  }

  /**
   * Apply environment highlighting to header
   */
  function applyEnvironmentHighlight(environment) {
    // Prevent infinite loops - strict check
    if (isApplying) {
      return;
    }

    const envSettings = settings[environment];
    if (!envSettings) {
      return;
    }
    
    // Check if this environment is enabled (controlled by expand toggle)
    if (!envSettings.enabled) {
      // Environment is disabled, remove all effects but keep settings
      const header = document.querySelector('header.c-page-header');
      if (header) {
        removeEnvironmentHighlight();
        const existingWatermark = header.querySelector('.environment-watermark-container');
        if (existingWatermark) {
          existingWatermark.remove();
        }
      }
      lastAppliedEnvironment = null;
      isApplying = false;
      return;
    }
    
    const header = document.querySelector('header.c-page-header');
    if (!header) {
      return;
    }
    
    // Skip if we're already applying the same environment with same settings
    // Only skip if both color and watermark settings haven't changed
    const styleElement = document.getElementById('environment-highlight-style');
    const existingWatermarkCheck = header.querySelector('.environment-watermark-container');
    
    if (lastAppliedEnvironment === environment) {
      // Check if header color settings match
      if (envSettings.headerColorEnabled) {
        if (styleElement) {
          // Check if rgba color matches (approximate match by checking color and opacity)
          const hexColor = envSettings.color;
          const opacity = envSettings.headerOpacity !== undefined ? envSettings.headerOpacity : 100;
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          const expectedRgba = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
          const styleText = styleElement.textContent || '';
          if (!styleText.includes(expectedRgba)) {
            // Color or opacity changed, need to reapply
          } else {
            // Header color matches, continue to check watermark
            if ((envSettings.watermark && existingWatermarkCheck) || (!envSettings.watermark && !existingWatermarkCheck)) {
              // Both header color and watermark match current state, skip
              return;
            }
          }
        } else {
          // Should have style but doesn't, need to apply
        }
      } else {
        // Header color disabled, check if watermark matches
        if (!styleElement || styleElement.textContent.trim() === '') {
          // No color style (correct for disabled), check watermark
          if ((envSettings.watermark && existingWatermarkCheck) || (!envSettings.watermark && !existingWatermarkCheck)) {
            // Watermark matches current state, skip
            return;
          }
        }
      }
    }

    isApplying = true;
    
    // Disable observer while applying to prevent loops
    if (observerInstance) {
      observerInstance.disconnect();
    }

    // Apply background color only if enabled (independent from watermark)
    if (envSettings.headerColorEnabled) {
      const hexColor = envSettings.color;
      const opacity = envSettings.headerOpacity !== undefined ? envSettings.headerOpacity : 100;
      
      // Convert hex to rgba with opacity
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
      
      // If there's a CSS rule overriding, inject a style tag with !important
      const styleId = 'environment-highlight-style';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `header.c-page-header { background-color: ${rgbaColor} !important; transition: background-color 0.3s ease !important; }`;
      
      // Also apply as inline style as backup
      header.style.backgroundColor = rgbaColor;
      header.style.transition = 'background-color 0.3s ease';
    } else {
      // Remove background color if disabled
      removeEnvironmentHighlight();
    }

    // Add or remove watermark
    const existingWatermark = header.querySelector('.environment-watermark-container');
    
    if (envSettings.watermark) {
      // Remove existing watermark if switching environments
      if (existingWatermark) {
        existingWatermark.remove();
      }

      // Create watermark
      const watermarkContainer = document.createElement('div');
      watermarkContainer.className = 'environment-watermark-container';
      watermarkContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: 0;
      `;

      // Create repeated watermark text at an angle
      const watermarkText = environment.charAt(0).toUpperCase() + environment.slice(1);
      const headerHeight = header.offsetHeight || 60;
      const headerWidth = header.offsetWidth || window.innerWidth;

      // Calculate font size to fit within header height (use 30% of height for better fit)
      const fontSize = Math.min(18, Math.max(12, headerHeight * 0.3)); // Between 12-18px

      // Calculate spacing - tighter for smaller headers
      const spacingX = Math.min(150, headerWidth * 0.3); // Horizontal spacing
      const spacingY = headerHeight; // Vertical spacing matches header height (single row)

      // Get watermark color and opacity from settings
      const watermarkColor = envSettings.watermarkColor || '#000000';
      const watermarkOpacity = envSettings.watermarkOpacity !== undefined ? envSettings.watermarkOpacity : 50;
      
      // Convert hex to rgba for watermark color
      const r = parseInt(watermarkColor.slice(1, 3), 16);
      const g = parseInt(watermarkColor.slice(3, 5), 16);
      const b = parseInt(watermarkColor.slice(5, 7), 16);
      const rgbaColor = `rgba(${r}, ${g}, ${b}, ${watermarkOpacity / 100})`;

      // Create watermarks in a grid pattern that stays within header bounds
      // Start from top-left with padding, ensuring we stay within header
      const startX = 20;
      const startY = headerHeight / 2; // Center vertically in header
      const maxX = headerWidth - 50; // Leave some right padding

      for (let x = startX; x < maxX; x += spacingX) {
        // Only create one row of watermarks centered vertically
        const watermark = document.createElement('div');
        watermark.className = 'environment-watermark';
        watermark.textContent = watermarkText;
        watermark.style.cssText = `
          position: absolute;
          font-size: ${fontSize}px;
          font-weight: bold;
          color: ${rgbaColor};
          transform: rotate(-25deg);
          transform-origin: center;
          white-space: nowrap;
          user-select: none;
          pointer-events: none;
          z-index: 0;
          left: ${x}px;
          top: ${startY - fontSize / 2}px; /* Center vertically */
          line-height: ${fontSize}px;
        `;
        
        watermarkContainer.appendChild(watermark);
      }

      // Make sure header has relative positioning
      const currentPosition = window.getComputedStyle(header).position;
      if (currentPosition === 'static') {
        header.style.position = 'relative';
      }

      // Make sure header content is above watermark
      const headerChildren = Array.from(header.children);
      headerChildren.forEach(child => {
        if (child !== watermarkContainer && child.style) {
          const childPosition = window.getComputedStyle(child).position;
          if (childPosition === 'static' || childPosition === 'relative') {
            child.style.position = 'relative';
            child.style.zIndex = child.style.zIndex || '1';
          } else {
            const currentZIndex = window.getComputedStyle(child).zIndex;
            if (!currentZIndex || currentZIndex === 'auto') {
              child.style.zIndex = '1';
            }
          }
        }
      });

      header.insertBefore(watermarkContainer, header.firstChild);
    } else {
      // Remove watermark if it exists
      if (existingWatermark) {
        existingWatermark.remove();
      }
    }

    lastAppliedEnvironment = environment;
    
    // Re-enable observer after a short delay
    setTimeout(() => {
      isApplying = false;
      if (observerInstance && isEnabled) {
        // Re-observe if needed (observer will be recreated in init)
      }
    }, 100);
  }

  /**
   * Remove all environment highlighting
   */
  function removeEnvironmentHighlight() {
    const header = document.querySelector('header.c-page-header');
    if (!header) return;

    header.style.backgroundColor = '';
    header.style.transition = '';

    // Remove the injected style element
    const styleElement = document.getElementById('environment-highlight-style');
    if (styleElement) {
      styleElement.remove();
    }

    const watermark = header.querySelector('.environment-watermark-container');
    if (watermark) {
      watermark.remove();
    }

    // Reset z-index on header children
    const headerChildren = Array.from(header.children);
    headerChildren.forEach(child => {
      if (child.style && child.style.position === 'relative') {
        child.style.position = '';
        child.style.zIndex = '';
      }
    });
  }

  /**
   * Initialize the enhancement
   */
  async function init() {
    // Prevent multiple simultaneous initializations
    if (isInitializing) {
      return;
    }
    
    isInitializing = true;
    
    // Clean up existing observer and interval
    if (observerInstance) {
      observerInstance.disconnect();
      observerInstance = null;
    }
    if (urlCheckInterval) {
      clearInterval(urlCheckInterval);
      urlCheckInterval = null;
    }
    
    // Load settings from storage
    const storedSettings = await chrome.storage.sync.get([
      'highlightEnvironments',
      'environmentProductionEnabled',
      'environmentProductionHeaderColorEnabled',
      'environmentProductionColor',
      'environmentProductionHeaderOpacity',
      'environmentProductionWatermark',
      'environmentProductionWatermarkColor',
      'environmentProductionWatermarkOpacity',
      'environmentStagingEnabled',
      'environmentStagingHeaderColorEnabled',
      'environmentStagingColor',
      'environmentStagingHeaderOpacity',
      'environmentStagingWatermark',
      'environmentStagingWatermarkColor',
      'environmentStagingWatermarkOpacity',
      'environmentPilotEnabled',
      'environmentPilotHeaderColorEnabled',
      'environmentPilotColor',
      'environmentPilotHeaderOpacity',
      'environmentPilotWatermark',
      'environmentPilotWatermarkColor',
      'environmentPilotWatermarkOpacity'
    ]);

    isEnabled = storedSettings.highlightEnvironments || false;

    // Update settings object
    // Check if environment is enabled (default true if not set, for backward compatibility)
    const productionEnabled = storedSettings.environmentProductionEnabled !== undefined ? storedSettings.environmentProductionEnabled : true;
    const stagingEnabled = storedSettings.environmentStagingEnabled !== undefined ? storedSettings.environmentStagingEnabled : true;
    const pilotEnabled = storedSettings.environmentPilotEnabled !== undefined ? storedSettings.environmentPilotEnabled : true;
    
    settings.production = {
      enabled: productionEnabled,
      headerColorEnabled: storedSettings.environmentProductionHeaderColorEnabled || false,
      color: storedSettings.environmentProductionColor || '#950606',
      headerOpacity: storedSettings.environmentProductionHeaderOpacity !== undefined ? storedSettings.environmentProductionHeaderOpacity : 100,
      watermark: storedSettings.environmentProductionWatermark || false,
      watermarkColor: storedSettings.environmentProductionWatermarkColor || '#000000',
      watermarkOpacity: storedSettings.environmentProductionWatermarkOpacity !== undefined ? storedSettings.environmentProductionWatermarkOpacity : 50
    };

    settings.staging = {
      enabled: stagingEnabled,
      headerColorEnabled: storedSettings.environmentStagingHeaderColorEnabled || false,
      color: storedSettings.environmentStagingColor || '#06402B',
      headerOpacity: storedSettings.environmentStagingHeaderOpacity !== undefined ? storedSettings.environmentStagingHeaderOpacity : 100,
      watermark: storedSettings.environmentStagingWatermark || false,
      watermarkColor: storedSettings.environmentStagingWatermarkColor || '#000000',
      watermarkOpacity: storedSettings.environmentStagingWatermarkOpacity !== undefined ? storedSettings.environmentStagingWatermarkOpacity : 50
    };

    settings.pilot = {
      enabled: pilotEnabled,
      headerColorEnabled: storedSettings.environmentPilotHeaderColorEnabled || false,
      color: storedSettings.environmentPilotColor || '#111184',
      headerOpacity: storedSettings.environmentPilotHeaderOpacity !== undefined ? storedSettings.environmentPilotHeaderOpacity : 100,
      watermark: storedSettings.environmentPilotWatermark || false,
      watermarkColor: storedSettings.environmentPilotWatermarkColor || '#000000',
      watermarkOpacity: storedSettings.environmentPilotWatermarkOpacity !== undefined ? storedSettings.environmentPilotWatermarkOpacity : 50
    };

    if (isEnabled) {
      // Function to apply highlighting when header is ready
      const applyWhenReady = () => {
        const header = document.querySelector('header.c-page-header');
        if (!header) {
          return false;
        }
        
        const environment = detectEnvironment();
        // Check if this environment is enabled and has either header color or watermark enabled
        const envSettings = settings[environment];
        if (envSettings && envSettings.enabled && (envSettings.headerColorEnabled || envSettings.watermark)) {
          applyEnvironmentHighlight(environment);
          return true;
        }
        return false;
      };

      // Try immediately, then retry if header not found
      if (!applyWhenReady()) {
        // Wait a bit for DOM to be ready and try again
        setTimeout(() => {
          if (!applyWhenReady()) {
            // One more retry after longer delay
            setTimeout(applyWhenReady, 500);
          }
        }, 100);
      }

      // Set flag after initial application attempt
      if (document.querySelector('header.c-page-header') && document.getElementById('environment-highlight-style')) {
        hasHeaderBeenApplied = true;
      }
      
      // Watch for DOM changes (in case header loads dynamically)
      // Use a minimal observer that only checks if header exists, not all mutations
      let observerTimeout;
      
      const observer = new MutationObserver(() => {
        // Skip if we're applying or already applied or initializing
        if (isApplying || hasHeaderBeenApplied || isInitializing) {
          return;
        }
        
        // Heavy debounce to prevent loops
        if (observerTimeout) {
          clearTimeout(observerTimeout);
        }
        
        observerTimeout = setTimeout(() => {
          // Only check if header exists and we haven't applied
          if (isApplying || hasHeaderBeenApplied || isInitializing) {
            return;
          }
          
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const environment = detectEnvironment();
            const envSettings = settings[environment];
            // Check if we need to apply (environment enabled and either header color or watermark enabled)
            if (envSettings && envSettings.enabled && (envSettings.headerColorEnabled || envSettings.watermark)) {
              const styleEl = document.getElementById('environment-highlight-style');
              const watermarkEl = header.querySelector('.environment-watermark-container');
              // Apply if either header color or watermark is missing when it should be there
              if ((envSettings.headerColorEnabled && !styleEl) || (envSettings.watermark && !watermarkEl)) {
                hasHeaderBeenApplied = true;
                applyEnvironmentHighlight(environment);
              }
            }
          }
        }, 2000); // Very long debounce to prevent loops
      });

      observerInstance = observer;
      observer.observe(document.body, {
        childList: true,
        subtree: false, // Only direct children
        attributes: false,
        attributeOldValue: false,
        characterData: false
      });
      
      // Reset flag when page navigation happens (for SPAs)
      const resetOnNavigation = () => {
        hasHeaderBeenApplied = false;
        lastAppliedEnvironment = null;
        // Remove style element so we can reapply
        const styleEl = document.getElementById('environment-highlight-style');
        if (styleEl) {
          styleEl.remove();
        }
      };
      
      // Reset on URL changes (for SPAs)
      let lastUrl = window.location.href;
      urlCheckInterval = setInterval(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          resetOnNavigation();
        }
      }, 1000);
      
      // Clean up interval when page unloads
      window.addEventListener('beforeunload', () => {
        if (urlCheckInterval) {
          clearInterval(urlCheckInterval);
        }
        if (observerInstance) {
          observerInstance.disconnect();
        }
      });
      
      isInitializing = false;
    } else {
      removeEnvironmentHighlight();
      lastAppliedEnvironment = null;
      hasHeaderBeenApplied = false;
      isInitializing = false;
    }
  }

  /**
   * Handle storage changes
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      let shouldUpdate = false;

      if (changes.highlightEnvironments) {
        isEnabled = changes.highlightEnvironments.newValue || false;
        shouldUpdate = true;
      }

      // Check if any environment was disabled
      // Only remove effects if it's the currently active environment
      const currentEnv = detectEnvironment();
      
      if (changes.environmentProductionEnabled && changes.environmentProductionEnabled.newValue === false) {
        settings.production.enabled = false;
        if (currentEnv === 'production') {
          // Production was disabled and it's the current environment - remove effects immediately
          removeEnvironmentHighlight();
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const watermark = header.querySelector('.environment-watermark-container');
            if (watermark) watermark.remove();
          }
        }
      }
      if (changes.environmentStagingEnabled && changes.environmentStagingEnabled.newValue === false) {
        settings.staging.enabled = false;
        if (currentEnv === 'staging') {
          // Staging was disabled and it's the current environment - remove effects immediately
          removeEnvironmentHighlight();
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const watermark = header.querySelector('.environment-watermark-container');
            if (watermark) watermark.remove();
          }
        }
      }
      if (changes.environmentPilotEnabled && changes.environmentPilotEnabled.newValue === false) {
        settings.pilot.enabled = false;
        if (currentEnv === 'pilot') {
          // Pilot was disabled and it's the current environment - remove effects immediately
          removeEnvironmentHighlight();
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const watermark = header.querySelector('.environment-watermark-container');
            if (watermark) watermark.remove();
          }
        }
      }

      // Also check if any environment was re-enabled
      if (changes.environmentProductionEnabled && changes.environmentProductionEnabled.newValue === true) {
        settings.production.enabled = true;
        shouldUpdate = true;
      }
      if (changes.environmentStagingEnabled && changes.environmentStagingEnabled.newValue === true) {
        settings.staging.enabled = true;
        shouldUpdate = true;
      }
      if (changes.environmentPilotEnabled && changes.environmentPilotEnabled.newValue === true) {
        settings.pilot.enabled = true;
        shouldUpdate = true;
      }

      // Check for header color toggles being turned off
      if (changes.environmentProductionHeaderColorEnabled && changes.environmentProductionHeaderColorEnabled.newValue === false) {
        settings.production.headerColorEnabled = false;
        if (currentEnv === 'production') {
          // Remove header color immediately if it's the current environment
          const styleElement = document.getElementById('environment-highlight-style');
          if (styleElement) {
            styleElement.remove();
          }
          const header = document.querySelector('header.c-page-header');
          if (header) {
            header.style.backgroundColor = '';
            header.style.transition = '';
          }
        }
      }
      if (changes.environmentStagingHeaderColorEnabled && changes.environmentStagingHeaderColorEnabled.newValue === false) {
        settings.staging.headerColorEnabled = false;
        if (currentEnv === 'staging') {
          // Remove header color immediately if it's the current environment
          const styleElement = document.getElementById('environment-highlight-style');
          if (styleElement) {
            styleElement.remove();
          }
          const header = document.querySelector('header.c-page-header');
          if (header) {
            header.style.backgroundColor = '';
            header.style.transition = '';
          }
        }
      }
      if (changes.environmentPilotHeaderColorEnabled && changes.environmentPilotHeaderColorEnabled.newValue === false) {
        settings.pilot.headerColorEnabled = false;
        if (currentEnv === 'pilot') {
          // Remove header color immediately if it's the current environment
          const styleElement = document.getElementById('environment-highlight-style');
          if (styleElement) {
            styleElement.remove();
          }
          const header = document.querySelector('header.c-page-header');
          if (header) {
            header.style.backgroundColor = '';
            header.style.transition = '';
          }
        }
      }
      
      // Check for watermark toggles being turned off
      if (changes.environmentProductionWatermark && changes.environmentProductionWatermark.newValue === false) {
        settings.production.watermark = false;
        if (currentEnv === 'production') {
          // Remove watermark immediately if it's the current environment
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const watermark = header.querySelector('.environment-watermark-container');
            if (watermark) watermark.remove();
          }
        }
      }
      if (changes.environmentStagingWatermark && changes.environmentStagingWatermark.newValue === false) {
        settings.staging.watermark = false;
        if (currentEnv === 'staging') {
          // Remove watermark immediately if it's the current environment
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const watermark = header.querySelector('.environment-watermark-container');
            if (watermark) watermark.remove();
          }
        }
      }
      if (changes.environmentPilotWatermark && changes.environmentPilotWatermark.newValue === false) {
        settings.pilot.watermark = false;
        if (currentEnv === 'pilot') {
          // Remove watermark immediately if it's the current environment
          const header = document.querySelector('header.c-page-header');
          if (header) {
            const watermark = header.querySelector('.environment-watermark-container');
            if (watermark) watermark.remove();
          }
        }
      }
      
      // Update watermark settings when they change
      if (changes.environmentProductionWatermark && changes.environmentProductionWatermark.newValue === true) {
        settings.production.watermark = true;
        shouldUpdate = true;
      }
      if (changes.environmentStagingWatermark && changes.environmentStagingWatermark.newValue === true) {
        settings.staging.watermark = true;
        shouldUpdate = true;
      }
      if (changes.environmentPilotWatermark && changes.environmentPilotWatermark.newValue === true) {
        settings.pilot.watermark = true;
        shouldUpdate = true;
      }
      
      // Update other watermark settings (color, opacity)
      if (changes.environmentProductionWatermarkColor) {
        settings.production.watermarkColor = changes.environmentProductionWatermarkColor.newValue;
        shouldUpdate = true;
      }
      if (changes.environmentProductionWatermarkOpacity) {
        settings.production.watermarkOpacity = changes.environmentProductionWatermarkOpacity.newValue;
        shouldUpdate = true;
      }
      if (changes.environmentStagingWatermarkColor) {
        settings.staging.watermarkColor = changes.environmentStagingWatermarkColor.newValue;
        shouldUpdate = true;
      }
      if (changes.environmentStagingWatermarkOpacity) {
        settings.staging.watermarkOpacity = changes.environmentStagingWatermarkOpacity.newValue;
        shouldUpdate = true;
      }
      if (changes.environmentPilotWatermarkColor) {
        settings.pilot.watermarkColor = changes.environmentPilotWatermarkColor.newValue;
        shouldUpdate = true;
      }
      if (changes.environmentPilotWatermarkOpacity) {
        settings.pilot.watermarkOpacity = changes.environmentPilotWatermarkOpacity.newValue;
        shouldUpdate = true;
      }

      const environmentKeys = [
        'environmentProductionHeaderColorEnabled', 'environmentProductionColor', 'environmentProductionHeaderOpacity',
        'environmentStagingHeaderColorEnabled', 'environmentStagingColor', 'environmentStagingHeaderOpacity',
        'environmentPilotHeaderColorEnabled', 'environmentPilotColor', 'environmentPilotHeaderOpacity'
      ];

      for (const key of environmentKeys) {
        if (changes[key]) {
          shouldUpdate = true;
          break;
        }
      }

      if (shouldUpdate && !isApplying && !isInitializing) {
        // Reset flags to allow reapplication
        lastAppliedEnvironment = null;
        hasHeaderBeenApplied = false;
        const styleEl = document.getElementById('environment-highlight-style');
        if (styleEl) {
          styleEl.remove();
        }
        // Use setTimeout to debounce rapid storage changes
        setTimeout(() => {
          if (!isInitializing) {
            init();
          }
        }, 100);
      }
    }
  });

  /**
   * Handle messages from popup
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SETTING_CHANGED' && message.feature === 'highlightEnvironments') {
      isEnabled = message.enabled;
      if (isEnabled && !isInitializing && !isApplying) {
        // Reset flags to allow reapplication
        lastAppliedEnvironment = null;
        hasHeaderBeenApplied = false;
        setTimeout(() => {
          if (!isInitializing) {
            init();
          }
        }, 100);
      } else {
        removeEnvironmentHighlight();
        lastAppliedEnvironment = null;
        hasHeaderBeenApplied = false;
      }
    } else if (message.type === 'SETTING_CHANGED' && message.feature === 'environmentSettingsChanged') {
      if (!isInitializing && !isApplying) {
        // Reload all environment settings from storage
        chrome.storage.sync.get([
          'environmentProductionEnabled',
          'environmentProductionHeaderColorEnabled',
          'environmentProductionWatermark',
          'environmentStagingEnabled',
          'environmentStagingHeaderColorEnabled',
          'environmentStagingWatermark',
          'environmentPilotEnabled',
          'environmentPilotHeaderColorEnabled',
          'environmentPilotWatermark'
        ], (result) => {
          // Check current environment to see if we need to remove effects
          const currentEnvironment = detectEnvironment();
          
          // Update enabled states immediately
          if (result.environmentProductionEnabled !== undefined) {
            settings.production.enabled = result.environmentProductionEnabled;
            if (!result.environmentProductionEnabled && currentEnvironment === 'production') {
              // Remove effects for production if it's the current environment
              removeEnvironmentHighlight();
              const header = document.querySelector('header.c-page-header');
              if (header) {
                const watermark = header.querySelector('.environment-watermark-container');
                if (watermark) watermark.remove();
              }
            }
          }
          if (result.environmentStagingEnabled !== undefined) {
            settings.staging.enabled = result.environmentStagingEnabled;
            if (!result.environmentStagingEnabled && currentEnvironment === 'staging') {
              // Remove effects for staging if it's the current environment
              removeEnvironmentHighlight();
              const header = document.querySelector('header.c-page-header');
              if (header) {
                const watermark = header.querySelector('.environment-watermark-container');
                if (watermark) watermark.remove();
              }
            }
          }
          if (result.environmentPilotEnabled !== undefined) {
            settings.pilot.enabled = result.environmentPilotEnabled;
            if (!result.environmentPilotEnabled && currentEnvironment === 'pilot') {
              // Remove effects for pilot if it's the current environment
              removeEnvironmentHighlight();
              const header = document.querySelector('header.c-page-header');
              if (header) {
                const watermark = header.querySelector('.environment-watermark-container');
                if (watermark) watermark.remove();
              }
            }
          }
          
          // Update watermark states immediately
          if (result.environmentProductionWatermark !== undefined) {
            settings.production.watermark = result.environmentProductionWatermark;
            if (!result.environmentProductionWatermark && currentEnvironment === 'production') {
              // Remove watermark for production if it's the current environment
              const header = document.querySelector('header.c-page-header');
              if (header) {
                const watermark = header.querySelector('.environment-watermark-container');
                if (watermark) watermark.remove();
              }
            }
          }
          if (result.environmentStagingWatermark !== undefined) {
            settings.staging.watermark = result.environmentStagingWatermark;
            if (!result.environmentStagingWatermark && currentEnvironment === 'staging') {
              // Remove watermark for staging if it's the current environment
              const header = document.querySelector('header.c-page-header');
              if (header) {
                const watermark = header.querySelector('.environment-watermark-container');
                if (watermark) watermark.remove();
              }
            }
          }
          if (result.environmentPilotWatermark !== undefined) {
            settings.pilot.watermark = result.environmentPilotWatermark;
            if (!result.environmentPilotWatermark && currentEnvironment === 'pilot') {
              // Remove watermark for pilot if it's the current environment
              const header = document.querySelector('header.c-page-header');
              if (header) {
                const watermark = header.querySelector('.environment-watermark-container');
                if (watermark) watermark.remove();
              }
            }
          }
          
          // Update header color enabled states immediately
          if (result.environmentProductionHeaderColorEnabled !== undefined) {
            settings.production.headerColorEnabled = result.environmentProductionHeaderColorEnabled;
            if (!result.environmentProductionHeaderColorEnabled && currentEnvironment === 'production') {
              // Remove header color for production if it's the current environment
              const styleElement = document.getElementById('environment-highlight-style');
              if (styleElement) {
                styleElement.remove();
              }
              const header = document.querySelector('header.c-page-header');
              if (header) {
                header.style.backgroundColor = '';
                header.style.transition = '';
              }
            }
          }
          if (result.environmentStagingHeaderColorEnabled !== undefined) {
            settings.staging.headerColorEnabled = result.environmentStagingHeaderColorEnabled;
            if (!result.environmentStagingHeaderColorEnabled && currentEnvironment === 'staging') {
              // Remove header color for staging if it's the current environment
              const styleElement = document.getElementById('environment-highlight-style');
              if (styleElement) {
                styleElement.remove();
              }
              const header = document.querySelector('header.c-page-header');
              if (header) {
                header.style.backgroundColor = '';
                header.style.transition = '';
              }
            }
          }
          if (result.environmentPilotHeaderColorEnabled !== undefined) {
            settings.pilot.headerColorEnabled = result.environmentPilotHeaderColorEnabled;
            if (!result.environmentPilotHeaderColorEnabled && currentEnvironment === 'pilot') {
              // Remove header color for pilot if it's the current environment
              const styleElement = document.getElementById('environment-highlight-style');
              if (styleElement) {
                styleElement.remove();
              }
              const header = document.querySelector('header.c-page-header');
              if (header) {
                header.style.backgroundColor = '';
                header.style.transition = '';
              }
            }
          }
          
          // Reset flags and reinitialize if needed
          lastAppliedEnvironment = null;
          hasHeaderBeenApplied = false;
          setTimeout(() => {
            if (!isInitializing) {
              init();
            }
          }, 100);
        });
      }
    }
  });

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

