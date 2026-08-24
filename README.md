# Date Resolver for GMail

A Chrome extension (Manifest V3) that intelligently detects and resolves relative date mentions (e.g., *"today"*, *"tomorrow"*, *"this Friday"*, *"next Tuesday"*, *"in 3 days"*, *"2 weeks ago"*) in Gmail messages, accurately anchored to the timestamp when each email was sent.

---

## Features

- **Sent-Date Anchored Resolution**: Computes relative dates based on when the email was originally sent, not your current local date.
- **Natural Language Understanding**: Powered by `chrono-node` to parse complex date expressions (*"this Friday"*, *"next week"*, *"3 days ago"*, etc.).
- **Safe & Non-Destructive**: Annotates text nodes using standard DOM `TreeWalker` without mutating raw HTML or interfering with email replies, forwarding, or copy/pasting.
- **Customizable Display Modes**:
  - **Inline Pill**: Display resolved dates inline, e.g., `tomorrow (Fri, Jan 16)`.
  - **Hover Tooltip**: Keep email layout clean with subtle dotted underlines and detailed hover tooltips.
  - **Full Replacement**: Seamless inline text substitution.
- **Configurable Formats**: Support for `Thu, Jan 16, 2020`, `Jan 16, 2020`, `2020-01-16 (ISO)`, and more.
- **Settings Popup with Live Preview**: Test phrases in real-time against custom sample dates inside the extension popup.

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
   npm install
   npm run build
   ```
3. Open Google Chrome (or any Chromium-based browser) and navigate to `chrome://extensions`.
4. Enable **Developer mode** in the top-right corner.
5. Click **Load unpacked** and select the `date_resolver` project directory.

---

## Development Scripts

- `npm run build` - Builds TypeScript bundles and copies static assets to `dist/`.
- `npm test` - Runs the Vitest automated test suite.
- `npm run test:watch` - Runs tests in interactive watch mode.
- `npm run typecheck` - Performs TypeScript static type checking without emitting files.

---

## Project Structure

```
date_resolver/
├── .github/workflows/      # GitHub Actions CI matrix for Node.js LTS
├── icons/                  # Extension SVG and icon assets
├── src/
│   ├── core/
│   │   └── dateResolver.ts # Core NLP parsing & formatting engine (chrono-node)
│   ├── content/
│   │   ├── domAnnotator.ts # Safe DOM TreeWalker & highlight annotator
│   │   └── styles.css      # Highlight pills and tooltip styling
│   ├── popup/
│   │   ├── popup.html      # Extension settings popup UI
│   │   ├── popup.css       # Popup styles
│   │   └── popup.ts        # Popup state management & live sandbox
│   ├── types/              # TypeScript interfaces & definitions
│   ├── extension.ts        # Main Gmail.js observer & orchestration script
│   ├── extensionInjector.ts# Manifest V3 content script injector
│   └── gmailJsLoader.ts    # Gmail.js bootstrap loader
├── tests/                  # Unit tests (Vitest + Happy-DOM)
├── manifest.json           # Manifest V3 configuration
├── package.json            # Dependencies & scripts
└── tsconfig.json           # TypeScript configuration
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
