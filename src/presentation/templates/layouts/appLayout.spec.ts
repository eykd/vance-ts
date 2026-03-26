import { describe, expect, it } from 'vitest';

import { ALPINE_JS_PATH, HTMX_JS_PATH } from '../../generated/assetPaths';

import { appLayout } from './appLayout.js';

describe('appLayout', () => {
  const defaultProps = { title: 'Test Page', content: '<h1>Hello</h1>' };

  let result: string;

  beforeEach(() => {
    result = appLayout(defaultProps);
  });

  it('renders a full HTML document starting with DOCTYPE', () => {
    expect(result).toMatch(/^<!DOCTYPE html>/);
  });

  it('includes the title with ClawTask suffix in the <title> tag', () => {
    expect(result).toContain('<title>Test Page | ClawTask</title>');
  });

  it('XSS-escapes the title', () => {
    const xss = appLayout({ title: '<script>alert("xss")</script>', content: '' });
    expect(xss).toContain(
      '<title>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; | ClawTask</title>'
    );
    expect(xss).not.toContain('<title><script>');
  });

  it('renders content inside the main element without escaping', () => {
    expect(result).toContain('<h1>Hello</h1>');
  });

  it('includes charset meta tag', () => {
    expect(result).toContain('charset="UTF-8"');
  });

  it('includes viewport meta tag with shrink-to-fit=no', () => {
    expect(result).toContain('name="viewport"');
    expect(result).toContain('width=device-width, initial-scale=1.0, shrink-to-fit=no');
  });

  it('includes robots meta tag to prevent indexing of app pages', () => {
    expect(result).toContain('<meta name="robots" content="noindex, nofollow"');
  });

  it('uses html lang attribute', () => {
    expect(result).toContain('<html lang="en"');
  });

  it('uses the clawtask-dark DaisyUI theme to match Hugo and auth pages', () => {
    expect(result).toContain('data-theme="clawtask-dark"');
  });

  it('applies font-sans and bg-base-200 classes to the body', () => {
    expect(result).toMatch(/<body\s[^>]*class="font-sans bg-base-200"/);
  });

  it('includes a skip-to-content link for accessibility', () => {
    expect(result).toContain('href="#main-content"');
    expect(result).toContain('Skip to content');
    expect(result).toContain('sr-only');
  });

  it('wraps content in a semantic main element with id and grow class', () => {
    expect(result).toMatch(/<main\s+id="main-content"\s+class="grow">/);
    expect(result).toContain('<h1>Hello</h1></main>');
  });

  it('uses a flex column container for sticky footer layout', () => {
    expect(result).toContain('flex min-h-screen flex-col');
  });

  it('links the fingerprinted CSS file', () => {
    expect(result).toMatch(/href="\/css\/styles\.[a-f0-9]+\.css"/);
  });

  it('includes self-hosted HTMX script using the generated constant', () => {
    expect(result).toContain(`src="${HTMX_JS_PATH}"`);
  });

  it('includes self-hosted Alpine.js script with defer using the generated constant', () => {
    expect(result).toContain(`src="${ALPINE_JS_PATH}"`);
    expect(result).toMatch(/<script\s[^>]*defer[^>]*src="/);
  });

  it('includes HTMX security config meta tag', () => {
    expect(result).toContain('"selfRequestsOnly":true');
    expect(result).toContain('"allowScriptTags":false');
    expect(result).toContain('"allowEval":false');
  });

  it('configures HTMX responseHandling to swap on 422 responses', () => {
    expect(result).toContain('"responseHandling"');
    expect(result).toContain('"code":"422"');
  });

  it('includes an SVG favicon link tag', () => {
    expect(result).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg"');
  });

  it('includes an apple-touch-icon link tag', () => {
    expect(result).toContain('<link rel="apple-touch-icon"');
    expect(result).toContain('href="/apple-touch-icon.png"');
  });

  it('includes a web app manifest link tag', () => {
    expect(result).toContain('<link rel="manifest" href="/site.webmanifest"');
  });

  it('renders a navigation bar with app links', () => {
    expect(result).toContain('aria-label="App navigation"');
    expect(result).toContain('href="/app"');
    expect(result).toContain('href="/app/inbox"');
    expect(result).toContain('href="/app/actions"');
  });

  it('includes a sign-out link in the navigation', () => {
    expect(result).toContain('href="/auth/sign-out"');
    expect(result).toContain('Sign Out');
  });

  it('includes a mobile hamburger menu button hidden on desktop', () => {
    expect(result).toContain('lg:hidden');
    expect(result).toContain('aria-label="Open menu"');
  });

  it('hides desktop nav links on mobile and shows on large screens', () => {
    expect(result).toMatch(/navbar-center[^>]*hidden lg:flex/);
    expect(result).toMatch(/navbar-end[^>]*hidden lg:flex/);
  });

  it('renders the ClawTask logo linking to the homepage', () => {
    expect(result).toMatch(
      /<a\s+href="\/"\s+class="btn btn-ghost font-serif text-xl text-primary">ClawTask<\/a>/
    );
  });

  it('renders a footer with copyright text', () => {
    expect(result).toContain('<footer');
    expect(result).toContain('&copy; 2026 Worlds Enough Studios. All rights reserved.');
  });

  it('uses frosted glass navbar styling', () => {
    expect(result).toContain('bg-base-100/50');
    expect(result).toContain('backdrop-blur-sm');
    expect(result).toContain('border-b border-base-300');
  });
});
