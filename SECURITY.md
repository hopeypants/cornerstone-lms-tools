# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report

Please report security vulnerabilities by emailing [your-email@example.com](mailto:your-email@example.com) with the following information:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will provide regular updates on our progress
- We will credit you in our security advisories (unless you prefer to remain anonymous)

### Scope

This security policy applies to:
- The Chrome extension code
- The GitHub repository
- Any related documentation

### Out of Scope

The following are considered out of scope:
- Issues in Cornerstone LMS (CSOD) itself
- Issues in third-party websites
- Social engineering attacks
- Physical attacks

## Security Considerations

### Chrome Extension Security

This extension:
- Uses Manifest V3 for enhanced security
- Implements Content Security Policy (CSP)
- Follows Chrome extension security best practices
- Only requests necessary permissions
- Validates all user inputs

### Data Handling

- **No sensitive data collection**: The extension only stores user preferences
- **Local storage only**: Settings are stored locally in Chrome storage
- **No external communication**: No data is sent to external servers
- **CSOD domain only**: Extension only runs on `*.csod.com` domains

### Permissions

The extension requests minimal permissions:
- `storage`: For saving user preferences
- `activeTab`: For interacting with CSOD pages
- `https://*.csod.com/*`: Host permissions for CSOD domains only

## Best Practices for Users

- **Keep your browser updated**: Use the latest version of your browser
- **Review permissions**: Only install extensions from trusted sources
- **Regular updates**: Keep the extension updated to the latest version
- **Report issues**: Report any suspicious behavior immediately

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. We will:

- Release a patch version with the fix
- Update the changelog with security information
- Notify users through GitHub releases
- Consider publishing to Chrome Web Store if appropriate

## Contact

For security-related questions or concerns, please contact:
- Email: [your-email@example.com](mailto:your-email@example.com)
- GitHub Issues: [Create a private issue](https://github.com/yourusername/cornerstone-lms-tools/issues/new)

Thank you for helping keep Cornerstone LMS Admin Tools secure! 🔒
