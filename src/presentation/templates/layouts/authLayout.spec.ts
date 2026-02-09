import { STYLES_CSS_PATH } from '../../generated/assetPaths';

import { authLayout } from './authLayout';

describe('authLayout', () => {
  it('renders a full HTML document with DOCTYPE', () => {
    const result = authLayout({ title: 'Login', content: '<p>form</p>' });
    expect(result).toContain('<!DOCTYPE html>');
  });

  it('includes the page title in the head', () => {
    const result = authLayout({ title: 'Register', content: '' });
    expect(result).toContain('<title>Register</title>');
  });

  it('escapes the title to prevent XSS', () => {
    const result = authLayout({ title: '<script>xss</script>', content: '' });
    expect(result).toContain('&lt;script&gt;xss&lt;/script&gt;');
    expect(result).not.toContain('<title><script>');
  });

  it('includes the content in the body', () => {
    const result = authLayout({ title: 'Test', content: '<form>test form</form>' });
    expect(result).toContain('<form>test form</form>');
  });

  it('includes the fingerprinted CSS path from Hugo build', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain(STYLES_CSS_PATH);
    expect(result).toContain(`<link`);
    expect(result).toContain(`href="${STYLES_CSS_PATH}"`);
  });

  it('includes self-hosted HTMX script', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('src="/js/htmx-2.0.8.min.js"');
  });

  it('includes self-hosted Alpine.js script with defer', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toMatch(/<script\s+defer\s+src="\/js\/alpine-3\.15\.8\.min\.js"/);
  });

  it('does not reference any external CDN domains', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).not.toContain('cdn.jsdelivr.net');
    expect(result).not.toContain('cdn.tailwindcss.com');
    expect(result).not.toContain('unpkg.com');
  });

  it('does not include SRI integrity or crossorigin attributes', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).not.toContain('integrity=');
    expect(result).not.toContain('crossorigin=');
  });

  it('sets UTF-8 charset', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('charset="utf-8"');
  });

  it('includes viewport meta tag', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('viewport');
  });

  it('renders content inside a centered card layout', () => {
    const result = authLayout({ title: 'Test', content: '<p>inner</p>' });
    expect(result).toContain('card');
    expect(result).toContain('<p>inner</p>');
  });

  it('includes HTMX security config meta tag', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('name="htmx-config"');
  });

  it('HTMX config disables script tags and eval', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('"allowScriptTags":false');
    expect(result).toContain('"allowEval":false');
  });

  it('HTMX config enables selfRequestsOnly', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('"selfRequestsOnly":true');
  });
});
