import { findDatesInText, DateFormatStyle } from '../core/dateResolver';
import { ExtensionSettings, DEFAULT_SETTINGS, DisplayMode } from '../types/settings';

const enabledToggle = document.getElementById('enabled-toggle') as HTMLInputElement;
const displayModeSelect = document.getElementById('display-mode') as HTMLSelectElement;
const formatStyleSelect = document.getElementById('format-style') as HTMLSelectElement;
const testSentDateInput = document.getElementById('test-sent-date') as HTMLInputElement;
const testTextInput = document.getElementById('test-text') as HTMLInputElement;
const testOutputDiv = document.getElementById('test-output') as HTMLDivElement;

let currentSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };

function initSandboxDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  testSentDateInput.value = `${year}-${month}-${day}`;
}

function updateSandboxPreview() {
  const text = testTextInput.value;
  const dateVal = testSentDateInput.value;
  const sentDate = dateVal ? new Date(`${dateVal}T12:00:00`) : new Date();

  if (!text.trim()) {
    testOutputDiv.textContent = 'Enter text above to preview resolution.';
    return;
  }

  const matches = findDatesInText(text, sentDate, {
    formatStyle: currentSettings.formatStyle,
    onlyRelative: true,
  });

  if (matches.length === 0) {
    testOutputDiv.textContent = text;
    return;
  }

  testOutputDiv.innerHTML = '';
  let lastIndex = 0;

  for (const match of matches) {
    if (match.index > lastIndex) {
      testOutputDiv.appendChild(
        document.createTextNode(text.slice(lastIndex, match.index))
      );
    }

    const span = document.createElement('span');
    span.className = 'preview-pill';

    if (currentSettings.displayMode === 'inline_replace') {
      span.textContent = match.formattedDate;
    } else if (currentSettings.displayMode === 'tooltip') {
      span.textContent = match.text;
    } else {
      span.textContent = `${match.text} (${match.formattedDate})`;
    }

    span.title = `Resolved: ${match.formattedDate}`;
    testOutputDiv.appendChild(span);

    lastIndex = match.index + match.length;
  }

  if (lastIndex < text.length) {
    testOutputDiv.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function loadSettings() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['dateResolverSettings'], (result) => {
      if (result.dateResolverSettings) {
        currentSettings = { ...DEFAULT_SETTINGS, ...result.dateResolverSettings };
      }
      applySettingsToUI();
    });
  } else {
    applySettingsToUI();
  }
}

function applySettingsToUI() {
  enabledToggle.checked = currentSettings.enabled;
  displayModeSelect.value = currentSettings.displayMode;
  formatStyleSelect.value = currentSettings.formatStyle;
  updateSandboxPreview();
}

function saveSettings() {
  currentSettings.enabled = enabledToggle.checked;
  currentSettings.displayMode = displayModeSelect.value as DisplayMode;
  currentSettings.formatStyle = formatStyleSelect.value as DateFormatStyle;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ dateResolverSettings: currentSettings });
  }

  updateSandboxPreview();
}

// Event Listeners
enabledToggle.addEventListener('change', saveSettings);
displayModeSelect.addEventListener('change', saveSettings);
formatStyleSelect.addEventListener('change', saveSettings);
testTextInput.addEventListener('input', updateSandboxPreview);
testSentDateInput.addEventListener('change', updateSandboxPreview);

// Initialize
initSandboxDate();
loadSettings();
