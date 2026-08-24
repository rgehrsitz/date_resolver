import { annotateElement, removeAnnotations } from './content/domAnnotator';
import { ExtensionSettings, DEFAULT_SETTINGS } from './types/settings';

declare global {
  interface Window {
    _gmailjs?: any;
    gmail?: any;
    __dateResolverSettings?: ExtensionSettings;
  }
}

let activeSettings: ExtensionSettings = DEFAULT_SETTINGS;

function refreshAllOpenEmails() {
  const containers = document.querySelectorAll<HTMLElement>('[data-sent-date], [data-date-resolver-processed], .a3s.aiL, .ii.gt');
  
  containers.forEach((container) => {
    // 1. Cleanly remove existing annotations
    removeAnnotations(container);

    // 2. If extension is enabled, re-annotate using stored sentDate
    if (activeSettings.enabled) {
      const dateStr = container.getAttribute('data-sent-date');
      if (dateStr) {
        const sentDate = new Date(dateStr);
        if (!isNaN(sentDate.getTime())) {
          annotateElement(container, sentDate, activeSettings);
        }
      }
    }
  });
}

// Listen for settings update messages from content script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data?.type === 'DATE_RESOLVER_UPDATE_SETTINGS') {
    activeSettings = { ...DEFAULT_SETTINGS, ...event.data.settings };
    console.log('[Date Resolver] Settings updated, refreshing active emails:', activeSettings);
    refreshAllOpenEmails();
  }
});

function handleEmailView(email: any, gmail: any) {
  try {
    const emailId = email.id;
    const emailData = gmail.new.get.email_data(emailId);

    if (!emailData || !emailData.date) {
      console.warn('[Date Resolver] Could not determine email date for ID:', emailId);
      return;
    }

    const sentDate = new Date(emailData.date);
    if (isNaN(sentDate.getTime())) {
      console.warn('[Date Resolver] Invalid sent date parsed:', emailData.date);
      return;
    }

    console.log(`[Date Resolver] Processing email (${emailId}) sent on ${sentDate.toLocaleString()}`);

    // Locate the email body container in Gmail DOM
    let bodyElements: HTMLElement[] = [];

    if (typeof email.dom === 'function') {
      const domBody = email.dom('body');
      if (domBody && domBody.length > 0) {
        domBody.each((_: number, el: HTMLElement) => {
          bodyElements.push(el);
        });
      }
    }

    // Fallback: Query standard Gmail message body containers if dom() returned empty
    if (bodyElements.length === 0) {
      const containers = document.querySelectorAll<HTMLElement>('.a3s.aiL, .ii.gt');
      containers.forEach((el) => {
        if (!el.hasAttribute('data-date-resolver-processed')) {
          bodyElements.push(el);
        }
      });
    }

    // Annotate all found body elements
    for (const bodyEl of bodyElements) {
      if (!bodyEl.hasAttribute('data-date-resolver-processed')) {
        const count = annotateElement(bodyEl, sentDate, activeSettings);
        if (count > 0) {
          console.log(`[Date Resolver] Annotated ${count} date(s) in email ${emailId}`);
        }
      }
    }
  } catch (err) {
    console.error('[Date Resolver] Error annotating email:', err);
  }
}

function startExtension(gmail: any) {
  console.log('[Date Resolver] Extension initialized with Gmail.js');
  window.gmail = gmail;

  gmail.observe.on('view_email', (email: any) => {
    handleEmailView(email, gmail);
  });
}

// Ensure safe startup and prevent runaway intervals
let checkAttempts = 0;
const maxAttempts = 100; // 10 seconds max

const loaderId = setInterval(() => {
  checkAttempts++;
  if (window._gmailjs) {
    clearInterval(loaderId);
    startExtension(window._gmailjs);
    return;
  }

  if (checkAttempts >= maxAttempts) {
    clearInterval(loaderId);
    console.warn('[Date Resolver] Gmail.js did not load within 10 seconds.');
  }
}, 100);
