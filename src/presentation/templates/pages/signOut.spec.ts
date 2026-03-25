import { describe, expect, it } from 'vitest';

import { signOutPage } from './signOut';

describe('signOutPage', () => {
  it('renders a complete HTML document', () => {
    const result = signOutPage({ csrfToken: 'test-csrf' });
    expect(result).toMatch(/^<!DOCTYPE html>/);
  });

  it('renders the CSRF token in a hidden field', () => {
    const result = signOutPage({ csrfToken: 'test-csrf-token' });
    expect(result).toContain('name="_csrf"');
    expect(result).toContain('value="test-csrf-token"');
  });

  it('renders a form with POST method to /auth/sign-out', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('method="POST"');
    expect(result).toContain('action="/auth/sign-out"');
  });

  it('labels the form for assistive technology', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('aria-label="Sign out"');
  });

  it('renders a sign-out submit button', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('type="submit"');
    expect(result).toContain('Sign Out');
  });

  it('renders a page title containing Sign Out', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('<title>Sign Out | ClawTask</title>');
  });

  it('renders a link to go back to the home page', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('href="/"');
  });

  it('adds x-data with submitting state to the form', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('x-data="{ submitting: false }"');
  });

  it('sets submitting to true on form submit', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain('@submit="submitting = true"');
  });

  it('disables the submit button when submitting', () => {
    const result = signOutPage({ csrfToken: 'csrf' });
    expect(result).toContain(':disabled="submitting"');
  });

  it('escapes the CSRF token to prevent XSS', () => {
    const result = signOutPage({ csrfToken: '<script>alert("xss")</script>' });
    expect(result).not.toContain('<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
  });
});
