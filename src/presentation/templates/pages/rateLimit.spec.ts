import { describe, expect, it } from 'vitest';

import { rateLimitPage } from './rateLimit';

describe('rateLimitPage', () => {
  describe('default (no retryAfter)', () => {
    it('renders a complete HTML document', () => {
      const result = rateLimitPage({});
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders an error alert with role="alert"', () => {
      const result = rateLimitPage({});
      expect(result).toContain('role="alert"');
    });

    it('renders the alert-warning class', () => {
      const result = rateLimitPage({});
      expect(result).toContain('alert-warning');
    });

    it('renders a Too Many Requests heading', () => {
      const result = rateLimitPage({});
      expect(result).toContain('Too Many Requests');
    });

    it('renders page title "Too Many Requests"', () => {
      const result = rateLimitPage({});
      expect(result).toContain('<title>Too Many Requests | ClawTask</title>');
    });

    it('does not mention retry time when retryAfter is undefined', () => {
      const result = rateLimitPage({});
      expect(result).not.toContain('try again in');
    });

    it('renders a link back to sign-in', () => {
      const result = rateLimitPage({});
      expect(result).toContain('href="/auth/sign-in"');
      expect(result).toContain('Back to Sign In');
    });
  });

  describe('with custom backLink', () => {
    it('renders the custom back link href', () => {
      const result = rateLimitPage({
        backLink: { href: '/auth/sign-up', label: 'Back to Sign Up' },
      });
      expect(result).toContain('href="/auth/sign-up"');
    });

    it('renders the custom back link label', () => {
      const result = rateLimitPage({
        backLink: { href: '/auth/sign-up', label: 'Back to Sign Up' },
      });
      expect(result).toContain('Back to Sign Up');
    });

    it('does not render the default sign-in link when custom backLink is provided', () => {
      const result = rateLimitPage({
        backLink: { href: '/auth/sign-up', label: 'Back to Sign Up' },
      });
      expect(result).not.toContain('href="/auth/sign-in"');
    });

    it('renders forgot password back link', () => {
      const result = rateLimitPage({
        backLink: { href: '/auth/forgot-password', label: 'Back to Forgot Password' },
      });
      expect(result).toContain('href="/auth/forgot-password"');
      expect(result).toContain('Back to Forgot Password');
    });
  });

  describe('with retryAfter', () => {
    it('renders a retry message with the number of seconds', () => {
      const result = rateLimitPage({ retryAfter: 900 });
      expect(result).toContain('try again in');
      expect(result).toContain('900');
    });

    it('escapes retryAfter value in HTML output', () => {
      // retryAfter is a number, so XSS is not possible, but the template
      // should still use escapeHtml for defence-in-depth
      const result = rateLimitPage({ retryAfter: 60 });
      expect(result).toContain('60');
    });
  });
});
