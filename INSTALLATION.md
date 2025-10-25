# Installation Guide

This guide will help you install the Cornerstone LMS Admin Tools extension on your browser.

## Prerequisites

- Access to Cornerstone LMS (CSOD)
- One of the supported browsers:
  - Google Chrome (version 88+)
  - Microsoft Edge (Chromium-based, version 88+)
  - Opera (version 74+)
  - Brave Browser
  - Vivaldi

## Installation Methods

### Method 1: Download ZIP (Recommended)

1. **Download the Extension**
   
   **Option A: Direct Download**
   - Go to [GitHub Repository](https://github.com/hopeypants/cornerstone-lms-tools)
   - Click the green "Code" button
   - Select "Download ZIP"
   - Extract the ZIP file to a folder on your computer
   
   **Option B: Using Git (for developers)**
   ```bash
   git clone https://github.com/hopeypants/cornerstone-lms-tools.git
   cd cornerstone-lms-tools
   ```

2. **Install in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the extracted folder
   - The extension should now appear in your extensions list

3. **Install in Edge**
   - Open Edge and go to `edge://extensions/`
   - Enable "Developer mode" (toggle in the bottom left)
   - Click "Load unpacked"
   - Select the extracted folder

4. **Install in Opera**
   - Open Opera and go to `opera://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted folder

5. **Install in Brave**
   - Open Brave and go to `brave://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted folder

6. **Install in Vivaldi**
   - Open Vivaldi and go to `vivaldi://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extracted folder

## Verification

After installation:

1. **Check Extension Icon**
   - Look for the extension icon in your browser toolbar
   - If you don't see it, click the puzzle piece icon (extensions menu) and pin it

2. **Test on CSOD**
   - Navigate to any Cornerstone LMS page (`https://*.csod.com/*`)
   - Click the extension icon
   - You should see the popup with configuration options

3. **Enable Features**
   - Toggle on the features you want to use
   - Test them on the appropriate CSOD pages

## Troubleshooting

### Extension Not Loading

- **Check Developer Mode**: Make sure Developer mode is enabled
- **Check Console**: Look for errors in the browser console
- **Reload Extension**: Go to extensions page and click the refresh icon
- **Check Permissions**: Ensure the extension has necessary permissions

### Features Not Working

- **Check CSOD Access**: Make sure you're on a valid CSOD domain
- **Check Feature Toggle**: Ensure the feature is enabled in the popup
- **Check Console**: Look for JavaScript errors
- **Refresh Page**: Try refreshing the CSOD page

### Common Issues

1. **"This extension may have been corrupted"**
   - Re-download the extension files
   - Make sure all files are present
   - Try installing again

2. **Extension icon not visible**
   - Click the puzzle piece icon in toolbar
   - Find the extension and click the pin icon
   - Or drag it to the toolbar

3. **Features not applying**
   - Check that you're on a supported CSOD page
   - Verify the feature is enabled in the popup
   - Try refreshing the page

## Uninstallation

To remove the extension:

1. Go to your browser's extensions page
2. Find "Cornerstone LMS Admin Tools"
3. Click "Remove" or the trash icon
4. Confirm removal

## Updates

When you want to update the extension:

1. Download the latest version from GitHub
2. Go to the extensions page
3. Click the refresh icon on the extension
4. Or remove and reinstall the extension

## Support

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/hopeypants/cornerstone-lms-tools/issues) page
2. Create a new issue with your problem
3. Include browser version, extension version, and steps to reproduce

## Security Note

This extension:
- Only runs on CSOD domains (`*.csod.com`)
- Only stores your preferences locally
- Does not send data to external servers
- Uses minimal required permissions

For more information, see the [Security Policy](SECURITY.md).
