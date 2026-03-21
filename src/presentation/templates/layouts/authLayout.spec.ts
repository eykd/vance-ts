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

  it('does not include crossorigin attributes', () => {
    expect(result).not.toContain('crossorigin');
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

  it('uses the lemonade DaisyUI theme to match Hugo static pages', () => {
    expect(result).toContain('data-theme="lemonade"');
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

  describe('branding header', () => {
    it('renders a link to the home page above the card', () => {
      expect(result).toContain('href="/"');
    });

    it('includes the favicon as a logo image', () => {
      expect(result).toContain('src="/favicon.svg"');
      expect(result).toContain('alt="ClawTask logo"');
    });

    it('displays the site name', () => {
      expect(result).toContain('ClawTask');
    });

    it('places the branding link before the card', () => {
      const brandingIndex = result.indexOf('href="/"');
      const cardIndex = result.indexOf('card w-full');
      expect(brandingIndex).toBeGreaterThan(-1);
      expect(cardIndex).toBeGreaterThan(-1);
      expect(brandingIndex).toBeLessThan(cardIndex);
    });
  });
});
