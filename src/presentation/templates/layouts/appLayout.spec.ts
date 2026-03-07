import { describe, expect, it } from 'vitest';

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

  it('uses html lang attribute', () => {
    expect(result).toContain('<html lang="en"');
  });
});
