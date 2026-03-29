import { describe, expect, it } from 'vitest';

import { authErrorPage } from './authError';

describe('authErrorPage', () => {
  it('renders a complete HTML document', () => {
    const result = authErrorPage();
    expect(result).toMatch(/^<!DOCTYPE html>/);
  });

  it('renders page title "Authentication Error"', () => {
    const result = authErrorPage();
    expect(result).toContain('<title>Authentication Error | ClawTask</title>');
  });

  it('renders an error heading', () => {
    const result = authErrorPage();
    expect(result).toContain('Authentication Error');
  });

  it('renders an error alert with role="alert"', () => {
    const result = authErrorPage();
    expect(result).toContain('role="alert"');
  });

  it('renders the alert-error class', () => {
    const result = authErrorPage();
    expect(result).toContain('alert-error');
  });

  it('renders a generic error message', () => {
    const result = authErrorPage();
    expect(result).toContain('Something went wrong while signing you in');
  });

  it('renders a link back to sign-in', () => {
    const result = authErrorPage();
    expect(result).toContain('href="/auth/sign-in"');
  });

  it('does not reveal the auth framework name', () => {
    const result = authErrorPage();
    expect(result.toLowerCase()).not.toContain('better-auth');
  });

  it('does not contain external links in body content', () => {
    const result = authErrorPage();
    const body = result.slice(result.indexOf('<body'));
    expect(body).not.toMatch(/<a[^>]*href="https?:\/\//);
  });

  it('uses the shared auth layout (DaisyUI card)', () => {
    const result = authErrorPage();
    expect(result).toContain('card');
    expect(result).toContain('card-body');
  });
});
