import { describe, expect, it } from 'vitest';

import { inboxPage } from './inbox.js';

describe('inboxPage', () => {
  it('renders a complete HTML document with Inbox heading', () => {
    const result = inboxPage({ items: [] });

    expect(result).toMatch(/^<!DOCTYPE html>/);
    expect(result).toContain('<h1>Inbox</h1>');
  });

  it('renders each item with its title', () => {
    const result = inboxPage({
      items: [
        { id: 'i1', title: 'Buy milk' },
        { id: 'i2', title: 'Call dentist' },
      ],
    });

    expect(result).toContain('Buy milk');
    expect(result).toContain('Call dentist');
  });

  it('renders a Clarify button with hx-post for each item', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Buy milk' }],
    });

    expect(result).toContain('hx-post="/app/_/inbox/i1/clarify"');
    expect(result).toContain('>Clarify</button>');
  });

  it('XSS-escapes item titles', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: '<script>alert("xss")</script>' }],
    });

    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>alert');
  });

  it('XSS-escapes item IDs in hx-post URLs', () => {
    const result = inboxPage({
      items: [{ id: '"><script>', title: 'Test' }],
    });

    expect(result).not.toContain('"><script>');
  });
});
