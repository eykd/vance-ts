import { beforeEach, describe, expect, it } from 'vitest';

import { resetPasswordPage } from './resetPassword.js';

describe('resetPasswordPage', () => {
  describe('minimal props (csrfToken and token only)', () => {
    let result: string;

    beforeEach(() => {
      result = resetPasswordPage({ csrfToken: 'test-csrf-token', token: 'reset-token-abc' });
    });

    it('renders DOCTYPE and html structure', () => {
      expect.assertions(1);
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders form with POST method to /auth/reset-password', () => {
      expect.assertions(2);
      expect(result).toContain('method="POST"');
      expect(result).toContain('action="/auth/reset-password"');
    });

    it('includes CSRF hidden field', () => {
      expect.assertions(2);
      expect(result).toContain('name="_csrf"');
      expect(result).toContain('value="test-csrf-token"');
    });

    it('includes hidden token field with escaped value', () => {
      expect.assertions(2);
      expect(result).toContain('name="token"');
      expect(result).toContain('value="reset-token-abc"');
    });

    it('includes password input with label, required, autocomplete="new-password", minlength="12"', () => {
      expect.assertions(5);
      expect(result).toContain('for="password"');
      expect(result).toContain('id="password"');
      expect(result).toContain('required');
      expect(result).toContain('autocomplete="new-password"');
      expect(result).toContain('minlength="12"');
    });

    it('includes submit button "Reset Password"', () => {
      expect.assertions(2);
      expect(result).toContain('type="submit"');
      expect(result).toContain('Reset Password');
    });

    it('renders input with w-full class for full-width layout', () => {
      expect.assertions(1);
      expect(result).toContain('input input-bordered w-full');
    });

    it('renders submit button with w-full class for full-width layout', () => {
      expect.assertions(1);
      expect(result).toContain('btn btn-primary w-full');
    });

    it('includes "Back to Sign In" link', () => {
      expect.assertions(2);
      expect(result).toContain('href="/auth/sign-in"');
      expect(result).toContain('Back to Sign In');
    });

    it('does not show error when not set', () => {
      expect.assertions(1);
      expect(result).not.toContain('alert-error');
    });

    it('does not show password error when not set', () => {
      expect.assertions(1);
      expect(result).not.toContain('id="password-error"');
    });

    it('does not show password confirm error when not set', () => {
      expect.assertions(1);
      expect(result).not.toContain('id="password_confirm-error"');
    });

    it('renders password hint text', () => {
      expect.assertions(1);
      expect(result).toContain('Must be at least 12 characters');
    });

    it('includes confirm password field with label and required', () => {
      expect.assertions(4);
      expect(result).toContain('for="password_confirm"');
      expect(result).toContain('id="password_confirm"');
      expect(result).toContain('name="password_confirm"');
      expect(result).toContain('autocomplete="new-password"');
    });

    it('includes aria-describedby with password hint on password when no errors', () => {
      expect.assertions(1);
      expect(result).toContain('aria-describedby="password-hint"');
    });
  });

  describe('when error is provided', () => {
    let result: string;

    beforeEach(() => {
      result = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        error: 'Token has expired',
      });
    });

    it('shows error banner when error prop is set', () => {
      expect.assertions(3);
      expect(result).toContain('alert-error');
      expect(result).toContain('role="alert"');
      expect(result).toContain('Token has expired');
    });

    it('escapes error prop to prevent XSS', () => {
      expect.assertions(2);
      const xssResult = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        error: '<script>alert("xss")</script>',
      });
      expect(xssResult).not.toContain('<script>alert');
      expect(xssResult).toContain('&lt;script&gt;');
    });

    it('includes aria-describedby on password with hint and error', () => {
      expect.assertions(1);
      expect(result).toContain('aria-describedby="reset-password-error password-hint"');
    });
  });

  describe('when passwordError is provided', () => {
    let result: string;

    beforeEach(() => {
      result = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        passwordError: 'Password must be at least 12 characters',
      });
    });

    it('shows password field error when passwordError is set', () => {
      expect.assertions(2);
      expect(result).toContain('id="password-error"');
      expect(result).toContain('Password must be at least 12 characters');
    });

    it('escapes passwordError prop to prevent XSS', () => {
      expect.assertions(2);
      const xssResult = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        passwordError: '<script>alert("xss")</script>',
      });
      expect(xssResult).not.toContain('<script>alert');
      expect(xssResult).toContain('&lt;script&gt;');
    });

    it('includes aria-describedby on password with hint and passwordError', () => {
      expect.assertions(1);
      expect(result).toContain('aria-describedby="password-hint password-error"');
    });
  });

  describe('when passwordConfirmError is provided', () => {
    let result: string;

    beforeEach(() => {
      result = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        passwordConfirmError: 'Passwords do not match',
      });
    });

    it('shows confirm password field error', () => {
      expect.assertions(2);
      expect(result).toContain('id="password_confirm-error"');
      expect(result).toContain('Passwords do not match');
    });

    it('escapes passwordConfirmError prop to prevent XSS', () => {
      expect.assertions(2);
      const xssResult = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        passwordConfirmError: '<script>alert("xss")</script>',
      });
      expect(xssResult).not.toContain('<script>alert');
      expect(xssResult).toContain('&lt;script&gt;');
    });

    it('includes aria-describedby on confirm password when error is set', () => {
      expect.assertions(1);
      expect(result).toContain('aria-describedby="password_confirm-error"');
    });
  });

  describe('when both error and passwordError are provided', () => {
    it('includes aria-describedby with error, hint, and passwordError on password', () => {
      expect.assertions(1);
      const result = resetPasswordPage({
        csrfToken: 'csrf',
        token: 'tok',
        error: 'General error',
        passwordError: 'Field error',
      });
      expect(result).toContain(
        'aria-describedby="reset-password-error password-hint password-error"'
      );
    });
  });

  describe('token XSS protection', () => {
    it('token value is properly escaped', () => {
      expect.assertions(2);
      const result = resetPasswordPage({
        csrfToken: 'csrf',
        token: '"><script>alert(1)</script>',
      });
      expect(result).not.toContain('"><script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;');
    });
  });

  describe('page title', () => {
    it('page title is "Reset Password"', () => {
      expect.assertions(1);
      const result = resetPasswordPage({ csrfToken: 'csrf', token: 'tok' });
      expect(result).toContain('<title>Reset Password | ClawTask</title>');
    });
  });

  describe('double-submit prevention', () => {
    let result: string;

    beforeEach(() => {
      result = resetPasswordPage({ csrfToken: 'csrf', token: 'tok' });
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
