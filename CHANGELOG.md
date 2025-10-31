# Changelog

All notable changes to Cornerstone LMS Admin Tools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-31

### Added

#### Global Tools
- **Header Logout Link**: Adds a logout link with icon to the page header
- **Custom Header Links**: Add, configure, and reorder custom links in the page header with icons
  - Customizable icon sizes (16px - 48px, default 20px)
  - Support for Font Awesome 3.2.1 icons (CSOD compatible)
  - Custom icon input option
  - Drag and drop reordering
  - Separator support
  - Open in new tab option
  - Insertion point prioritizes custom links before default header items
- **Header Padding**: Adjustable header padding slider (default 16px)
- **Resize Galaxy AI Icon**: Customize the size of the Galaxy AI icon (16px - 48px, default 32px)
  - Only appears when Galaxy AI icon is detected on the page
  - Removes margin when resized
  - Reset button restores default size and margins
- **Resize Pinned Links Icon**: Customize the size of the Pinned Links icon (16px - 48px, default 22px)
  - Only appears when Pinned Links icon is detected on the page
  - Removes margin when resized
  - Reset button restores default size and margins (margin-top: 10px)
- **Header Icons Section**: Groups Galaxy AI and Pinned Links resize features
  - Section hidden when both icons are not available on the page

#### Catalog Tools
- **Learning Object Links**: Show/hide individual links on Learning Object pages
  - Preview Link
  - Details Link
  - Launch Link
  - Register Link
- **Copy LOID**: Quick copy button for Learning Object IDs
  - Requires backend setting to be enabled
  - Shows warning message if LOID not detected
  - Only available on Learning/CourseConsole pages

#### Instructor-Led Training (ILT) Tools
- **Toggle Tentative Column**: Show/hide the tentative column in ILT event lists
- **Highlight Zero Sessions**: Highlights events with zero sessions in ILT event lists
- **Center Number Columns**: Centers numeric columns in ILT event lists

#### Sessions Tools
- **Format Session Dates**: Displays session dates and times on one line separated by pipe (|) on Session List pages
  - Fixed-width spans for proper alignment
- **Highlight Zero Enrollments**: Highlights cells with zero enrollments on Session List pages
- **Highlight Full Sessions**: Highlights cells where enrollment numbers are equal
- **Center Enrollment Column**: Centers the enrollment column on Session List pages
- **Sessions Checkbox Defaults**: Control which status checkboxes are checked by default on Sessions pages
  - Tentative, Approved, Completed, Cancelled checkbox controls
  - Default: Tentative and Approved checked

#### Users Tools
- **User Status Dropdown Defaults**: Control which option is selected by default in the User Status dropdown
- **OU Type Dropdown Defaults**: Control which option is selected by default in the OU Type dropdown
  - Dynamically loads available options from the Users page
  - Requires being on the Users page (admin/Users) to set defaults
  - Shows warning message with link when not on Users page
- **Country Dropdown Defaults**: Control which option is selected by default in the Country dropdown

#### Transcript Tools
- **Highlight Transcript Statuses**: Color-code transcript statuses for quick visual identification
  - Statuses: Past Due, In Progress, Pending, Registered, Inactive, Withdrawn, Cancelled
  - Customizable colors and opacity for each status
  - Only runs on pages with "UniversalProfile/Transcript" in the URL
  - Highlights list items and status lines with different opacities

#### Learning Assignment Tool
- **Highlight Assignment Statuses**: Color-code assignment statuses for quick visual identification
  - Statuses: Processed (default: blue), Queued (default: orange), Cancelled (default: black), Active (default: green), Inactive (default: gray), Drafts (partial match, default: gray)
  - Customizable colors and opacity for each status
  - Only runs on pages with "EnrollTraining/EnrollTrainingManagement" in the URL
  - Highlights list items based on status text

#### Misc Tools
- **Proxy As Another User**: Set default comment text for proxy sessions
  - Auto-click Log In button option (only enabled when default text is set and Proxy feature is on)
  - Only runs on pages with "Admin/ProxyAsUser" in the URL
- **Custom Page Preview Link**: Adds "Open" buttons to URLs in the Custom Pages table
  - Works with AJAX pagination
  - Buttons placed in Options column with proper spacing
- **Settings Management**:
  - **Export Settings**: Download all settings as a JSON file with timestamp (YYYY-MM-DD-HH-MM-SS format)
  - **Import Settings**: Restore settings from a previously exported file
  - **Turn Off All Features**: Disable all features while preserving settings (colors, sizes, text, etc.)
  - **Reset All Features**: Reset all settings to defaults
    - Resets dropdowns to first option
    - Resets checkboxes to default states (Tentative and Approved checked)
    - Resets icon sizes and padding to defaults
    - Clears proxy default text
  - Custom confirmation dialogs replace native alert/confirm

### UI/UX Improvements
- **Tabbed Interface**: Organized features into logical tabs (Global, Catalog, ILT, Users, Transcript, Misc)
- **Tab Persistence**: Remembers which tab was selected when popup is reopened
- **Conditional Feature Visibility**: Features only appear when relevant elements are detected on the page
- **Dynamic Option Loading**: OU Type dropdown loads options from the active page
- **Buy Me a Coffee Link**: Added support link in footer with icon
- **Footer Layout**: Centered version number with links on either side
- **Custom Dialogs**: Replaced all native alert/confirm dialogs with custom styled modals
- **Enhanced Error Handling**: Better validation and error messages throughout
- **Auto-enable Features**: Features automatically enable when relevant data is added

### Technical Features
- **Manifest V3 Support**: Modern Chrome extension architecture
- **Service Worker Background Script**: Handles extension lifecycle
- **Content Script Coordination System**: Centralized enhancement management
- **Chrome Storage API Integration**: Persistent settings storage
- **Message Passing**: Efficient communication between popup and content scripts
- **Script Injection Fallbacks**: Robust fallback mechanisms for dynamic content
- **MutationObserver**: Handles dynamically loaded content (AJAX pagination)
- **Font Awesome 3.2.1 Compatibility**: Uses CSOD's existing Font Awesome library
- **Responsive Popup UI**: Tabbed interface with organized sections
- **Comprehensive Error Handling**: Graceful error recovery
- **Page Detection**: Features only run on relevant pages for performance
- **URL Scope Restrictions**: Features limited to specific page patterns

### Browser Support
- ✅ Google Chrome (Manifest V3)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Opera (Chromium-based)
- ✅ Brave Browser
- ✅ Vivaldi

### Documentation
- Comprehensive README with installation instructions
- Detailed CHANGELOG
- INSTALLATION.md guide
- QUICKSTART.md guide
- SECURITY.md policy
- MIT License

---

### Planned Features
- Additional CSOD page enhancements
- Enhanced customization options
- User feedback integration

### Known Issues
- None currently reported

### Browser Compatibility Notes
- Firefox support planned for future release
- Safari support not planned (WebKit limitations)
- All Chromium-based browsers fully supported
