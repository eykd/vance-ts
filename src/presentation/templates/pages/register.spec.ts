import { beforeEach, describe, expect, it } from 'vitest';

import { registerPage } from './register';

describe('registerPage', () => {
  describe('minimal props (csrfToken only)', () => {
    let result: string;

    beforeEach(() => {
      result = registerPage({ csrfToken: 'test-csrf-token' });
    });

    it('renders a complete HTML document', () => {
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders the CSRF token in a hidden field', () => {
      expect(result).toContain('name="_csrf"');
      expect(result).toContain('value="test-csrf-token"');
    });

    it('renders a registration form with POST method', () => {
      expect(result).toContain('method="POST"');
      expect(result).toContain('action="/auth/sign-up"');
    });

    it('has label[for="email"] association', () => {
      expect(result).toContain('for="email"');
    });

    it('has label[for="password"] association', () => {
      expect(result).toContain('for="password"');
    });

    it('has email input with matching id', () => {
      expect(result).toContain('id="email"');
    });

    it('has password input with matching id', () => {
      expect(result).toContain('id="password"');
    });

    it('has autocomplete="email" on the email field', () => {
      expect(result).toContain('autocomplete="email"');
    });

    it('has autocomplete="new-password" on the password field', () => {
      expect(result).toContain('autocomplete="new-password"');
    });

    it('has label[for="password_confirm"] association', () => {
      expect(result).toContain('for="password_confirm"');
    });

    it('has password_confirm input with matching id', () => {
      expect(result).toContain('id="password_confirm"');
    });

    it('has autocomplete="new-password" on the confirm password field', () => {
      // Both password fields should have autocomplete="new-password"
      const matches = result.match(/autocomplete="new-password"/g);
      expect(matches).toHaveLength(2);
    });

    it('renders the confirm password field after the password field', () => {
      const passwordPos = result.indexOf('id="password"');
      const confirmPos = result.indexOf('id="password_confirm"');
      expect(passwordPos).toBeGreaterThanOrEqual(0);
      expect(confirmPos).toBeGreaterThan(passwordPos);
    });

    it('does not render a general error container', () => {
      expect(result).not.toContain('id="register-error"');
    });

    it('does not render aria-describedby when no errors', () => {
      expect(result).not.toContain('aria-describedby');
    });
  });

  describe('when error is provided', () => {
    let result: string;

    beforeEach(() => {
      result = registerPage({ csrfToken: 'csrf', error: 'Registration failed' });
    });

    it('renders a general error container with role="alert"', () => {
      expect(result).toContain('role="alert"');
      expect(result).toContain('id="register-error"');
    });

    it('renders the general error container with alert-error class', () => {
      expect(result).toContain('alert-error');
    });

    it('renders the error container before the first input element', () => {
      const alertPos = result.indexOf('id="register-error"');
      const firstInputPos = result.indexOf('<input');
      expect(alertPos).toBeGreaterThanOrEqual(0);
      expect(firstInputPos).toBeGreaterThanOrEqual(0);
      expect(alertPos).toBeLessThan(firstInputPos);
    });

    it('renders the error message', () => {
      expect(result).toContain('Registration failed');
    });

    it('XSS-escapes the error message', () => {
      const xssResult = registerPage({ csrfToken: 'csrf', error: '<script>alert("xss")</script>' });
      expect(xssResult).not.toContain('<script>alert');
      expect(xssResult).toContain('&lt;script&gt;');
    });

    it('sets aria-describedby on the email input referencing the error container', () => {
      const emailInputPos = result.indexOf('id="email"');
      const emailSection = result.slice(emailInputPos, result.indexOf('>', emailInputPos));
      expect(emailSection).toContain('aria-describedby="register-error"');
    });

    it('sets aria-describedby on the password input referencing the error container', () => {
      const passwordInputPos = result.indexOf('id="password"');
      const passwordSection = result.slice(passwordInputPos, result.indexOf('>', passwordInputPos));
      expect(passwordSection).toContain('aria-describedby="register-error"');
    });
  });

  describe('when fieldErrors is provided', () => {
    describe('with an email field error', () => {
      let result: string;

      beforeEach(() => {
        result = registerPage({
          csrfToken: 'csrf',
          fieldErrors: { email: 'Email is already in use' },
        });
      });

      it('renders the email field error with an id', () => {
        expect(result).toContain('id="email-error"');
        expect(result).toContain('Email is already in use');
      });

      it('sets aria-describedby on the email input referencing the field error', () => {
        const emailInputPos = result.indexOf('id="email"');
        const emailSection = result.slice(emailInputPos, result.indexOf('>', emailInputPos));
        expect(emailSection).toContain('aria-describedby="email-error"');
      });

      it('XSS-escapes the email field error', () => {
        const xssResult = registerPage({
          csrfToken: 'csrf',
          fieldErrors: { email: '<b>bad</b>' },
        });
        expect(xssResult).not.toContain('<b>bad</b>');
        expect(xssResult).toContain('&lt;b&gt;bad&lt;/b&gt;');
      });
    });

    describe('with a password field error', () => {
      let result: string;

      beforeEach(() => {
        result = registerPage({
          csrfToken: 'csrf',
          fieldErrors: { password: 'Password must be at least 12 characters' },
        });
      });

      it('renders the password field error with an id', () => {
        expect(result).toContain('id="password-error"');
        expect(result).toContain('Password must be at least 12 characters');
      });

      it('sets aria-describedby on the password input referencing the field error', () => {
        const passwordInputPos = result.indexOf('id="password"');
        const passwordSection = result.slice(
          passwordInputPos,
          result.indexOf('>', passwordInputPos)
        );
        expect(passwordSection).toContain('aria-describedby="password-error"');
      });
    });

    describe('with a password_confirm field error', () => {
      let result: string;

      beforeEach(() => {
        result = registerPage({
          csrfToken: 'csrf',
          fieldErrors: { password_confirm: 'Passwords do not match' },
        });
      });

      it('renders the password_confirm field error with an id', () => {
        expect(result).toContain('id="password_confirm-error"');
        expect(result).toContain('Passwords do not match');
      });

      it('sets aria-describedby on the confirm password input referencing the field error', () => {
        const confirmInputPos = result.indexOf('id="password_confirm"');
        const confirmSection = result.slice(confirmInputPos, result.indexOf('>', confirmInputPos));
        expect(confirmSection).toContain('aria-describedby="password_confirm-error"');
      });

      it('XSS-escapes the password_confirm field error', () => {
        const xssResult = registerPage({
          csrfToken: 'csrf',
          fieldErrors: { password_confirm: '<b>bad</b>' },
        });
        expect(xssResult).not.toContain('<b>bad</b>');
        expect(xssResult).toContain('&lt;b&gt;bad&lt;/b&gt;');
      });
    });

    describe('with both general error and email field error', () => {
      it('includes both error IDs in the email input aria-describedby', () => {
        const result = registerPage({
          csrfToken: 'csrf',
          error: 'Fix the errors below',
          fieldErrors: { email: 'Invalid email' },
        });
        const emailInputPos = result.indexOf('id="email"');
        const emailSection = result.slice(emailInputPos, result.indexOf('>', emailInputPos));
        expect(emailSection).toContain('aria-describedby="register-error email-error"');
      });
    });

    describe('with both general error and password field error', () => {
      it('includes both error IDs in the password input aria-describedby', () => {
        const result = registerPage({
          csrfToken: 'csrf',
          error: 'Fix the errors below',
          fieldErrors: { password: 'Password too weak' },
        });
        const passwordInputPos = result.indexOf('id="password"');
        const passwordSection = result.slice(
          passwordInputPos,
          result.indexOf('>', passwordInputPos)
        );
        expect(passwordSection).toContain('aria-describedby="register-error password-error"');
      });
    });

    describe('with both general error and password_confirm field error', () => {
      it('includes both error IDs in the confirm password input aria-describedby', () => {
        const result = registerPage({
          csrfToken: 'csrf',
          error: 'Fix the errors below',
          fieldErrors: { password_confirm: 'Passwords do not match' },
        });
        const confirmInputPos = result.indexOf('id="password_confirm"');
        const confirmSection = result.slice(confirmInputPos, result.indexOf('>', confirmInputPos));
        expect(confirmSection).toContain(
          'aria-describedby="register-error password_confirm-error"'
        );
      });
    });
  });

  describe('when email is provided', () => {
    it('pre-fills the email input value', () => {
      const result = registerPage({ csrfToken: 'csrf', email: 'user@example.com' });
      expect(result).toContain('value="user@example.com"');
    });

    it('XSS-escapes the email value', () => {
      const result = registerPage({ csrfToken: 'csrf', email: '"><script>xss</script>' });
      expect(result).not.toContain('"><script>xss</script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;xss&lt;/script&gt;');
    });
  });

  describe('double-submit prevention', () => {
    let result: string;

    beforeEach(() => {
      result = registerPage({ csrfToken: 'csrf' });
    });

    it('adds x-data with submitting state to the form', () => {
      expect(result).toContain('x-data="{ submitting: false }"');
    });

    it('sets submitting to true on form submit', () => {
      expect(result).toContain('@submit="submitting = true"');
    });

    it('disables the submit button when submitting', () => {
      expect(result).toContain(':disabled="submitting"');
    });
  });

  describe('XSS protection for csrfToken', () => {
    it('escapes the CSRF token value', () => {
      const result = registerPage({ csrfToken: '"><script>alert(1)</script>' });
      expect(result).not.toContain('"><script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;');
    });
  });
});
