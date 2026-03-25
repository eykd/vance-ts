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

  it('includes the title in the <title> tag', () => {
    expect(result).toContain('<title>Test Page</title>');
  });

  it('XSS-escapes the title', () => {
    const xss = appLayout({ title: '<script>alert("xss")</script>', content: '' });
    expect(xss).toContain('<title>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</title>');
    expect(xss).not.toContain('<title><script>');
  });

  it('renders content inside the body without escaping', () => {
    expect(result).toContain('<h1>Hello</h1>');
  });

  it('includes charset meta tag', () => {
    expect(result).toContain('charset="UTF-8"');
  });

  it('includes viewport meta tag for mobile rendering', () => {
    expect(result).toContain('name="viewport"');
    expect(result).toContain('width=device-width, initial-scale=1.0');
  });

  it('uses html lang attribute', () => {
    expect(result).toContain('<html lang="en"');
  });

  it('uses the clawtask-dark DaisyUI theme to match Hugo and auth pages', () => {
    expect(result).toContain('data-theme="clawtask-dark"');
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
});
