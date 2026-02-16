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
  let buildOutput = '';
  try {
    buildOutput = execSync('npx hugo --minify', {
      cwd: __dirname,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
    logSuccess('Hugo build completed successfully');

    // Check for warnings in build output
    const warningPatterns = [
      /WARN/i,
      /WARNING/i,
      /deprecation/i,
      /deprecated/i,
    ];

    const lines = buildOutput.split('\n');
    const warnings = lines.filter(line =>
      warningPatterns.some(pattern => pattern.test(line))
    );

    if (warnings.length > 0) {
      logError(`Hugo build produced ${warnings.length} warning(s):`);
      warnings.forEach(warning => {
        log(`  ${warning}`, colors.yellow);
      });
      logError('Build warnings are not allowed (max-warnings: 0 policy)');
      exitCode = 1;
    } else {
      logSuccess('No build warnings detected');
    }
  } catch (error) {
    logError(`Hugo build failed: ${error.message}`);
    if (error.stdout) {
      console.log(error.stdout);
      buildOutput = error.stdout;
    }
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

  // Test 6: Verify assetPaths.ts matches Hugo build output
  logInfo('\nTest 6: Checking assetPaths.ts is in sync with build...');
  const assetPathsFile = path.join(__dirname, '..', 'src', 'presentation', 'generated', 'assetPaths.ts');
  if (fs.existsSync(assetPathsFile)) {
    const assetContent = fs.readFileSync(assetPathsFile, 'utf-8');
    const match = assetContent.match(/STYLES_CSS_PATH\s*=\s*'([^']+)'/);
    if (match) {
      const cssPath = match[1];
      const cssFilename = cssPath.replace(/^\/css\//, '');
      const fullCssPath = path.join(publicDir, 'css', cssFilename);
      if (fs.existsSync(fullCssPath)) {
        logSuccess(`assetPaths.ts CSS path matches build output: ${cssFilename}`);
      } else {
        logError(`assetPaths.ts references ${cssPath} but file not found in build output`);
        logError('Run "just hugo-build" to regenerate assetPaths.ts');
        exitCode = 1;
      }
    } else {
      logError('Could not extract STYLES_CSS_PATH from assetPaths.ts');
      exitCode = 1;
    }
  } else {
    logError('src/presentation/generated/assetPaths.ts not found');
    exitCode = 1;
  }

  // Test 7: Verify vendored JS files exist
  logInfo('\nTest 7: Checking vendored JS files...');
  const jsDir = path.join(publicDir, 'js');
  const requiredJsFiles = ['htmx-2.0.8.min.js', 'alpine-3.15.8.min.js'];
  for (const jsFile of requiredJsFiles) {
    const jsPath = path.join(jsDir, jsFile);
    if (fs.existsSync(jsPath)) {
      const stats = fs.statSync(jsPath);
      logSuccess(`${jsFile} exists (${stats.size} bytes)`);
    } else {
      logError(`${jsFile} not found in public/js/`);
      exitCode = 1;
    }
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
