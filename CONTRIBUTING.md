# Contributing to Cornerstone LMS Admin Tools

Thank you for your interest in contributing to Cornerstone LMS Admin Tools! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

Before creating a bug report, please check if the issue has already been reported in the [Issues](https://github.com/yourusername/cornerstone-lms-tools/issues) section.

When creating a bug report, please include:
- **Browser and version** (Chrome, Edge, Opera, etc.)
- **Extension version**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Console errors** (if any)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:
- **Clear description** of the enhancement
- **Use case** and why it would be valuable
- **Proposed implementation** (if you have ideas)
- **Any additional context**

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly** on CSOD pages
5. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 🛠️ Development Setup

### Prerequisites
- Chrome, Edge, Opera, Brave, or Vivaldi browser
- Basic knowledge of JavaScript and Chrome extensions
- Access to Cornerstone LMS (CSOD) for testing

### Getting Started

1. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/cornerstone-lms-tools.git
   cd cornerstone-lms-tools
   ```

2. **Load the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project folder

3. **Test on CSOD**:
   - Navigate to any CSOD page
   - Test the extension functionality
   - Use browser DevTools for debugging

### Code Style Guidelines

- **JavaScript**: Use modern ES6+ features
- **Comments**: Document complex logic and functions
- **Naming**: Use descriptive variable and function names
- **Indentation**: Use 2 spaces for indentation
- **Semicolons**: Always use semicolons

### Project Structure

```
cornerstone-lms-tools/
├── manifest.json                 # Extension manifest
├── background/
│   └── service-worker.js        # Background service worker
├── content/
│   ├── content.js               # Content script coordinator
│   └── enhancements/            # Individual enhancement modules
├── popup/
│   ├── popup.html              # Extension popup UI
│   ├── popup.css               # Popup styles
│   └── popup.js                # Popup logic
├── icons/                      # Extension icons
└── README.md                   # Project documentation
```

## 🧪 Testing

### Testing Checklist

Before submitting a PR, please ensure:

- [ ] **Extension loads** without errors
- [ ] **All features work** as expected
- [ ] **No console errors** in popup or content scripts
- [ ] **Settings persist** across browser sessions
- [ ] **Features toggle** on/off correctly
- [ ] **Cross-browser compatibility** (if applicable)
- [ ] **Code follows** project style guidelines

### Testing Different Browsers

Test on multiple Chromium-based browsers:
- Google Chrome
- Microsoft Edge
- Opera
- Brave Browser
- Vivaldi

## 📝 Pull Request Process

### Before Submitting

1. **Update documentation** if you add new features
2. **Add comments** for complex code
3. **Test thoroughly** on CSOD pages
4. **Ensure no breaking changes** (unless intentional)

### PR Template

When creating a PR, please include:

- **Description** of changes
- **Testing performed**
- **Screenshots** (if UI changes)
- **Breaking changes** (if any)
- **Related issues** (if any)

### Review Process

- Maintainers will review your PR
- Feedback may be requested
- Changes may be requested before merging
- All PRs require approval before merging

## 🐛 Debugging Tips

### Common Issues

1. **Extension not loading**:
   - Check `chrome://extensions/` for errors
   - Verify manifest.json syntax
   - Check console for JavaScript errors

2. **Content scripts not running**:
   - Verify URL patterns in manifest
   - Check content script console
   - Ensure CSOD page is loaded

3. **Settings not persisting**:
   - Check Chrome storage permissions
   - Verify storage API usage
   - Check for storage quota issues

### Debugging Tools

- **Chrome DevTools**: Right-click extension icon → "Inspect popup"
- **Console**: Check for JavaScript errors
- **Network tab**: Monitor API calls
- **Storage tab**: Check Chrome storage

## 📋 Feature Guidelines

### Adding New Features

1. **Create enhancement file** in `content/enhancements/`
2. **Add to manifest.json** content scripts
3. **Register in content.js** ENHANCEMENTS object
4. **Add toggle** in `popup/popup.html`
5. **Add logic** in `popup/popup.js`
6. **Test thoroughly**
7. **Update documentation**

### Enhancement Template

```javascript
/**
 * Your Enhancement Name
 * Brief description of what it does
 */

class YourEnhancementName {
  constructor() {
    this.name = 'Your Enhancement Name';
    this.elements = [];
    this.styleElement = null;
  }

  async initialize() {
    console.log(`${this.name}: Initializing...`);
    // Your initialization code
  }

  async cleanup() {
    console.log(`${this.name}: Cleaning up...`);
    // Your cleanup code
  }
}

// Make it available globally
window.YourEnhancementName = YourEnhancementName;
```

## 🎯 Areas for Contribution

### High Priority
- **Bug fixes** and stability improvements
- **Performance optimizations**
- **Cross-browser compatibility**
- **Documentation improvements**

### Medium Priority
- **New enhancement features**
- **UI/UX improvements**
- **Code refactoring**
- **Test coverage**

### Low Priority
- **Code style improvements**
- **Minor optimizations**
- **Additional documentation**

## 📞 Getting Help

If you need help or have questions:

- **Check existing issues** in the GitHub Issues section
- **Create a new issue** with your question
- **Contact maintainers** through GitHub
- **Join discussions** in the Issues section

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to Cornerstone LMS Admin Tools! 🚀
