# Date Resolver for Gmail

A Manifest V3 Chrome extension that resolves relative dates in Gmail messages using the timestamp of the individual email—not the day you happen to read it.

---

## Features

- **Sent-date anchored**: “tomorrow” in an old email resolves relative to when that message was sent.
- **Natural language support**: Understands phrases such as “this Friday,” “next week,” “in a day,” “two days ago,” “in 3 hours,” and “3 weeks from now.”
- **Safe, non-destructive annotations**: Uses DOM text nodes rather than rewriting email HTML, preserving links, formatting, replies, and copy/paste behavior.
- **Customizable Display Modes**:
  - **Inline pill**: `tomorrow (Fri, Jan 16, 2020)`.
  - **Tooltip**: Keeps the original phrase with a resolved-date tooltip.
  - **Full replacement**: Replaces the phrase with the resolved date.
- **Configurable formats**: Supports `Thu, Jan 16, 2020`, `Jan 16, 2020`, `2020-01-16`, and numeric dates.
- **Live settings preview**: Test phrases against a sample sent date in the extension popup.

## How it works

The extension runs as a standard isolated-world content script. It watches Gmail for rendered message bodies, reads the full sent timestamp from Gmail’s message metadata, and annotates only eligible text nodes. It does not inject jQuery, Gmail.js, or page-context scripts, which keeps it compatible with Gmail’s Trusted Types policy.

Before it accesses Gmail message content, Date Resolver requires an explicit opt-in from its popup. It processes message text and timestamps locally in the browser; see the [Privacy Policy](PRIVACY.md) for full details.

---

## Installation

### Load Unpacked (Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/rgehrsitz/date_resolver.git
   cd date_resolver
   ```
2. Install dependencies and build the extension:
   ```bash
   npm ci
   npm run build
   ```
3. Open Google Chrome (or any Chromium-based browser) and navigate to `chrome://extensions`.
4. Enable **Developer mode** in the top-right corner.
5. Click **Load unpacked** and select the `date_resolver` project directory—the directory containing `manifest.json` and the generated `dist/` folder.
6. Open the extension popup and select **Enable Date Resolver**.
7. Open or refresh Gmail, then open an email containing a relative date.

### Updating an existing unpacked install

After pulling changes, run `npm ci && npm run build`, click the extension’s reload button on `chrome://extensions`, and refresh Gmail. Old entries in Chrome’s extension error log remain as history; only newly generated errors indicate a current problem.

## Privacy and Chrome Web Store

The extension reads visible Gmail message text and sent timestamps only after the user enables it, and it never transmits that data. The complete policy is in [PRIVACY.md](PRIVACY.md). For the Chrome Web Store listing, use its permanent GitHub URL:

`https://github.com/rgehrsitz/date_resolver/blob/main/PRIVACY.md`

---

## Development Scripts

- `npm run build` - Builds TypeScript bundles and copies static assets to `dist/`.
- `npm test` - Runs the Vitest automated test suite.
- `npm run test:watch` - Runs tests in interactive watch mode.
- `npm run typecheck` - Performs TypeScript static type checking without emitting files.

Run all checks before committing:

```bash
npm run typecheck && npm test && npm run build
```

---

## Project Structure

```
date_resolver/
├── .github/workflows/      # GitHub Actions CI matrix for Node.js LTS
├── icons/                  # Extension PNG icon assets
├── scripts/build.mjs       # Bundles the extension and copies static files
├── src/
│   ├── core/
│   │   └── dateResolver.ts # Core NLP parsing & formatting engine (chrono-node)
│   ├── content/
│   │   ├── domAnnotator.ts # Safe DOM TreeWalker & highlight annotator
│   │   ├── gmailDom.ts     # Gmail message timestamp reader
│   │   └── styles.css      # Highlight pills and tooltip styling
│   ├── popup/
│   │   ├── popup.html      # Extension settings popup UI
│   │   ├── popup.css       # Popup styles
│   │   └── popup.ts        # Popup state management & live sandbox
│   ├── types/              # TypeScript interfaces & definitions
│   └── extension.ts        # Content-script Gmail DOM observer
├── tests/                  # Unit tests (Vitest + Happy-DOM)
├── manifest.json           # Manifest V3 configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript configuration
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
