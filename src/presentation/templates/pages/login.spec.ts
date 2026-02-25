import { loginPage } from './login';

describe('loginPage', () => {
  describe('minimal props (csrfToken only)', () => {
    let result: string;

    beforeEach(() => {
      result = loginPage({ csrfToken: 'test-csrf-token' });
    });

    it('renders a complete HTML document', () => {
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders the CSRF token in a hidden field', () => {
      expect(result).toContain('name="_csrf"');
      expect(result).toContain('value="test-csrf-token"');
    });

    it('renders a sign-in form with POST method', () => {
      expect(result).toContain('method="POST"');
      expect(result).toContain('action="/auth/sign-in"');
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

    it('has autocomplete="current-password" on the password field', () => {
      expect(result).toContain('autocomplete="current-password"');
    });

    it('does not render an error container', () => {
      expect(result).not.toContain('alert-error');
    });

    it('does not render a redirectTo field', () => {
      expect(result).not.toContain('name="redirectTo"');
    });

    it('does not render a registration success banner', () => {
      expect(result).not.toContain('alert-success');
    });
  });

  describe('when error is provided', () => {
    let result: string;

    beforeEach(() => {
      result = loginPage({ csrfToken: 'csrf', error: 'Invalid credentials' });
    });

    it('renders an error container with role="alert"', () => {
      expect(result).toContain('role="alert"');
    });

    it('renders the error container with alert-error class', () => {
      expect(result).toContain('alert-error');
    });

    it('renders the error message', () => {
      expect(result).toContain('Invalid credentials');
    });

    it('renders error container before the first input element', () => {
      const alertPos = result.indexOf('role="alert"');
      const firstInputPos = result.indexOf('<input');
      expect(alertPos).toBeGreaterThanOrEqual(0);
      expect(firstInputPos).toBeGreaterThanOrEqual(0);
      expect(alertPos).toBeLessThan(firstInputPos);
    });

    it('sets aria-describedby on the email input referencing the error container', () => {
      expect(result).toContain('aria-describedby="login-error"');
    });

    it('XSS-escapes the error message', () => {
      const xssResult = loginPage({ csrfToken: 'csrf', error: '<script>alert("xss")</script>' });
      expect(xssResult).not.toContain('<script>alert');
      expect(xssResult).toContain('&lt;script&gt;');
    });
  });

  describe('when redirectTo is provided', () => {
    it('renders the redirectTo value in a hidden field', () => {
      const result = loginPage({ csrfToken: 'csrf', redirectTo: '/app/dashboard' });
      expect(result).toContain('name="redirectTo"');
      expect(result).toContain('value="/app/dashboard"');
    });

    it('XSS-escapes the redirectTo value', () => {
      const result = loginPage({ csrfToken: 'csrf', redirectTo: '"><script>alert(1)</script>' });
      expect(result).not.toContain('"><script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;');
    });
  });

  describe('when email is provided', () => {
    it('pre-fills the email input value', () => {
      const result = loginPage({ csrfToken: 'csrf', email: 'user@example.com' });
      expect(result).toContain('value="user@example.com"');
    });

    it('XSS-escapes the email value', () => {
      const result = loginPage({ csrfToken: 'csrf', email: '"><script>xss</script>' });
      expect(result).not.toContain('"><script>xss</script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;xss&lt;/script&gt;');
    });
  });

  describe('when registeredSuccess is true', () => {
    let result: string;

    beforeEach(() => {
      result = loginPage({ csrfToken: 'csrf', registeredSuccess: true });
    });

    it('shows the registration success banner', () => {
      expect(result).toContain('alert-success');
    });

    it('the success banner has role="alert"', () => {
      expect(result).toContain('role="alert"');
    });
  });

  describe('when registeredSuccess is false', () => {
    it('does not show the registration success banner', () => {
      const result = loginPage({ csrfToken: 'csrf', registeredSuccess: false });
      expect(result).not.toContain('alert-success');
    });
  });

  describe('XSS protection for csrfToken', () => {
    it('escapes the CSRF token value', () => {
      const result = loginPage({ csrfToken: '"><script>alert(1)</script>' });
      expect(result).not.toContain('"><script>');
      expect(result).toContain('&quot;&gt;&lt;script&gt;');
    });
  });
});
