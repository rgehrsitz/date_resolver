// Initialize GmailJS as early as possible
import GmailFactory from 'gmail-js';
import jQuery from 'jquery';

declare global {
  interface Window {
    _gmailjs?: any;
  }
}

// Preserve existing instance if multiple gmail.js extensions are present
window._gmailjs = window._gmailjs || new (GmailFactory as any).Gmail(jQuery);
