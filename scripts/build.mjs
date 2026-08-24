import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const distIconsDir = path.resolve('dist/icons');
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

// 1. Bundle TypeScript entry points
console.log('Building TypeScript bundles...');
await esbuild.build({
  entryPoints: {
    gmailJsLoader: 'src/gmailJsLoader.ts',
    extension: 'src/extension.ts',
    extensionInjector: 'src/extensionInjector.ts',
    popup: 'src/popup/popup.ts',
  },
  outdir: 'dist',
  bundle: true,
  sourcemap: true,
  target: 'es2022',
  format: 'iife',
  logLevel: 'info',
});

// 2. Copy static files to dist
console.log('Copying static assets...');
const staticFiles = [
  { src: 'src/content/styles.css', dest: 'dist/styles.css' },
  { src: 'src/popup/popup.html', dest: 'dist/popup.html' },
  { src: 'src/popup/popup.css', dest: 'dist/popup.css' },
  { src: 'icons/icon16.png', dest: 'dist/icons/icon16.png' },
  { src: 'icons/icon32.png', dest: 'dist/icons/icon32.png' },
  { src: 'icons/icon48.png', dest: 'dist/icons/icon48.png' },
  { src: 'icons/icon128.png', dest: 'dist/icons/icon128.png' },
];

for (const { src, dest } of staticFiles) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

console.log('Build complete! Output in dist/');
