# Cornerstone LMS Admin Tools

A Chrome extension that enhances the Cornerstone LMS (CSOD) admin experience with powerful tools and utilities for administrators.

## 🚀 Features

### Global Tools
- **Header Logout Link**: Adds a logout link with icon to the page header
- **Custom Header Links**: Add, configure, and reorder custom links in the page header with icons
- **Format Session Dates**: Displays session dates and times on one line separated by pipe (|) on Session List pages
- **Highlight Zero Enrollments**: Highlights cells with zero enrollments on Session List pages
- **Center Enrollment Column**: Centers the enrollment column on Session List pages
- **Sessions Checkbox Defaults**: Control which status checkboxes are checked by default on Sessions pages

### Instructor-Led Training (ILT) Tools
- **Toggle Tentative Column**: Show/hide the tentative column in ILT event lists
- **Highlight Zero Sessions**: Highlights events with zero sessions in ILT event lists
- **Center Number Columns**: Centers numeric columns in ILT event lists

### User Management Tools
- **User Status Dropdown Defaults**: Control which option is selected by default in the User Status dropdown
- **OU Type Dropdown Defaults**: Control which option is selected by default in the OU Type dropdown
- **Country Dropdown Defaults**: Control which option is selected by default in the Country dropdown

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
│       ├── sessions-checkbox-defaults.js
│       ├── format-session-dates.js
│       ├── user-status-dropdown-defaults.js
│       ├── user-ou-type-dropdown-defaults.js
│       ├── user-country-dropdown-defaults.js
│       ├── highlight-zero-enrollments.js
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

### Making Changes

1. **Edit the code** in your preferred editor
2. **Reload the extension**:
   - Go to `chrome://extensions/`
   - Click the refresh icon on your extension
3. **Test your changes** on CSOD pages
4. **Debug** using Chrome DevTools:
   - Right-click extension icon → "Inspect popup"
   - Use browser console for content script debugging

### Adding New Features

1. **Create enhancement file** in `content/enhancements/`
2. **Add to manifest.json** content scripts
3. **Register in content.js** ENHANCEMENTS object
4. **Add toggle** in `popup/popup.html`
5. **Add logic** in `popup/popup.js`

## 🔧 Configuration

The extension provides a popup interface where you can:
- Toggle features on/off
- Configure custom header links
- Set default checkbox states
- Configure dropdown defaults
- Manage all settings with tab persistence

## 📝 Usage

1. **Install the extension** using the methods above
2. **Navigate to any CSOD page** (`https://*.csod.com/*`)
3. **Click the extension icon** in your browser toolbar
4. **Configure your preferences** using the popup interface
5. **Features will automatically apply** based on your settings


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

### Version 1.0.0
- Initial release
- All core features implemented
- Tab persistence
- Cross-browser compatibility
- Comprehensive admin tools for CSOD

## 🙏 Acknowledgments

- Built for Cornerstone LMS administrators
- Uses Font Awesome 3.2.1 icons (compatible with CSOD's version)
- Designed for CSOD's specific UI patterns and workflows

---

**Note**: This extension is designed specifically for Cornerstone LMS (CSOD) and may not work with other learning management systems.
