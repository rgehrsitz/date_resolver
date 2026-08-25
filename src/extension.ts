import { annotateElement, removeAnnotations } from './content/domAnnotator';
import { CONSENT_STORAGE_KEY, hasGrantedConsent } from './core/consent';
import { getSentDateFromBody } from './content/gmailDom';
import { ExtensionSettings, DEFAULT_SETTINGS } from './types/settings';

let activeSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };
let scanTimer: number | undefined;
let consentGranted = false;
let observerStarted = false;

function refreshAllOpenEmails(): void {
  document.querySelectorAll<HTMLElement>('[data-sent-date]').forEach((body) => {
    removeAnnotations(body);

    const sentDate = new Date(body.dataset.sentDate ?? '');
    if (consentGranted && activeSettings.enabled && !Number.isNaN(sentDate.getTime())) {
      annotateElement(body, sentDate, activeSettings);
    }
  });
}

function removeAllAnnotationsAndMetadata(): void {
  document.querySelectorAll<HTMLElement>('[data-sent-date]').forEach((body) => {
    removeAnnotations(body);
    delete body.dataset.sentDate;
    delete body.dataset.dateResolverScanned;
  });
}

function scanOpenEmails(): void {
  if (!consentGranted || !activeSettings.enabled) {
    return;
  }

  document.querySelectorAll<HTMLElement>('div.a3s').forEach((body) => {
    if (body.dataset.dateResolverScanned === 'true') {
      return;
    }

    const sentDate = getSentDateFromBody(body);
    if (!sentDate) {
      return;
    }

    body.dataset.dateResolverScanned = 'true';
    annotateElement(body, sentDate, activeSettings);
  });
}

function scheduleScan(): void {
  if (!consentGranted || !activeSettings.enabled) {
    return;
  }

  if (scanTimer !== undefined) {
    window.clearTimeout(scanTimer);
  }

  scanTimer = window.setTimeout(() => {
    scanTimer = undefined;
    scanOpenEmails();
  }, 100);
}

const observer = new MutationObserver(scheduleScan);

function startObserver(): void {
  if (!consentGranted || observerStarted) {
    return;
  }

  observer.observe(document.documentElement, { childList: true, subtree: true });
  observerStarted = true;
  scheduleScan();
}

function stopObserver(): void {
  observer.disconnect();
  observerStarted = false;

  if (scanTimer !== undefined) {
    window.clearTimeout(scanTimer);
    scanTimer = undefined;
  }
}

function updateSettings(value: unknown): void {
  const savedSettings = value as Partial<ExtensionSettings> | undefined;
  activeSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
}

function loadSettings(): void {
  chrome.storage.sync.get(['dateResolverSettings', CONSENT_STORAGE_KEY], (result) => {
    updateSettings(result.dateResolverSettings);
    consentGranted = hasGrantedConsent(result[CONSENT_STORAGE_KEY]);

    if (consentGranted) {
      startObserver();
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }

    if (changes[CONSENT_STORAGE_KEY]) {
      consentGranted = hasGrantedConsent(changes[CONSENT_STORAGE_KEY].newValue);
      if (!consentGranted) {
        stopObserver();
        removeAllAnnotationsAndMetadata();
        return;
      }
    }

    if (changes.dateResolverSettings) {
      updateSettings(changes.dateResolverSettings.newValue);
      refreshAllOpenEmails();
    }

    startObserver();
    scheduleScan();
  });
}

loadSettings();
