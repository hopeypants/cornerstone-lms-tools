# Changelog

All notable changes to Cornerstone LMS Admin Tools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-24

### Added
- **Header Logout Link**: Adds a logout link with icon to the page header
- **Custom Header Links**: Add, configure, and reorder custom links in the page header with icons
  - Support for Font Awesome 3.2.1 icons
  - Custom icon input option
  - Drag and drop reordering
  - Separator support
  - Open in new tab option
  - Header padding adjustment slider
- **Format Session Dates**: Displays session dates and times on one line separated by pipe (|) on Session List pages
  - Fixed-width spans for proper alignment
  - Page detection to only run on relevant pages
- **Highlight Zero Enrollments**: Highlights cells with zero enrollments on Session List pages
- **Center Enrollment Column**: Centers the enrollment column on Session List pages
- **Sessions Checkbox Defaults**: Control which status checkboxes are checked by default on Sessions pages
  - Tentative, Approved, Completed, Cancelled checkbox controls
- **Toggle Tentative Column**: Show/hide the tentative column in ILT event lists
- **Highlight Zero Sessions**: Highlights events with zero sessions in ILT event lists
- **Center Number Columns**: Centers numeric columns in ILT event lists
- **User Status Dropdown Defaults**: Control which option is selected by default in the User Status dropdown
- **OU Type Dropdown Defaults**: Control which option is selected by default in the OU Type dropdown
- **Country Dropdown Defaults**: Control which option is selected by default in the Country dropdown
- **Tab Persistence**: Remembers which tab was selected when popup is reopened
- **Cross-browser Compatibility**: Works on Chrome, Edge, Opera, Brave, and Vivaldi

### Technical Features
- Manifest V3 support
- Service worker background script
- Content script coordination system
- Chrome storage API integration
- Font Awesome 3.2.1 compatibility
- Responsive popup UI with tabbed interface
- Custom confirmation modals
- Comprehensive error handling
- Page detection for targeted enhancements

### Browser Support
- ✅ Google Chrome (Manifest V3)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Opera (Chromium-based)
- ✅ Brave Browser
- ✅ Vivaldi

### Documentation
- Comprehensive README with installation instructions
- Contributing guidelines
- MIT License
- Package.json metadata
- Git ignore configuration

---

## Future Releases

### Planned Features
- Firefox compatibility (Manifest V2 conversion)
- Additional CSOD page enhancements
- Bulk operations for admin tasks
- Export/import settings functionality
- Enhanced customization options

### Known Issues
- None currently reported

### Browser Compatibility Notes
- Firefox support planned for future release
- Safari support not planned (WebKit limitations)
- All Chromium-based browsers fully supported
