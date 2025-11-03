# Cornerstone LMS Admin Tools

A Chrome extension that enhances the Cornerstone LMS (CSOD) admin experience with powerful tools and utilities for administrators.

## 🚀 Features

### Global Tools
- **Header Logout Link**: Adds a logout link with icon to the page header
- **Custom Header Links**: Add, configure, and reorder custom links in the page header with icons
  - Customizable icon sizes (16px - 48px)
  - Support for Font Awesome 3.2.1 icons
  - Custom icon input option
  - Drag and drop reordering
  - Separator support
  - Open in new tab option
- **Header Padding**: Adjustable header padding slider
- **Resize Galaxy AI Icon**: Customize the size of the Galaxy AI icon (16px - 48px)
- **Resize Pinned Links Icon**: Customize the size of the Pinned Links icon (16px - 48px)
  - Features only appear when icons are detected on the page

### Catalog Tools
- **Learning Object Links**: Show/hide Preview, Details, Launch, and Register links on Learning Object pages
- **Copy LOID**: Quick copy button for Learning Object IDs (requires backend setting)

### Instructor-Led Training (ILT) Tools
- **Toggle Tentative Column**: Show/hide the tentative column in ILT event lists
- **Highlight Zero Sessions**: Highlights events with zero sessions in ILT event lists
- **Center Number Columns**: Centers numeric columns in ILT event lists
- **Highlight Full Sessions**: Highlights cells where enrollment numbers are equal

### Sessions Tools
- **Format Session Dates**: Displays session dates and times on one line separated by pipe (|) on Session List pages
- **Highlight Zero Enrollments**: Highlights cells with zero enrollments on Session List pages
- **Center Enrollment Column**: Centers the enrollment column on Session List pages
- **Sessions Checkbox Defaults**: Control which status checkboxes are checked by default on Sessions pages
  - Tentative, Approved, Completed, Cancelled checkbox controls

### Users Tools
- **User Status Dropdown Defaults**: Control which option is selected by default in the User Status dropdown
- **OU Type Dropdown Defaults**: Control which option is selected by default in the OU Type dropdown
  - Dynamically loads available options from the Users page
  - Requires being on the Users page to set defaults
- **Country Dropdown Defaults**: Control which option is selected by default in the Country dropdown

### Transcript Tools
- **Highlight Transcript Statuses**: Color-code transcript statuses for quick visual identification
  - Statuses: Past Due, In Progress, Pending, Registered, Inactive, Withdrawn, Cancelled
  - Customizable colors and opacity for each status
  - Reset to defaults button
  - Only runs on pages with "UniversalProfile/Transcript" in the URL

### Learning Assignment Tool
- **Highlight Assignment Statuses**: Color-code assignment statuses for quick visual identification
  - Statuses: Active (default: blue), Queued (default: orange), Processed (default: green), Cancelled, Inactive, Drafts
  - Customizable colors and opacity for each status
  - Reset to defaults button
  - Only runs on pages with "EnrollTraining/EnrollTrainingManagement" in the URL

### Misc Tools
- **Highlight Environments**: Color-code the header based on the current environment
  - Production, Staging, and Pilot environment detection
  - Customizable header background colors for each environment
  - Optional watermark text overlay ("Production", "Staging", or "Pilot")
  - Watermark with customizable color and opacity
  - Header color and watermark can be toggled independently
  - Reset to defaults for each environment
  - Automatically detects environment from URL pattern:
    - Staging: `*-stg.csod.com`
    - Pilot: `*-pilot.csod.com`
    - Production: Any other `*.csod.com` domain
- **Proxy As Another User**: Set default comment text for proxy sessions
  - Auto-click Log In button option (requires default text to be set)
  - Only runs on pages with "Admin/ProxyAsUser" in the URL
- **Custom Pages Tools**:
  - **Custom Page Preview Link**: Adds "Open" buttons next to Custom Page IDs to open URLs in a new tab
    - Buttons appear on hover over table rows
    - Works with AJAX pagination
  - **Custom Page Copy Link**: Adds "Copy" buttons next to Custom Page IDs to copy URLs to clipboard
    - Buttons appear on hover over table rows
    - Shows Bootstrap-style success alert when copied
    - Works with AJAX pagination
  - **Resize Custom Pages Container**: Adjust the width of the Custom Pages form container
    - Adjustable width from 55vw to 95vw in 5vw increments
    - Applies consistent body margins
    - Only applies to `admin/ManageCustomPages` URL
- **Settings Management**:
  - Export Settings: Download all settings as a JSON file with timestamp
  - Import Settings: Restore settings from a previously exported file
  - Turn Off All Features: Disable all features while preserving settings
  - Reset All Features: Reset all settings to defaults

## 🎯 Browser Compatibility

This extension works on all Chromium-based browsers:
- ✅ **Google Chrome** (Manifest V3)
- ✅ **Microsoft Edge** (Chromium-based)
- ✅ **Opera** (Chromium-based)
- ✅ **Brave Browser**
- ✅ **Vivaldi**

## 📦 Installation

### From Source (Developer Mode)

1. **Download the extension**:
   
   **Option A: Download ZIP (Recommended)**
   - Go to [GitHub Repository](https://github.com/hopeypants/cornerstone-lms-tools)
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract the ZIP file to a folder on your computer
   
   **Option B: Using Git**
   ```bash
   git clone https://github.com/hopeypants/cornerstone-lms-tools.git
   cd cornerstone-lms-tools
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `cornerstone-lms-tools` folder

3. **Load in Edge/Opera/Brave/Vivaldi**:
   - Go to browser's extension management page
   - Enable "Developer mode" or "Load unpacked extensions"
   - Select the `cornerstone-lms-tools` folder

## 🛠️ Development

### Prerequisites
- Chrome, Edge, Opera, Brave, or Vivaldi browser
- Basic knowledge of JavaScript and Chrome extensions

### Project Structure
```
cornerstone-lms-tools/
├── manifest.json                 # Extension manifest
├── background/
│   └── service-worker.js        # Background service worker
├── content/
│   ├── content.js               # Content script coordinator
│   └── enhancements/            # Individual enhancement modules
│       ├── header-logout-link.js
│       ├── custom-header-links.js
│       ├── resize-ai-icon.js
│       ├── resize-pinned-links-icon.js
│       ├── proxy-as-user.js
│       ├── custom-page-preview-link.js
│       ├── custom-page-copy-link.js
│       ├── resize-custom-pages-container.js
│       ├── highlight-environments.js
│       ├── sessions-checkbox-defaults.js
│       ├── format-session-dates.js
│       ├── highlight-transcript-statuses.js
│       ├── highlight-assignment-statuses.js
│       ├── lo-links.js
│       ├── user-status-dropdown-defaults.js
│       ├── user-ou-type-dropdown-defaults.js
│       ├── user-country-dropdown-defaults.js
│       ├── highlight-zero-enrollments.js
│       ├── highlight-full-sessions.js
│       ├── center-enrollment-column.js
│       ├── toggle-tentative-column.js
│       ├── highlight-zero-sessions.js
│       └── center-number-columns.js
├── popup/
│   ├── popup.html              # Extension popup UI
│   ├── popup.css               # Popup styles
│   └── popup.js                # Popup logic
├── icons/
│   ├── icon16.png              # Extension icons
│   ├── icon48.png
│   └── icon128.png
└── README.md                   # This file
```

## 🔧 Configuration

The extension provides a tabbed popup interface where you can:
- **Global Tab**: Configure header links, icon sizes, and global settings
- **Catalog Tab**: Manage Learning Object link features
- **ILT Tab**: Configure Instructor-Led Training enhancements
- **Users Tab**: Set dropdown defaults for user management
- **Transcript Tab**: Configure transcript status highlighting
- **Misc Tab**: Environment highlighting, proxy settings, custom pages tools, and assignment status highlighting
- Export/Import settings for backup and sharing
- Turn off or reset all features

## 📝 Usage

1. **Install the extension** using the methods above
2. **Navigate to any CSOD page** (`https://*.csod.com/*`)
3. **Click the extension icon** in your browser toolbar
4. **Configure your preferences** using the popup interface
5. **Features will automatically apply** based on your settings and page context

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Please use GitHub Issues to report bugs or request features:
- [Report a Bug](https://github.com/hopeypants/cornerstone-lms-tools/issues)
- [Request a Feature](https://github.com/hopeypants/cornerstone-lms-tools/issues)

## 📞 Support

If you need help or have questions:
- Check the [Issues](https://github.com/hopeypants/cornerstone-lms-tools/issues) page
- Create a new issue with your question

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and updates.

## 🙏 Acknowledgments

- Built for Cornerstone LMS administrators
- Uses Font Awesome 3.2.1 icons (compatible with CSOD's version)
- Designed for CSOD's specific UI patterns and workflows
- [Buy Me a Coffee](https://buymeacoffee.com/hopeypants) - Support the project

---

**Note**: This extension is designed specifically for Cornerstone LMS (CSOD) and may not work with other learning management systems.
