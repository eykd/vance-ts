import { authLayout } from './authLayout';

describe('authLayout', () => {
  it('renders a full HTML document with DOCTYPE', () => {
    const result = authLayout({ title: 'Login', content: '<p>form</p>' });
    expect(result).toContain('<!DOCTYPE html>');
  });

  it('includes the page title in the head', () => {
    const result = authLayout({ title: 'Register', content: '' });
    expect(result).toContain('<title>Register</title>');
  });

  it('escapes the title to prevent XSS', () => {
    const result = authLayout({ title: '<script>xss</script>', content: '' });
    expect(result).toContain('&lt;script&gt;xss&lt;/script&gt;');
    expect(result).not.toContain('<title><script>');
  });

  it('includes the content in the body', () => {
    const result = authLayout({ title: 'Test', content: '<form>test form</form>' });
    expect(result).toContain('<form>test form</form>');
  });

  it('includes DaisyUI/Tailwind CSS CDN link', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('tailwindcss');
  });

  it('includes HTMX script', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('htmx');
  });

  it('includes Alpine.js script', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('alpinejs');
  });

  it('sets UTF-8 charset', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('charset="utf-8"');
  });

  it('includes viewport meta tag', () => {
    const result = authLayout({ title: 'Test', content: '' });
    expect(result).toContain('viewport');
  });

  it('renders content inside a centered card layout', () => {
    const result = authLayout({ title: 'Test', content: '<p>inner</p>' });
    expect(result).toContain('card');
    expect(result).toContain('<p>inner</p>');
  });
});
