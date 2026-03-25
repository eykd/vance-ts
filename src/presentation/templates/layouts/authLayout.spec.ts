import { ALPINE_JS_PATH, HTMX_JS_PATH } from '../../generated/assetPaths';

import { authLayout } from './authLayout';

describe('authLayout', () => {
  const defaultProps = { title: 'Sign In', content: '<form>test</form>' };

  let result: string;

  beforeEach(() => {
    result = authLayout(defaultProps);
  });

  it('renders a full HTML document starting with DOCTYPE', () => {
    expect(result).toMatch(/^<!DOCTYPE html>/);
  });

  it('includes the title with site name suffix in the <title> tag', () => {
    expect(result).toContain('<title>Sign In | ClawTask</title>');
  });

  it('XSS-escapes the title while preserving site name suffix', () => {
    const xss = authLayout({ title: '<script>alert("xss")</script>', content: '' });
    expect(xss).toContain(
      '<title>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; | ClawTask</title>'
    );
    expect(xss).not.toContain('<title><script>');
  });

  it('renders content inside the document without escaping', () => {
    expect(result).toContain('<form>test</form>');
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

  it('does not reference any CDN domains', () => {
    expect(result).not.toContain('cdn.tailwindcss.com');
    expect(result).not.toContain('unpkg.com');
    expect(result).not.toContain('cdn.jsdelivr.net');
  });

  it('does not include SRI integrity attributes', () => {
    expect(result).not.toContain('integrity=');
  });

  it('does not include crossorigin attributes on local assets', () => {
    expect(result).not.toMatch(/stylesheet.*crossorigin/);
    expect(result).not.toMatch(/script.*crossorigin/);
  });

  it('includes HTMX security config meta tag', () => {
    expect(result).toContain('"selfRequestsOnly":true');
    expect(result).toContain('"allowScriptTags":false');
    expect(result).toContain('"allowEval":false');
  });

  it('includes charset meta tag', () => {
    expect(result).toContain('charset="UTF-8"');
  });

  it('includes viewport meta tag', () => {
    expect(result).toContain('name="viewport"');
  });

  it('uses html lang attribute', () => {
    expect(result).toContain('<html lang="en"');
  });

  it('uses the clawtask-dark DaisyUI theme to match Hugo static pages', () => {
    expect(result).toContain('data-theme="clawtask-dark"');
  });

  it('includes robots noindex nofollow meta tag', () => {
    expect(result).toContain('<meta name="robots" content="noindex, nofollow"');
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

  describe('accessibility landmarks', () => {
    it('renders a skip-to-content link as the first focusable element in the body', () => {
      const bodyStart = result.indexOf('<body');
      const skipLink = result.indexOf('Skip to content');
      expect(skipLink).toBeGreaterThan(bodyStart);
      expect(result).toContain('href="#main-content"');
    });

    it('renders the skip-to-content link with sr-only styling that becomes visible on focus', () => {
      expect(result).toMatch(/class="[^"]*sr-only[^"]*"/);
      expect(result).toMatch(/class="[^"]*focus:not-sr-only[^"]*"/);
    });

    it('wraps page content in a <main> element with id="main-content"', () => {
      expect(result).toContain('<main');
      expect(result).toContain('id="main-content"');
    });

    it('places content inside the <main> element', () => {
      const mainOpen = result.indexOf('<main');
      const mainClose = result.indexOf('</main>');
      const contentIndex = result.indexOf('<form>test</form>');
      expect(mainOpen).toBeGreaterThan(-1);
      expect(mainClose).toBeGreaterThan(-1);
      expect(contentIndex).toBeGreaterThan(mainOpen);
      expect(contentIndex).toBeLessThan(mainClose);
    });
  });

  describe('navbar', () => {
    it('renders a frosted glass navbar with site navigation label', () => {
      expect(result).toContain('aria-label="Site navigation"');
      expect(result).toContain('navbar bg-base-100/50 backdrop-blur-sm');
    });

    it('renders the ClawTask logo link in the navbar-start', () => {
      expect(result).toContain('navbar-start');
      expect(result).toMatch(/btn btn-ghost font-serif text-xl text-primary[^"]*">ClawTask<\/a>/);
    });

    it('links the logo to the home page', () => {
      const navStart = result.indexOf('navbar-start');
      const logoLink = result.indexOf('href="/"', navStart);
      expect(logoLink).toBeGreaterThan(navStart);
    });

    it('renders a sign-in link in the navbar-end', () => {
      expect(result).toContain('navbar-end');
      expect(result).toContain('href="/auth/sign-in"');
      expect(result).toContain('Sign In');
    });

    it('places the navbar before the main content', () => {
      const navIndex = result.indexOf('<nav');
      const mainIndex = result.indexOf('<main');
      expect(navIndex).toBeGreaterThan(-1);
      expect(mainIndex).toBeGreaterThan(-1);
      expect(navIndex).toBeLessThan(mainIndex);
    });
  });

  describe('footer', () => {
    it('renders a footer with ClawTask branding', () => {
      expect(result).toContain('<footer');
      expect(result).toMatch(/font-serif font-semibold[^"]*">ClawTask<\/p>/);
    });

    it('includes a copyright notice', () => {
      expect(result).toContain('&copy; 2026 Worlds Enough Studios. All rights reserved.');
    });

    it('places the footer after main content', () => {
      const mainClose = result.indexOf('</main>');
      const footerIndex = result.indexOf('<footer');
      expect(mainClose).toBeGreaterThan(-1);
      expect(footerIndex).toBeGreaterThan(mainClose);
    });
  });

  describe('layout structure', () => {
    it('uses font-sans and bg-base-200 on the body', () => {
      expect(result).toMatch(/<body[^>]*class="font-sans bg-base-200"/);
    });

    it('centers the card in main with flex layout', () => {
      expect(result).toContain('grow flex flex-col items-center justify-center');
    });

    it('renders the card inside main', () => {
      const mainOpen = result.indexOf('<main');
      const mainClose = result.indexOf('</main>');
      const cardIndex = result.indexOf('card w-full max-w-md');
      expect(cardIndex).toBeGreaterThan(mainOpen);
      expect(cardIndex).toBeLessThan(mainClose);
    });
  });
});
