import { describe, expect, it } from 'vitest';

import { inboxPage } from './inbox.js';

/** Shared test areas for clarify form. */
const areas = [
  { id: 'area-1', name: 'Home' },
  { id: 'area-2', name: 'Work' },
];

/** Shared test contexts for clarify form. */
const contexts = [
  { id: 'ctx-1', name: 'Errands' },
  { id: 'ctx-2', name: 'Office' },
];

describe('inboxPage', () => {
  it('renders a complete HTML document with Inbox heading', () => {
    const result = inboxPage({ items: [], areas: [], contexts: [] });

    expect(result).toMatch(/^<!DOCTYPE html>/);
    expect(result).toContain('>Inbox</h1>');
  });

  it('renders each item with its title', () => {
    const result = inboxPage({
      items: [
        { id: 'i1', title: 'Buy milk' },
        { id: 'i2', title: 'Call dentist' },
      ],
      areas,
      contexts,
    });

    expect(result).toContain('Buy milk');
    expect(result).toContain('Call dentist');
  });

  it('renders a Clarify button that opens a modal for each item', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Buy milk' }],
      areas,
      contexts,
    });

    expect(result).toContain("document.getElementById('clarify-modal-i1').showModal()");
    expect(result).toContain('id="clarify-modal-i1"');
  });

  it('renders a clarify form with title, areaId, and contextId fields', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Buy milk' }],
      areas,
      contexts,
    });

    expect(result).toContain('hx-post="/app/_/inbox/i1/clarify"');
    expect(result).toContain('name="title"');
    expect(result).toContain('name="areaId"');
    expect(result).toContain('name="contextId"');
  });

  it('pre-fills the title input with the inbox item title', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Buy milk' }],
      areas,
      contexts,
    });

    expect(result).toContain('value="Buy milk"');
  });

  it('renders area options in the select', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Buy milk' }],
      areas,
      contexts,
    });

    expect(result).toContain('value="area-1"');
    expect(result).toContain('>Home</option>');
    expect(result).toContain('value="area-2"');
    expect(result).toContain('>Work</option>');
  });

  it('renders context options in the select', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Buy milk' }],
      areas,
      contexts,
    });

    expect(result).toContain('value="ctx-1"');
    expect(result).toContain('>Errands</option>');
    expect(result).toContain('value="ctx-2"');
    expect(result).toContain('>Office</option>');
  });

  it('XSS-escapes item titles', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: '<script>alert("xss")</script>' }],
      areas,
      contexts,
    });

    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>alert');
  });

  it('XSS-escapes item IDs in hx-post URLs', () => {
    const result = inboxPage({
      items: [{ id: '"><script>', title: 'Test' }],
      areas,
      contexts,
    });

    expect(result).not.toContain('"><script>');
  });

  it('XSS-escapes area names in options', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Test' }],
      areas: [{ id: 'a1', name: '<img onerror=alert(1)>' }],
      contexts,
    });

    expect(result).toContain('&lt;img onerror=alert(1)&gt;');
    expect(result).not.toContain('<img onerror');
  });

  it('XSS-escapes context names in options', () => {
    const result = inboxPage({
      items: [{ id: 'i1', title: 'Test' }],
      areas,
      contexts: [{ id: 'c1', name: '<img onerror=alert(1)>' }],
    });

    expect(result).toContain('&lt;img onerror=alert(1)&gt;');
    expect(result).not.toContain('<img onerror');
  });
});
