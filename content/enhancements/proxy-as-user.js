(function() {
  class ProxyAsUserEnhancement {
    constructor() {
      this.initialized = false;
      this.textareaSelector = '#ctl00_ContentPlaceHolder1_tbReason';
      this.loginButtonSelector = '#ctl00_ContentPlaceHolder1_ibLogin';
    }

    async initialize() {
      if (this.initialized) return;
      this.initialized = true;

      // Delay slightly to ensure DOM is ready
      await new Promise(r => setTimeout(r, 50));

      // Run only on Admin/ProxyAsUser pages
      const href = window.location && window.location.href ? window.location.href : '';
      if (!href.includes('Admin/ProxyAsUser')) {
        return;
      }

      const textarea = document.querySelector(this.textareaSelector);
      if (!textarea) return; // Not on proxy page

      const { proxyDefaultText, proxyDefaultTextValue, proxyAutoClickLogin } = await chrome.storage.sync.get([
        'proxyDefaultText', 'proxyDefaultTextValue', 'proxyAutoClickLogin'
      ]);

      if (proxyDefaultText && typeof proxyDefaultTextValue === 'string' && proxyDefaultTextValue.trim().length > 0) {
        textarea.value = proxyDefaultTextValue;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }

      if (proxyDefaultText && proxyAutoClickLogin) {
        const loginBtn = document.querySelector(this.loginButtonSelector);
        if (loginBtn) {
          // Give the page a moment after setting the value
          setTimeout(() => {
            loginBtn.click();
          }, 100);
        }
      }
    }

    async cleanup() {
      // No persistent DOM changes to clean up
    }
  }

  window.ProxyAsUserEnhancement = ProxyAsUserEnhancement;
})();


