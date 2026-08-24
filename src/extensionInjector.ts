// Content script to inject styles, Gmail.js loader, and extension bundle into page context

function injectStyle(filePath: string) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL(filePath);
  (document.head || document.documentElement).appendChild(link);
}

function injectScript(src: string) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = chrome.runtime.getURL(src);
  (document.body || document.head || document.documentElement).appendChild(script);
}

// Inject styling for highlights and tooltips
injectStyle('dist/styles.css');

// Inject scripts in order
injectScript('dist/gmailJsLoader.js');
injectScript('dist/extension.js');

// Synchronize extension settings from chrome.storage.sync to page context
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
  chrome.storage.sync.get(['dateResolverSettings'], (result) => {
    if (result.dateResolverSettings) {
      window.postMessage(
        {
          type: 'DATE_RESOLVER_UPDATE_SETTINGS',
          settings: result.dateResolverSettings,
        },
        '*'
      );
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.dateResolverSettings) {
      window.postMessage(
        {
          type: 'DATE_RESOLVER_UPDATE_SETTINGS',
          settings: changes.dateResolverSettings.newValue,
        },
        '*'
      );
    }
  });
}
