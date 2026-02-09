import { loginPage } from './login';

describe('loginPage', () => {
  it('renders a login form with hx-post to /auth/login', () => {
    const result = loginPage({ csrfToken: 'abc123' });
    expect(result).toContain('hx-post="/auth/login"');
  });

  it('includes a hidden _csrf field with the token', () => {
    const token = 'a'.repeat(64);
    const result = loginPage({ csrfToken: token });
    expect(result).toContain(`value="${token}"`);
    expect(result).toContain('name="_csrf"');
  });

  it('escapes the CSRF token to prevent injection', () => {
    const result = loginPage({ csrfToken: '"><script>xss</script>' });
    expect(result).toContain('&quot;&gt;&lt;script&gt;');
    expect(result).not.toContain('<script>xss</script>');
  });

  it('renders email and password input fields', () => {
    const result = loginPage({ csrfToken: 'token' });
    expect(result).toContain('type="email"');
    expect(result).toContain('type="password"');
  });

  it('displays error alert when error is provided', () => {
    const result = loginPage({ csrfToken: 'token', error: 'Invalid credentials' });
    expect(result).toContain('Invalid credentials');
    expect(result).toContain('alert-error');
  });

  it('does not render error alert when no error', () => {
    const result = loginPage({ csrfToken: 'token' });
    expect(result).not.toContain('alert-error');
  });

  it('pre-fills email when provided', () => {
    const result = loginPage({ csrfToken: 'token', email: 'user@example.com' });
    expect(result).toContain('value="user@example.com"');
  });

  it('escapes pre-filled email to prevent XSS', () => {
    const result = loginPage({ csrfToken: 'token', email: '"><script>' });
    expect(result).toContain('&quot;&gt;&lt;script&gt;');
  });

  it('includes redirectTo as hidden field when provided', () => {
    const result = loginPage({ csrfToken: 'token', redirectTo: '/dashboard' });
    expect(result).toContain('name="redirectTo"');
    expect(result).toContain('value="/dashboard"');
  });

  it('does not include redirectTo field when not provided', () => {
    const result = loginPage({ csrfToken: 'token' });
    expect(result).not.toContain('name="redirectTo"');
  });

  it('includes a link to the register page', () => {
    const result = loginPage({ csrfToken: 'token' });
    expect(result).toContain('/auth/register');
  });

  it('wraps the form in the auth layout', () => {
    const result = loginPage({ csrfToken: 'token' });
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Login');
  });
});
