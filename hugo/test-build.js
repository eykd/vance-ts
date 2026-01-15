#!/usr/bin/env node

/**
 * Hugo Build Verification Test
 *
 * Verifies that:
 * 1. Hugo builds successfully without errors
 * 2. Required files exist after build (index.html, CSS files)
 * 3. Build output directory structure is correct
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

let exitCode = 0;

try {
  logInfo('Starting Hugo build verification...\n');

  // Test 1: Run Hugo build
  logInfo('Test 1: Running Hugo build...');
  try {
    execSync('npx hugo --minify', {
      cwd: __dirname,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    logSuccess('Hugo build completed successfully');
  } catch (error) {
    logError(`Hugo build failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    exitCode = 1;
  }

  // Test 2: Check if public directory exists
  logInfo('\nTest 2: Checking build output directory...');
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    logSuccess('public/ directory exists');
  } else {
    logError('public/ directory not found');
    exitCode = 1;
  }

  // Test 3: Check if index.html exists
  logInfo('\nTest 3: Checking for index.html...');
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    logSuccess('public/index.html exists');

    // Verify it has content
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    if (indexContent.length > 0) {
      logSuccess(`index.html has content (${indexContent.length} bytes)`);
    } else {
      logError('index.html is empty');
      exitCode = 1;
    }
  } else {
    logError('public/index.html not found');
    exitCode = 1;
  }

  // Test 4: Check if CSS files exist
  logInfo('\nTest 4: Checking for CSS files...');
  const cssDir = path.join(publicDir, 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    if (cssFiles.length > 0) {
      logSuccess(`Found ${cssFiles.length} CSS file(s): ${cssFiles.join(', ')}`);
    } else {
      logError('No CSS files found in public/css/');
      exitCode = 1;
    }
  } else {
    logError('public/css/ directory not found');
    exitCode = 1;
  }

  // Test 5: Check if 404 page exists
  logInfo('\nTest 5: Checking for 404 page...');
  const notFoundPath = path.join(publicDir, '404.html');
  if (fs.existsSync(notFoundPath)) {
    logSuccess('public/404.html exists');
  } else {
    logError('public/404.html not found');
    exitCode = 1;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (exitCode === 0) {
    logSuccess('All build verification tests passed! ✨');
  } else {
    logError('Some build verification tests failed ❌');
  }
  console.log('='.repeat(50) + '\n');

} catch (error) {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  exitCode = 1;
}

process.exit(exitCode);
