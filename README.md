# Date Resolver Extension for GMail

## Introduction

This browser extension replaces date keywords in Gmail with the corresponding relative date.

## Features

- Replaces words like "today", "tomorrow", "yesterday" etc. with the actual date relative to the email sent date
- Handles capitalized versions like "Today" or "TOMORROW" properly
- Supports additional keywords like "next week", "last week", and days of the week

## Usage

The extension will automatically run on Gmail and replace date keywords in the email body with the calculated dates.

For example, if an email was sent on January 1, 2022:

"today" -> "January 1, 2022"
"yesterday" -> "December 31, 2021"
"tomorrow" -> "January 2, 2022"
Installation
The extension can be installed from the Chrome Web Store here: Gmail Date Replacer

Alternatively it can be loaded unpacked from the dist folder.

## Installation

1. Clone the repository: `git clone https://github.com/rgehrsitz/date_resolver.git`
2. Navigate to the directory: `cd date_resolver`
3. Install dependencies: `npm install`

## Structure

- `src/`: Contains the main JavaScript files for the extension.
  - `extension.js`: Main extension logic.
  - `extensionInjector.js`: Code related to injecting the extension into the page.
  - `gmailJsLoader.js`: Code related to interacting with Gmail.
- `.github/workflows/`: Contains GitHub Actions workflow for Node.js.
- `manifest.json`: Manifest file for the extension.
- `package.json`: Defines the project dependencies and scripts.
- `renovate.json`: Configuration for Renovate bot.

## It uses:

- gmail-js to interact with Gmail
- Webpack and Babel for building

## Contributing

Contributions are welcome! Please open an issue or PR if you would like to help add features or fix bugs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
