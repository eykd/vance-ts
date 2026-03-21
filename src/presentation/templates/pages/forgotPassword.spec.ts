import { beforeEach, describe, expect, it } from 'vitest';

import { forgotPasswordPage } from './forgotPassword.js';

describe('forgotPasswordPage', () => {
  describe('minimal props (csrfToken only)', () => {
    let result: string;

    beforeEach(() => {
      result = forgotPasswordPage({ csrfToken: 'test-csrf-token' });
    });

    it('renders DOCTYPE and html structure', () => {
      expect.assertions(1);
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders form with POST method to /auth/forgot-password', () => {
      expect.assertions(2);
      expect(result).toContain('method="POST"');
      expect(result).toContain('action="/auth/forgot-password"');
    });

    it('includes CSRF hidden field with the token value', () => {
      expect.assertions(2);
      expect(result).toContain('name="_csrf"');
      expect(result).toContain('value="test-csrf-token"');
    });

    it('includes email input with label and required attribute', () => {
      expect.assertions(3);
      expect(result).toContain('for="email"');
      expect(result).toContain('id="email"');
      expect(result).toContain('required');
    });

    it('includes submit button "Send Reset Link"', () => {
      expect.assertions(2);
      expect(result).toContain('type="submit"');
      expect(result).toContain('Send Reset Link');
    });

    it('renders input with w-full class for full-width layout', () => {
      expect.assertions(1);
      expect(result).toContain('input input-bordered w-full');
    });

    it('renders submit button with w-full class for full-width layout', () => {
      expect.assertions(1);
      expect(result).toContain('btn btn-primary w-full');
    });

    it('includes "Back to Sign In" link to /auth/sign-in', () => {
      expect.assertions(2);
      expect(result).toContain('href="/auth/sign-in"');
      expect(result).toContain('Back to Sign In');
    });

    it('does not show success banner when success is not set', () => {
      expect.assertions(1);
      expect(result).not.toContain('alert-success');
    });

    it('does not show error when not set', () => {
      expect.assertions(1);
      expect(result).not.toContain('alert-error');
    });

    it('does not include aria-describedby when no error', () => {
      expect.assertions(1);
      expect(result).not.toContain('aria-describedby');
    });
  });

  describe('when success is true', () => {
    it('shows success banner when success=true', () => {
      expect.assertions(2);
      const result = forgotPasswordPage({ csrfToken: 'csrf', success: true });
      expect(result).toContain('alert-success');
      expect(result).toContain('role="alert"');
    });
  });

  describe('when error is provided', () => {
    let result: string;

    beforeEach(() => {
      result = forgotPasswordPage({ csrfToken: 'csrf', error: 'Something went wrong' });
    });

    it('shows error banner when error prop is set', () => {
      expect.assertions(3);
      expect(result).toContain('alert-error');
      expect(result).toContain('role="alert"');
      expect(result).toContain('Something went wrong');
    });

    it('escapes error prop to prevent XSS', () => {
      expect.assertions(2);
      const xssResult = forgotPasswordPage({
        csrfToken: 'csrf',
        error: '<script>alert("xss")</script>',
      });
      expect(xssResult).not.toContain('<script>alert');
      expect(xssResult).toContain('&lt;script&gt;');
    });

    it('includes aria-describedby on email when error is set', () => {
      expect.assertions(1);
      expect(result).toContain('aria-describedby="forgot-password-error"');
    });
  });

  describe('when email is provided', () => {
    it('pre-fills email when email prop is set', () => {
      expect.assertions(1);
      const result = forgotPasswordPage({ csrfToken: 'csrf', email: 'user@example.com' });
      expect(result).toContain('value="user@example.com"');
    });

    it('escapes email prop to prevent XSS', () => {
      expect.assertions(2);
      const result = forgotPasswordPage({ csrfToken: 'csrf', email: '"><script>xss</script>' });
      expect(result).not.toContain('"><script>xss</script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;xss&lt;/script&gt;');
    });
  });

  describe('page title', () => {
    it('page title is "Forgot Password"', () => {
      expect.assertions(1);
      const result = forgotPasswordPage({ csrfToken: 'csrf' });
      expect(result).toContain('<title>Forgot Password | ClawTask</title>');
    });
  });

  describe('double-submit prevention', () => {
    let result: string;

    beforeEach(() => {
      result = forgotPasswordPage({ csrfToken: 'csrf' });
    });

    it('adds x-data with submitting state to the form', () => {
      expect.assertions(1);
      expect(result).toContain('x-data="{ submitting: false }"');
    });

    it('sets submitting to true on form submit', () => {
      expect.assertions(1);
      expect(result).toContain('@submit="submitting = true"');
    });

    it('disables the submit button when submitting', () => {
      expect.assertions(1);
      expect(result).toContain(':disabled="submitting"');
    });
  });
});
