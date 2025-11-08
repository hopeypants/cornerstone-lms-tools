/**
 * Custom Header Links Enhancement
 * Allows users to add, configure, and reorder custom links in the header
 */

class CustomHeaderLinksEnhancement {
  constructor() {
    this.name = 'Custom Header Links';
    this.elements = [];
    this.customLinks = [];
    this.linksContainer = null;
    this.iconSize = 20; // Default icon size in pixels
    this.isRendering = false; // Flag to prevent duplicate rendering
    this.flexStyleElement = null; // Reference to the injected flex CSS style element
  }

  /**
   * Inject CSS for .c-hdr-item :first-child display: flex (excluding custom-separator)
   */
  injectFlexCSS() {
    // Remove existing style if it exists
    this.removeFlexCSS();
    
    const styleId = 'custom-header-links-flex-css';
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .c-hdr-item :first-child:not(.custom-separator :first-child) {
        display: flex;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
    this.flexStyleElement = style;
    console.log(`${this.name}: Injected flex CSS for .c-hdr-item :first-child (excluding custom-separator)`);
  }

  /**
   * Remove the flex CSS
   */
  removeFlexCSS() {
    if (this.flexStyleElement) {
      if (this.flexStyleElement.parentNode) {
        this.flexStyleElement.parentNode.removeChild(this.flexStyleElement);
      }
      this.flexStyleElement = null;
      console.log(`${this.name}: Removed flex CSS`);
    } else {
      // Also try to remove by ID in case the reference is lost
      const existingStyle = document.getElementById('custom-header-links-flex-css');
      if (existingStyle) {
        existingStyle.remove();
        console.log(`${this.name}: Removed flex CSS by ID`);
      }
    }
  }

  /**
   * Initialize the enhancement
   */
  async initialize() {
    console.log(`${this.name}: Initializing...`);

    // Load Font Awesome 7 for icon rendering
    if (window.FontAwesomeUtil) {
      await window.FontAwesomeUtil.load();
    }

    // Inject flex CSS when feature is enabled
    this.injectFlexCSS();

    try {
      // Load icon size from storage
      await this.loadIconSize();
      
      // Load custom links from storage
      await this.loadCustomLinks();
      
      // Only proceed if we have links to render or the feature is enabled
      // Even if links array is empty, we still want to apply icon sizes to default icons
      const header = await this.waitForElement('header.c-page-header', 5000);
      
      // Render all custom links directly to header (only if we have links)
      if (this.customLinks.length > 0) {
      this.renderCustomLinks();
      }
      
      // Apply icon size to all icons (including default CSOD icons) - always do this
      this.applyIconSizeToAll();
      
      // Setup MutationObserver to keep custom links at the start (only if we have links)
      if (this.customLinks.length > 0) {
      this.setupHeaderItemsObserver();
      }
      
      console.log(`${this.name}: Custom links initialized with ${this.customLinks.length} links`);
    } catch (error) {
      // If header not found, don't throw - just log and continue with listeners
      // This allows icon size changes to still work even if header isn't ready
      console.warn(`${this.name}: Could not find header element within timeout - will retry on page navigation or when header appears`, error);
    }
    
    // Listen for icon size changes
    this.setupMessageListeners();
    
    // Listen for storage changes
    this.setupStorageListeners();
    
    // Watch for search active state changes
    this.setupSearchActiveWatcher();
  }
  
  /**
   * Load icon size from storage
   */
  async loadIconSize() {
    try {
      const result = await chrome.storage.sync.get(['customLinkIconSize']);
      this.iconSize = result.customLinkIconSize || 20;
      console.log(`${this.name}: Icon size loaded: ${this.iconSize}px`);
    } catch (error) {
      console.error(`${this.name}: Error loading icon size:`, error);
      this.iconSize = 20;
    }
  }
  
  /**
   * Apply icon size to an icon element
   */
  applyIconSize(iconElement) {
    if (iconElement) {
      // Always set z-index
      iconElement.style.zIndex = '1';
      iconElement.style.setProperty('z-index', '1', 'important');
      
      if (this.iconSize) {
        iconElement.style.fontSize = `${this.iconSize}px`;
        iconElement.style.setProperty('font-size', `${this.iconSize}px`, 'important');
        console.log(`${this.name}: Applied icon size ${this.iconSize}px to icon element`);
      }
    }
  }
  
  /**
   * Apply icon size to all existing icons (including logout link and default CSOD icons)
   */
  applyIconSizeToAll() {
    console.log(`${this.name}: Applying icon size ${this.iconSize}px to all FontAwesome icons in header items`);
    
    const header = document.querySelector('header.c-page-header');
    if (!header) {
      console.warn(`${this.name}: Could not find header element`);
      return;
    }
    
    // Find all .c-hdr-item elements in the header
    const headerItems = header.querySelectorAll('.c-hdr-item');
    let totalIconsApplied = 0;
    
    headerItems.forEach((headerItem, itemIndex) => {
      // Check if this is a custom separator - separators are now border-based, skip icon processing
      if (headerItem.classList.contains('custom-separator')) {
        return; // Skip icon processing for separators
      }
      
      // Find all FontAwesome icons within this header item
      // FontAwesome icons can have classes like: fa-icon-*, fa-solid, fa-regular, fa-brands, etc.
      const faIcons = headerItem.querySelectorAll('i[class*="fa-icon-"], i[class*="fa-solid"], i[class*="fa-regular"], i[class*="fa-brands"], i[class^="fa-"]');
      
      faIcons.forEach((icon, iconIndex) => {
        // Special handling for search icons when search is active
        const isSearchItem = headerItem.classList.contains('search');
        const searchActive = document.querySelector('.c-global-search.active');
        
        if (isSearchItem && searchActive) {
          // If search is active, set to 20px
          icon.style.fontSize = '20px';
          icon.style.setProperty('font-size', '20px', 'important');
          icon.style.zIndex = '1';
          icon.style.setProperty('z-index', '1', 'important');
          console.log(`${this.name}: Applied 20px to active search icon in header item ${itemIndex}`);
        } else {
          // Apply custom icon size
          this.applyIconSize(icon);
          totalIconsApplied++;
        }
      });
    });
    
    console.log(`${this.name}: Applied icon size to ${totalIconsApplied} FontAwesome icons and separators in header items`);
  }
  
  /**
   * Apply specific size to search icons
   * @param {number} size - Size in pixels (or null to use custom icon size)
   */
  applySearchIconSize(size = null) {
    const header = document.querySelector('header.c-page-header');
    if (!header) {
      return;
    }
    
    // Find all search header items
    const searchItems = header.querySelectorAll('.c-hdr-item.search');
    const finalSize = size !== null ? size : this.iconSize;
    
    searchItems.forEach((searchItem, itemIndex) => {
      // Find all FontAwesome icons within this search header item
      const faIcons = searchItem.querySelectorAll('i[class*="fa-icon-"], i[class*="fa-solid"], i[class*="fa-regular"], i[class*="fa-brands"], i[class^="fa-"]');
      
      faIcons.forEach((icon, iconIndex) => {
        if (icon) {
          icon.style.fontSize = `${finalSize}px`;
          icon.style.setProperty('font-size', `${finalSize}px`, 'important');
          icon.style.zIndex = '1';
          icon.style.setProperty('z-index', '1', 'important');
          console.log(`${this.name}: Applied ${finalSize}px to search icon ${iconIndex} in search item ${itemIndex}`);
        }
      });
    });
  }
  
  /**
   * Setup watcher for search active state changes
   */
  setupSearchActiveWatcher() {
    // Track if we're already observing the search element
    let isObservingSearch = false;
    
    // Check initial state
    this.updateSearchIconSizeForActiveState();
    
    // Function to observe .c-global-search element
    const observeSearchElement = () => {
      const globalSearch = document.querySelector('.c-global-search');
      if (globalSearch && !isObservingSearch) {
        observer.observe(globalSearch, {
          attributes: true,
          attributeFilter: ['class']
        });
        isObservingSearch = true;
      }
    };
    
    // Watch for changes to .c-global-search.active
    const observer = new MutationObserver(() => {
      this.updateSearchIconSizeForActiveState();
    });
    
    // Try to observe immediately
    observeSearchElement();
    
    // Also observe document body for dynamically added elements
    const bodyObserver = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.matches && node.matches('.c-global-search')) {
                shouldCheck = true;
              } else if (node.querySelector && node.querySelector('.c-global-search')) {
                shouldCheck = true;
              }
            }
          });
        } else if (mutation.type === 'attributes' && mutation.target.classList) {
          if (mutation.target.classList.contains('c-global-search')) {
            this.updateSearchIconSizeForActiveState();
          }
        }
      });
      
      if (shouldCheck) {
        observeSearchElement();
        this.updateSearchIconSizeForActiveState();
      }
    });
    
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
    
    // Store observers for cleanup if needed
    this.searchActiveObserver = observer;
    this.searchActiveBodyObserver = bodyObserver;
    
    // Also listen for click events on search elements as a fallback
    const clickHandler = () => {
      setTimeout(() => {
        this.updateSearchIconSizeForActiveState();
      }, 100);
    };
    
    document.addEventListener('click', clickHandler, true);
    this.searchClickHandler = clickHandler;
  }
  
  /**
   * Update search icon size based on active state
   */
  updateSearchIconSizeForActiveState() {
    const searchActive = document.querySelector('.c-global-search.active');
    if (searchActive) {
      // Search is active - set to 20px
      this.applySearchIconSize(20);
    } else {
      // Search is not active - use custom icon size
      this.applySearchIconSize();
    }
  }
  
  /**
   * Setup message listeners
   */
  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'APPLY_CUSTOM_LINK_ICON_SIZE') {
        this.iconSize = message.size || 20;
        this.applyIconSizeToAll();
        // Also update search icon size if not active
        this.updateSearchIconSizeForActiveState();
      }
      // Note: CUSTOM_LINKS_UPDATED is handled by content.js to avoid duplicate listeners
    });
  }
  
  /**
   * Setup storage change listeners
   */
  setupStorageListeners() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync') {
        // Handle icon size changes
        if (changes.customLinkIconSize) {
          const newSize = changes.customLinkIconSize.newValue || 20;
          console.log(`${this.name}: Storage changed - icon size: ${newSize}px`);
          this.iconSize = newSize;
          this.applyIconSizeToAll();
          // Also update search icon size if not active
          this.updateSearchIconSizeForActiveState();
        }
        
        // Note: customHeaderLinks changes are handled by content.js to avoid duplicate rendering
        // The content.js storage listener will call renderCustomLinks() via the active enhancement
      }
    });
  }

  /**
   * Load custom links from Chrome storage
   */
  async loadCustomLinks() {
    try {
      const result = await chrome.storage.sync.get(['customHeaderLinks']);
      let customLinks = result.customHeaderLinks;
      
      // Ensure customLinks is always an array - fix if it's false or invalid
      if (!Array.isArray(customLinks)) {
        console.warn(`${this.name}: customLinks is not an array (value: ${customLinks}), resetting to empty array and saving`, customLinks);
        customLinks = [];
        // Save the corrected value to fix the storage
        try {
          await chrome.storage.sync.set({ customHeaderLinks: [] });
          console.log(`${this.name}: Fixed customHeaderLinks in storage (set to empty array)`);
        } catch (error) {
          console.error(`${this.name}: Error fixing customHeaderLinks in storage:`, error);
        }
      }
      
      this.customLinks = customLinks;
      console.log(`${this.name}: Loaded ${this.customLinks.length} custom links`);
    } catch (error) {
      console.error(`${this.name}: Error loading custom links:`, error);
      this.customLinks = [];
    }
  }

  /**
   * Save custom links to Chrome storage
   */
  async saveCustomLinks() {
    try {
      await chrome.storage.sync.set({ customHeaderLinks: this.customLinks });
      console.log(`${this.name}: Saved ${this.customLinks.length} custom links`);
    } catch (error) {
      console.error(`${this.name}: Error saving custom links:`, error);
    }
  }

  /**
   * Find the insertion point in the header (first non-custom header item)
   * @param {Element} header - The header element
   * @returns {Element|null} - The element to insert before, or null to insert at start
   */
  findInsertionPoint(header) {
    // Find the first non-custom .c-hdr-item element (insert before all default header items)
    // Exclude custom links and custom separators
    const headerItems = header.querySelectorAll('.c-hdr-item:not(.custom-separator):not([class*="custom-link-"])');
    
    if (headerItems.length > 0) {
      const firstItem = headerItems[0];
      console.log(`${this.name}: Found insertion point - first default header item`);
      return firstItem;
    }
    
    // No header items found - will insert at start
    console.log(`${this.name}: No existing header items found, will insert at start`);
    return null;
  }

  /**
   * Move all custom links to the start of the header (before all other header items)
   */
  moveCustomLinksToStart() {
    const header = document.querySelector('header.c-page-header');
    if (!header) {
      return;
    }

    // Find all custom link elements (query DOM directly to be robust)
    const allCustomLinks = header.querySelectorAll('.c-hdr-item[class*="custom-link-"], .c-hdr-item.custom-separator');
    
    if (allCustomLinks.length === 0) {
      return;
    }

    // Find the first non-custom header item to insert before
    const firstNonCustomItem = header.querySelector('.c-hdr-item:not(.custom-separator):not([class*="custom-link-"])');
    
    // Check if custom links are already at the start
    const firstCustomLink = allCustomLinks[0];
    if (firstNonCustomItem) {
      // There are non-custom items - check if custom links are already before them
      const allHeaderItems = Array.from(header.children);
      const firstNonCustomIndex = allHeaderItems.indexOf(firstNonCustomItem);
      const firstCustomIndex = allHeaderItems.indexOf(firstCustomLink);
      
      // If custom links are already before all non-custom items, no need to move
      if (firstCustomIndex < firstNonCustomIndex) {
        // Verify all custom links are grouped at the start
        let allCustomAreFirst = true;
        for (let i = 0; i < allCustomLinks.length; i++) {
          const customIndex = allHeaderItems.indexOf(allCustomLinks[i]);
          if (customIndex >= firstNonCustomIndex) {
            allCustomAreFirst = false;
            break;
          }
        }
        if (allCustomAreFirst) {
          // Already in the correct position, no need to move
          return;
        }
      }
    } else {
      // No non-custom items exist - check if custom links are already first
      const allHeaderItems = Array.from(header.children);
      let allCustomAreFirst = true;
      for (let i = 0; i < allCustomLinks.length; i++) {
        if (allHeaderItems.indexOf(allCustomLinks[i]) !== i) {
          allCustomAreFirst = false;
          break;
        }
      }
      if (allCustomAreFirst) {
        // Already in the correct position, no need to move
        return;
      }
    }
    
    // Move all custom links to before the first non-custom item (or to start if none exist)
    // Use the order from this.elements array (matches this.customLinks order) to maintain correct order
    // If this.elements is not available or out of sync, fall back to DOM order
    let customLinksArray;
    
    if (this.elements && this.elements.length === allCustomLinks.length) {
      // Use this.elements order (which matches customLinks order)
      // Filter to only include elements that are still in the DOM and in allCustomLinks
      const allCustomLinksArray = Array.from(allCustomLinks);
      customLinksArray = this.elements.filter(el => 
        el && 
        el.parentNode === header && 
        allCustomLinksArray.includes(el)
      );
      
      // Add any missing elements from allCustomLinks that aren't in this.elements
      allCustomLinksArray.forEach(el => {
        if (!customLinksArray.includes(el)) {
          customLinksArray.push(el);
        }
      });
    } else {
      // Fallback: use DOM order (may not be correct, but better than reverse)
      customLinksArray = Array.from(allCustomLinks);
    }
    
    // Determine insertion point (before first non-custom item, or at start)
    const insertionPoint = firstNonCustomItem || header.firstChild;
    
    // Insert first item before insertion point
    if (customLinksArray.length > 0 && customLinksArray[0].parentNode === header) {
      if (insertionPoint) {
        header.insertBefore(customLinksArray[0], insertionPoint);
      } else {
        if (header.firstChild) {
          header.insertBefore(customLinksArray[0], header.firstChild);
        } else {
          header.appendChild(customLinksArray[0]);
        }
      }
    }
    
    // Insert subsequent items after the previous one (to maintain order)
    for (let i = 1; i < customLinksArray.length; i++) {
      const link = customLinksArray[i];
      if (link && link.parentNode === header) {
        const previousLink = customLinksArray[i - 1];
        if (previousLink && previousLink.nextSibling) {
          // Insert after previous link
          header.insertBefore(link, previousLink.nextSibling);
        } else if (previousLink) {
          // Previous link has no next sibling, insert before insertion point
          if (insertionPoint) {
            header.insertBefore(link, insertionPoint);
        } else {
            header.appendChild(link);
          }
        } else {
          // Fallback
          if (insertionPoint) {
            header.insertBefore(link, insertionPoint);
          } else {
            header.appendChild(link);
          }
        }
      }
    }
    
    console.log(`${this.name}: Moved ${customLinksArray.length} custom links to start of header`);
  }

  /**
   * Setup MutationObserver to watch for new header items and keep custom links at the start
   */
  setupHeaderItemsObserver() {
    const header = document.querySelector('header.c-page-header');
    if (!header) {
      console.warn(`${this.name}: Could not find header for MutationObserver`);
      return;
    }

    // Use a flag to prevent infinite loops when we move elements
    let isMovingCustomLinks = false;

    const observer = new MutationObserver((mutations) => {
      // Don't react if we're currently moving custom links
      if (isMovingCustomLinks) {
        return;
      }

      let shouldMove = false;

      mutations.forEach((mutation) => {
        // Check if new header items were added
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            // Check if the added node is a header item (and not a custom link)
            if (node.nodeType === 1) { // Element node
              if (node.classList && node.classList.contains('c-hdr-item')) {
                // Only move if it's not a custom link or separator
                if (!node.classList.contains('custom-separator') && 
                    !node.className.includes('custom-link-')) {
                  shouldMove = true;
                }
              }
              // Also check if any child header items were added
              if (node.querySelector && node.querySelector('.c-hdr-item:not(.custom-separator):not([class*="custom-link-"])')) {
                shouldMove = true;
              }
            }
          });
        }
      });

      if (shouldMove) {
        // Use setTimeout to avoid re-entrancy issues
        setTimeout(() => {
          isMovingCustomLinks = true;
          this.moveCustomLinksToStart();
          // Reset flag after a brief delay
          setTimeout(() => {
            isMovingCustomLinks = false;
          }, 50);
        }, 10);
      }
    });

    // Observe the header for child additions/removals
    observer.observe(header, {
      childList: true,
      subtree: false // Only watch direct children of header
    });

    // Store observer for cleanup
    this.headerItemsObserver = observer;
    console.log(`${this.name}: MutationObserver setup complete for header items`);
  }

  /**
   * Render all custom links
   */
  renderCustomLinks() {
    // Prevent duplicate rendering
    if (this.isRendering) {
      console.log(`${this.name}: Already rendering, skipping duplicate call`);
      return;
    }
    
    this.isRendering = true;
    
    try {
      // Find insertion point first (before removing elements)
      const header = document.querySelector('header.c-page-header');
      if (!header) {
        console.warn(`${this.name}: Could not find header element`);
        return;
      }
      
      // Ensure header is positioned relatively for separator positioning
      if (window.getComputedStyle(header).position === 'static') {
        header.style.position = 'relative';
      }

      // Clear existing links from DOM directly (more robust than relying on this.elements)
      // Remove all custom link elements by querying the DOM directly
      const existingCustomLinks = header.querySelectorAll('.c-hdr-item[class*="custom-link-"], .c-hdr-item.custom-separator');
      const removedCount = existingCustomLinks.length;
      existingCustomLinks.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // Also clear from this.elements array
      this.elements = [];
      
      if (removedCount > 0) {
        console.log(`${this.name}: Removed ${removedCount} existing custom link elements from DOM`);
      }

      const insertionPoint = this.findInsertionPoint(header);
      
      // Render each custom link directly to the header, inserting at the start
      // Iterate forward (0 to length-1) so items at the beginning of the array (top of list) end up leftmost
      for (let i = 0; i < this.customLinks.length; i++) {
        const link = this.customLinks[i];
        const linkElement = this.createLinkElement(link, i);
        
        if (insertionPoint) {
          if (i === 0) {
            // First item: insert before insertionPoint (leftmost position)
          insertionPoint.parentNode.insertBefore(linkElement, insertionPoint);
          } else {
            // Subsequent items: insert after the previous item (to the right)
            const previousElement = this.elements[i - 1];
            if (previousElement) {
              // Insert after the previous element
              if (previousElement.nextSibling) {
                previousElement.parentNode.insertBefore(linkElement, previousElement.nextSibling);
              } else {
                // No next sibling, append after previous element
                previousElement.parentNode.appendChild(linkElement);
              }
            } else {
              // Fallback: insert before insertionPoint
              insertionPoint.parentNode.insertBefore(linkElement, insertionPoint);
            }
          }
        } else {
          // No existing header items - insert at the very start
          if (i === 0) {
            // First item: insert at start (leftmost)
          if (header.firstChild) {
            header.insertBefore(linkElement, header.firstChild);
          } else {
            header.appendChild(linkElement);
            }
          } else {
            // Subsequent items: insert after the previous item (to the right)
            const previousElement = this.elements[i - 1];
            if (previousElement && previousElement.nextSibling) {
              previousElement.parentNode.insertBefore(linkElement, previousElement.nextSibling);
            } else if (previousElement) {
              // Append after previous element
              previousElement.parentNode.appendChild(linkElement);
            } else {
              header.appendChild(linkElement);
            }
          }
        }
        
        this.elements.push(linkElement);
      }
      
      console.log(`${this.name}: Rendered ${this.elements.length} custom links`);
    } finally {
      // Use setTimeout to ensure rendering flag is cleared even if an error occurs
      setTimeout(() => {
        this.isRendering = false;
      }, 100);
    }
  }

  /**
   * Create a single link element
   * @param {Object} link - Link configuration
   * @param {number} index - Link index
   * @returns {Element} - The link element
   */
  createLinkElement(link, index) {
    // Handle separators differently
    if (link.type === 'separator') {
      const separatorDiv = document.createElement('div');
      separatorDiv.className = 'c-hdr-item custom-separator';
      
      // Get separator properties with defaults
      const borderWidth = link.borderWidth || link.width || 1; // Support both for backward compatibility
      const color = link.color || '#ffffff'; // default white
      const height = link.height || 60; // default 60% height
      const iconPadding = this.headerPadding || 16; // Use header padding setting for icon padding (left and right margins)
            
      const lineDiv = document.createElement('div');
      lineDiv.style.cssText = `
        width: ${borderWidth}px;
        height: ${height}%;
        background-color: ${color};
      `;

      separatorDiv.appendChild(lineDiv);
      return separatorDiv;
    }

    // Create wrapper div (same structure as logout link)
    const wrapperDiv = document.createElement('div');
    
    // Create a CSS-safe class name from the label
    const labelClass = link.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    wrapperDiv.className = `c-hdr-item custom-link-${labelClass}`;
    wrapperDiv.style.lineHeight = '1.5';

      // Create inner anchor tag
      const linkElement = document.createElement('a');
      linkElement.href = link.url;
      linkElement.title = link.tooltip || link.label;
      linkElement.style.opacity = '1';
      
      // Add target="_blank" if openNewTab is true
      if (link.openNewTab) {
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
      }

    // Create icon element only (no label text)
    const iconElement = document.createElement('i');
    iconElement.className = this.getIconClass(link.icon, link);
    iconElement.setAttribute('aria-hidden', 'true');
    
    // Apply icon size if setting exists
    this.applyIconSize(iconElement);
    
    // Ensure z-index is set (applyIconSize sets it, but ensure it's there even if iconSize isn't set)
    if (!iconElement.style.zIndex) {
      iconElement.style.zIndex = '1';
      iconElement.style.setProperty('z-index', '1', 'important');
    }
    
    // Apply icon color if specified
    if (link.iconColor && link.iconColor !== '#ffffff') {
      iconElement.style.color = link.iconColor;
      iconElement.style.setProperty('color', link.iconColor, 'important');
    }

    linkElement.appendChild(iconElement);
    wrapperDiv.appendChild(linkElement);

    return wrapperDiv;
  }

  /**
   * Get the appropriate icon class based on icon name
   * @param {string} iconName - The icon name
   * @param {Object} link - The link object containing customIcon
   * @returns {string} - The icon class
   */
  getIconClass(iconName, link = null) {
    // Handle custom icons
    if (iconName === 'custom' && link && link.customIcon) {
      let customIconClass = link.customIcon.trim();
      
      // Convert old FA3 icon-* or fa-icon-* to FA7 format if needed
      // Keep FA7 classes (fa-solid, fa-brands, etc.) as-is
      if (customIconClass.startsWith('icon-') && !customIconClass.startsWith('fa-')) {
        // Convert icon-* to fa-solid fa-* for FA7
        const iconName = customIconClass.replace('icon-', '');
        customIconClass = `fa-solid fa-${iconName}`;
      } else if (customIconClass.startsWith('fa-icon-') && !customIconClass.includes('fa-solid') && !customIconClass.includes('fa-brands')) {
        // Convert fa-icon-* to fa-solid fa-* for FA7
        const iconName = customIconClass.replace('fa-icon-', '');
        customIconClass = `fa-solid fa-${iconName}`;
      }
      
      return customIconClass;
    }
    
    const iconMap = {
      'home': { fa3: 'fa-icon-home', fa6: 'fa-solid fa-house', none: '🏠' },
      'settings': { fa3: 'fa-icon-cog', fa6: 'fa-solid fa-gear', none: '⚙️' },
      'user': { fa3: 'fa-icon-user', fa6: 'fa-solid fa-user', none: '👤' },
      'help': { fa3: 'fa-icon-question-sign', fa6: 'fa-solid fa-circle-question', none: '❓' },
      'info': { fa3: 'fa-icon-info-sign', fa6: 'fa-solid fa-circle-info', none: 'ℹ️' },
      'download': { fa3: 'fa-icon-download', fa6: 'fa-solid fa-download', none: '⬇️' },
      'upload': { fa3: 'fa-icon-upload', fa6: 'fa-solid fa-upload', none: '⬆️' },
      'edit': { fa3: 'fa-icon-edit', fa6: 'fa-solid fa-pen', none: '✏️' },
      'search': { fa3: 'fa-icon-search', fa6: 'fa-solid fa-magnifying-glass', none: '🔍' },
      'calendar': { fa3: 'fa-icon-calendar', fa6: 'fa-solid fa-calendar', none: '📅' },
      'chart': { fa3: 'fa-icon-bar-chart', fa6: 'fa-solid fa-chart-bar', none: '📊' },
      'folder': { fa3: 'fa-icon-folder-close', fa6: 'fa-solid fa-folder', none: '📁' },
      'file': { fa3: 'fa-icon-file', fa6: 'fa-solid fa-file', none: '📄' },
      'link': { fa3: 'fa-icon-link', fa6: 'fa-solid fa-link', none: '🔗' },
      'external': { fa3: 'fa-icon-external-link', fa6: 'fa-solid fa-arrow-up-right-from-square', none: '↗️' },
      'plus': { fa3: 'fa-icon-plus', fa6: 'fa-solid fa-plus', none: '➕' },
      'minus': { fa3: 'fa-icon-minus', fa6: 'fa-solid fa-minus', none: '➖' },
      'check': { fa3: 'fa-icon-check', fa6: 'fa-solid fa-check', none: '✅' },
      'times': { fa3: 'fa-icon-remove', fa6: 'fa-solid fa-xmark', none: '❌' },
      'star': { fa3: 'fa-icon-star', fa6: 'fa-solid fa-star', none: '⭐' },
      'heart': { fa3: 'fa-icon-heart', fa6: 'fa-solid fa-heart', none: '❤️' },
      'bell': { fa3: 'fa-icon-bell', fa6: 'fa-solid fa-bell', none: '🔔' },
      'envelope': { fa3: 'fa-icon-envelope', fa6: 'fa-solid fa-envelope', none: '✉️' },
      'phone': { fa3: 'fa-icon-phone', fa6: 'fa-solid fa-phone', none: '📞' },
      'camera': { fa3: 'fa-icon-camera', fa6: 'fa-solid fa-camera', none: '📷' },
      'image': { fa3: 'fa-icon-picture', fa6: 'fa-solid fa-image', none: '🖼️' },
      'video': { fa3: 'fa-icon-film', fa6: 'fa-solid fa-video', none: '🎥' },
      'music': { fa3: 'fa-icon-music', fa6: 'fa-solid fa-music', none: '🎵' },
      'book': { fa3: 'fa-icon-book', fa6: 'fa-solid fa-book', none: '📚' },
      'globe': { fa3: 'fa-icon-globe', fa6: 'fa-solid fa-globe', none: '🌐' },
      'lock': { fa3: 'fa-icon-lock', fa6: 'fa-solid fa-lock', none: '🔒' },
      'unlock': { fa3: 'fa-icon-unlock', fa6: 'fa-solid fa-unlock', none: '🔓' },
      'key': { fa3: 'fa-icon-key', fa6: 'fa-solid fa-key', none: '🔑' },
      'shield': { fa3: 'fa-icon-shield', fa6: 'fa-solid fa-shield', none: '🛡️' },
      'wrench': { fa3: 'fa-icon-wrench', fa6: 'fa-solid fa-wrench', none: '🔧' },
      'fire': { fa3: 'fa-icon-fire', fa6: 'fa-solid fa-fire', none: '🔥' },
      'bolt': { fa3: 'fa-icon-bolt', fa6: 'fa-solid fa-bolt', none: '⚡' },
      'flag': { fa3: 'fa-icon-flag', fa6: 'fa-solid fa-flag', none: '🚩' },
      'trophy': { fa3: 'fa-icon-trophy', fa6: 'fa-solid fa-trophy', none: '🏆' },
      'gift': { fa3: 'fa-icon-gift', fa6: 'fa-solid fa-gift', none: '🎁' }
    };

    const icon = iconMap[iconName];
    if (!icon) {
      console.warn(`${this.name}: Unknown icon "${iconName}", using default`);
      // Default to FA7 icon class
      return 'fa-solid fa-link';
    }

    // Use FA7/FA6 classes by default (FA7 uses same format as FA6)
    // Check if FontAwesomeUtil is available and using FA7/FA6
    if (window.FontAwesomeUtil && (window.FontAwesomeUtil.version === 'fa7' || window.FontAwesomeUtil.version === 'fa6')) {
      return icon.fa6 || icon.fa3;
    }
    
    // Default to FA7/FA6 classes (fa6 property contains FA7-compatible classes)
    return icon.fa6 || icon.fa3 || icon.none;
  }

  /**
   * Add a new custom link
   * @param {Object} linkConfig - Link configuration
   */
  async addCustomLink(linkConfig) {
    this.customLinks.push(linkConfig);
    await this.saveCustomLinks();
    this.renderCustomLinks();
  }

  /**
   * Update an existing custom link
   * @param {number} index - Link index
   * @param {Object} linkConfig - Updated link configuration
   */
  async updateCustomLink(index, linkConfig) {
    if (index >= 0 && index < this.customLinks.length) {
      this.customLinks[index] = linkConfig;
      await this.saveCustomLinks();
      this.renderCustomLinks();
    }
  }

  /**
   * Remove a custom link
   * @param {number} index - Link index
   */
  async removeCustomLink(index) {
    if (index >= 0 && index < this.customLinks.length) {
      this.customLinks.splice(index, 1);
      await this.saveCustomLinks();
      this.renderCustomLinks();
    }
  }

  /**
   * Reorder custom links
   * @param {number} fromIndex - Source index
   * @param {number} toIndex - Destination index
   */
  async reorderCustomLinks(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < this.customLinks.length &&
        toIndex >= 0 && toIndex < this.customLinks.length) {
      const link = this.customLinks.splice(fromIndex, 1)[0];
      this.customLinks.splice(toIndex, 0, link);
      await this.saveCustomLinks();
      this.renderCustomLinks();
    }
  }

  /**
   * Cleanup method - removes DOM elements but preserves data
   */
  async cleanup() {
    console.log(`${this.name}: Cleaning up DOM elements (preserving data)...`);
    
    // Remove flex CSS when feature is disabled
    this.removeFlexCSS();
    
    // Disconnect MutationObserver if it exists
    if (this.headerItemsObserver) {
      this.headerItemsObserver.disconnect();
      this.headerItemsObserver = null;
      console.log(`${this.name}: Disconnected header items MutationObserver`);
    }
    
    // Remove all custom link elements from the DOM directly (more robust than relying on this.elements)
    // This ensures cleanup even if this.elements is out of sync
    const header = document.querySelector('header.c-page-header');
    if (header) {
      const existingCustomLinks = header.querySelectorAll('.c-hdr-item[class*="custom-link-"], .c-hdr-item.custom-separator');
      const removedCount = existingCustomLinks.length;
      existingCustomLinks.forEach(element => {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      console.log(`${this.name}: Removed ${removedCount} custom link elements from DOM`);
    }
    
    // Also remove elements tracked in this.elements
    this.elements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    // Clear the elements array
    this.elements = [];
    
    // IMPORTANT: Do NOT clear this.customLinks or storage data
    // The data should persist even when the enhancement is disabled
    console.log(`${this.name}: Cleanup complete. Data preserved in storage. Custom links count: ${this.customLinks.length}`);
  }

  /**
   * Wait for element to appear in the DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Element>}
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        return resolve(element);
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}

// Make it available globally for the content script coordinator
window.CustomHeaderLinksEnhancement = CustomHeaderLinksEnhancement;

// Debug: Log when script loads
console.log('Custom Header Links: Script loaded on URL:', window.location.href);

