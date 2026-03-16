import { describe, expect, it } from 'vitest';

import { rateLimitPage } from './rateLimit';

describe('rateLimitPage', () => {
  describe('default (no retryAfter)', () => {
    let result: string;

    it('renders a complete HTML document', () => {
      result = rateLimitPage({});
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders an error alert with role="alert"', () => {
      result = rateLimitPage({});
      expect(result).toContain('role="alert"');
    });

    it('renders the alert-warning class', () => {
      result = rateLimitPage({});
      expect(result).toContain('alert-warning');
    });

    it('renders a Too Many Requests heading', () => {
      result = rateLimitPage({});
      expect(result).toContain('Too Many Requests');
    });

    it('renders page title "Too Many Requests"', () => {
      result = rateLimitPage({});
      expect(result).toContain('<title>Too Many Requests</title>');
    });

    it('does not mention retry time when retryAfter is undefined', () => {
      result = rateLimitPage({});
      expect(result).not.toContain('try again in');
    });

    it('renders a link back to sign-in', () => {
      result = rateLimitPage({});
      expect(result).toContain('href="/auth/sign-in"');
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
