#!/usr/bin/env node

import { spawn, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const platform = process.platform;

// Parse CLI arguments
const args = process.argv.slice(2);
const useProfile = args.includes('--profile');
const forceHeadless = args.includes('--headless');
const noSandbox = args.includes('--no-sandbox');
const validArgs = ['--profile', '--headless', '--no-sandbox'];
const unknownArgs = args.filter((arg) => !validArgs.includes(arg));

if (unknownArgs.length > 0) {
  console.log('Usage: start.js [--profile] [--headless] [--no-sandbox]');
  console.log('\nOptions:');
  console.log('  --profile    Copy your default Chrome profile (cookies, logins)');
  console.log('  --headless   Run in headless mode (default on Linux without display)');
  console.log('  --no-sandbox Disable sandbox (for containers/root)');
  console.log('\nExamples:');
  console.log('  start.js               # Start with fresh profile');
  console.log('  start.js --profile     # Start with your Chrome profile');
  console.log('  start.js --headless    # Start in headless mode');
  process.exit(1);
}

/**
 * Find Chrome/Chromium executable path for the current platform
 * Prioritizes Playwright Chromium for consistency across environments
 * @returns {string | null} Path to Chrome executable or null if not found
 */
function findChromePath() {
  const home = process.env['HOME'] ?? '';

  // Check Playwright Chromium first (all platforms)
  const playwrightChrome = `${home}/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`;
  if (existsSync(playwrightChrome)) {
    return playwrightChrome;
  }

  if (platform === 'darwin') {
    const macPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (existsSync(macPath)) {
      return macPath;
    }
    return null;
  }

  // Linux: system Chrome/Chromium fallbacks
  const linuxPaths = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  for (const path of linuxPaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  return null;
}

/**
 * Get user profile path for Chrome/Chromium
 * @param {string} chromePath Path to the Chrome executable
 * @returns {string} Path to user's Chrome profile directory
 */
function getProfilePath(chromePath) {
  const home = process.env['HOME'] ?? '';

  if (platform === 'darwin') {
    return `${home}/Library/Application Support/Google/Chrome/`;
  }

  // Linux: detect based on which browser we're using
  if (chromePath.includes('chromium')) {
    return `${home}/.config/chromium/`;
  }
  return `${home}/.config/google-chrome/`;
}

/**
 * Kill existing Chrome/Chromium processes
 */
function killExistingChrome() {
  try {
    if (platform === 'darwin') {
      execSync("killall 'Google Chrome'", { stdio: 'ignore' });
    } else {
      // Linux: kill both chrome and chromium
      execSync("pkill -f 'chrome|chromium'", { stdio: 'ignore' });
    }
  } catch {
    // Process not running, ignore
  }
}

/**
 * Determine if we should run headless
 * @returns {boolean}
 */
function shouldRunHeadless() {
  if (forceHeadless) {
    return true;
  }

  // On Linux, run headless by default unless DISPLAY is set
  if (platform === 'linux' && !process.env['DISPLAY']) {
    return true;
  }

  return false;
}

// Find Chrome executable
const chromePath = findChromePath();
if (!chromePath) {
  console.error('✗ Chrome/Chromium not found');
  console.error('');
  console.error('Recommended: Install Playwright Chromium (works everywhere)');
  console.error('  npm install -g playwright');
  console.error('  npx playwright install chromium --with-deps');
  console.error('');
  if (platform === 'darwin') {
    console.error('Alternative: Install Chrome from https://www.google.com/chrome/');
  } else {
    console.error('Alternative: Install system Chrome');
    console.error('  apt install google-chrome-stable');
    console.error('  Or: apt install chromium-browser');
  }
  process.exit(1);
}

const headless = shouldRunHeadless();

// Kill existing Chrome
killExistingChrome();

// Wait for processes to fully terminate
await new Promise((r) => setTimeout(r, 1000));

// Setup profile directory
const cacheDir = `${process.env['HOME']}/.cache/scraping`;
execSync(`mkdir -p ${cacheDir}`, { stdio: 'ignore' });

if (useProfile) {
  const profilePath = getProfilePath(chromePath);
  if (existsSync(profilePath)) {
    // Sync profile with rsync (much faster on subsequent runs)
    execSync(`rsync -a --delete "${profilePath}" ${cacheDir}/`, {
      stdio: 'pipe',
    });
  } else {
    console.warn(`⚠ Profile not found at ${profilePath}, starting fresh`);
  }
}

// Build Chrome arguments
const chromeArgs = [
  '--remote-debugging-port=9222',
  `--user-data-dir=${cacheDir}`,
  '--profile-directory=Default',
];

if (headless) {
  chromeArgs.push('--headless=new', '--disable-gpu', '--disable-dev-shm-usage');
}

if (noSandbox) {
  chromeArgs.push('--no-sandbox', '--disable-setuid-sandbox');
}

// Start Chrome (detached so Node can exit)
spawn(chromePath, chromeArgs, { detached: true, stdio: 'ignore' }).unref();

// Wait for Chrome to be ready by attempting to connect
let connected = false;
for (let i = 0; i < 30; i++) {
  try {
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null,
    });
    await browser.disconnect();
    connected = true;
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

if (!connected) {
  console.error('✗ Failed to connect to Chrome');
  process.exit(1);
}

const status = [
  '✓ Chrome started on :9222',
  useProfile ? 'with profile' : null,
  headless ? '(headless)' : null,
]
  .filter(Boolean)
  .join(' ');

console.log(status);
