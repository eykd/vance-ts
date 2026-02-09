import { registerPage } from './register';

describe('registerPage', () => {
  it('renders a register form with hx-post to /auth/register', () => {
    const result = registerPage({ csrfToken: 'abc123' });
    expect(result).toContain('hx-post="/auth/register"');
  });

  it('includes a hidden _csrf field with the token', () => {
    const token = 'b'.repeat(64);
    const result = registerPage({ csrfToken: token });
    expect(result).toContain(`value="${token}"`);
    expect(result).toContain('name="_csrf"');
  });

  it('escapes the CSRF token to prevent injection', () => {
    const result = registerPage({ csrfToken: '"><script>xss</script>' });
    expect(result).toContain('&quot;&gt;&lt;script&gt;');
    expect(result).not.toContain('<script>xss</script>');
  });

  it('renders email, password, and confirm password fields', () => {
    const result = registerPage({ csrfToken: 'token' });
    expect(result).toContain('type="email"');
    expect(result).toContain('name="password"');
    expect(result).toContain('name="confirmPassword"');
  });

  it('displays error alert when error is provided', () => {
    const result = registerPage({ csrfToken: 'token', error: 'Registration failed' });
    expect(result).toContain('Registration failed');
    expect(result).toContain('alert-error');
  });

  it('does not render error alert when no error', () => {
    const result = registerPage({ csrfToken: 'token' });
    expect(result).not.toContain('alert-error');
  });

  it('pre-fills email when provided', () => {
    const result = registerPage({ csrfToken: 'token', email: 'user@example.com' });
    expect(result).toContain('value="user@example.com"');
  });

  it('escapes pre-filled email to prevent XSS', () => {
    const result = registerPage({ csrfToken: 'token', email: '"><script>' });
    expect(result).toContain('&quot;&gt;&lt;script&gt;');
  });

  it('renders field errors when provided', () => {
    const result = registerPage({
      csrfToken: 'token',
      fieldErrors: { email: ['Invalid email format'] },
    });
    expect(result).toContain('Invalid email format');
  });

  it('renders password field errors', () => {
    const result = registerPage({
      csrfToken: 'token',
      fieldErrors: { password: ['Password too short'] },
    });
    expect(result).toContain('Password too short');
  });

  it('renders confirmPassword field errors', () => {
    const result = registerPage({
      csrfToken: 'token',
      fieldErrors: { confirmPassword: ['Passwords do not match'] },
    });
    expect(result).toContain('Passwords do not match');
  });

  it('does not render field errors when fieldErrors is undefined', () => {
    const result = registerPage({ csrfToken: 'token' });
    expect(result).not.toContain('text-error');
  });

  it('includes a link to the login page', () => {
    const result = registerPage({ csrfToken: 'token' });
    expect(result).toContain('/auth/login');
  });

  it('wraps the form in the auth layout', () => {
    const result = registerPage({ csrfToken: 'token' });
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Register');
  });

  it('both password fields have minlength attribute', () => {
    const result = registerPage({ csrfToken: 'token' });
    const passwordMatch = result.match(/id="password"[^>]*minlength="12"/);
    const confirmMatch = result.match(/id="confirmPassword"[^>]*minlength="12"/);
    expect(passwordMatch).not.toBeNull();
    expect(confirmMatch).not.toBeNull();
  });
});
