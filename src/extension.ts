import { annotateElement, removeAnnotations } from './content/domAnnotator';
import { getSentDateFromBody } from './content/gmailDom';
import { ExtensionSettings, DEFAULT_SETTINGS } from './types/settings';

let activeSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };
let scanTimer: number | undefined;

function refreshAllOpenEmails(): void {
  document.querySelectorAll<HTMLElement>('[data-sent-date]').forEach((body) => {
    removeAnnotations(body);

    const sentDate = new Date(body.dataset.sentDate ?? '');
    if (!Number.isNaN(sentDate.getTime())) {
      annotateElement(body, sentDate, activeSettings);
    }
  });
}

function scanOpenEmails(): void {
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
  if (scanTimer !== undefined) {
    window.clearTimeout(scanTimer);
  }

  scanTimer = window.setTimeout(() => {
    scanTimer = undefined;
    scanOpenEmails();
  }, 100);
}

function loadSettings(): void {
  chrome.storage.sync.get('dateResolverSettings', (result) => {
    const savedSettings = result.dateResolverSettings as Partial<ExtensionSettings> | undefined;
    activeSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
    refreshAllOpenEmails();
    scheduleScan();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'sync' || !changes.dateResolverSettings) {
      return;
    }

    const updatedSettings = changes.dateResolverSettings.newValue as Partial<ExtensionSettings> | undefined;
    activeSettings = { ...DEFAULT_SETTINGS, ...updatedSettings };
    refreshAllOpenEmails();
    scheduleScan();
  });
}

const observer = new MutationObserver(scheduleScan);
observer.observe(document.documentElement, { childList: true, subtree: true });

loadSettings();
scheduleScan();
