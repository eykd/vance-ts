#!/usr/bin/env node

/**
 * Hugo Build Verification Test
 *
 * Verifies that:
 * 1. Hugo builds successfully without errors
 * 2. Required files exist after build (index.html, CSS files)
 * 3. Build output directory structure is correct
 *
 * NOTE: This is a Node.js build-time script, NOT Cloudflare Workers runtime code.
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

/**
 * Logs a message to the console with optional ANSI color.
 * @param {string} message - The message to log.
 * @param {string} color - ANSI color code to apply (defaults to reset).
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Logs a success message in green with a checkmark prefix.
 * @param {string} message - The success message to log.
 */
function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

/**
 * Logs an error message in red with a cross prefix.
 * @param {string} message - The error message to log.
 */
function logError(message) {
  log(`❌ ${message}`, colors.red);
}

/**
 * Logs an informational message in blue with an info prefix.
 * @param {string} message - The info message to log.
 */
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
    buildOutput = execSync('hugo --minify', {
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
  const requiredJsFiles = ['htmx-2.0.8.min.js', 'alpine-csp-3.15.8.min.js'];
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

  // Test 8: Check for route collisions with Worker paths
  logInfo('\nTest 8: Checking for route collisions with Worker paths...');
  const reservedPrefixes = ['api', path.join('app', '_')];
  let collisionFound = false;
  for (const prefix of reservedPrefixes) {
    const reservedDir = path.join(publicDir, prefix);
    if (fs.existsSync(reservedDir)) {
      const entries = fs.readdirSync(reservedDir);
      if (entries.length > 0) {
        logError(`Hugo output contains files under reserved Worker path: ${prefix}/`);
        entries.forEach(entry => log(`  ${prefix}/${entry}`, colors.yellow));
        collisionFound = true;
        exitCode = 1;
      }
    }
  }
  if (!collisionFound) {
    logSuccess('No route collisions with Worker paths (api/, app/_/)');
  }

  // Test 9: Verify noindex pages are excluded from sitemap
  logInfo('\nTest 9: Checking sitemap excludes noindex pages...');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    // Find all content files with robots: noindex
    const contentDir = path.join(__dirname, 'content');
    const noindexPages = [];

    /**
     * Recursively scans a directory for Markdown files with robots: noindex front matter.
     * @param {string} dir - Directory to scan.
     */
    function findNoindexPages(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findNoindexPages(fullPath);
        } else if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (/^robots:\s*noindex/m.test(content)) {
            // Derive URL path from file path relative to content dir
            const relPath = path.relative(contentDir, fullPath);
            const urlPath = relPath
              .replace(/_index\.md$/, '')
              .replace(/\.md$/, '/');
            noindexPages.push(urlPath);
          }
        }
      }
    }

    findNoindexPages(contentDir);

    if (noindexPages.length === 0) {
      logInfo('No noindex pages found to check');
    } else {
      let sitemapViolation = false;
      for (const urlPath of noindexPages) {
        // Check if sitemap contains a URL ending with this path
        if (sitemapContent.includes(`/${urlPath}</loc>`) || sitemapContent.includes(`/${urlPath.replace(/\/$/, '')}</loc>`)) {
          logError(`Sitemap includes noindex page: /${urlPath}`);
          sitemapViolation = true;
          exitCode = 1;
        }
      }
      if (!sitemapViolation) {
        logSuccess(`All ${noindexPages.length} noindex page(s) correctly excluded from sitemap`);
      }
    }
  } else {
    logError('public/sitemap.xml not found');
    exitCode = 1;
  }

  // Test 10: Verify favicon files exist
  logInfo('\nTest 10: Checking favicon files...');
  const requiredFaviconFiles = [
    'favicon.ico',
    'favicon.svg',
    'favicon-96x96.png',
    'apple-touch-icon.png',
    'site.webmanifest',
  ];
  for (const faviconFile of requiredFaviconFiles) {
    const faviconPath = path.join(publicDir, faviconFile);
    if (fs.existsSync(faviconPath)) {
      const stats = fs.statSync(faviconPath);
      logSuccess(`${faviconFile} exists (${stats.size} bytes)`);
    } else {
      logError(`${faviconFile} not found in public/ — browsers request /favicon.ico on every page load`);
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
