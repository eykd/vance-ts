import { errorAlert, fieldErrors } from './errorAlert';

describe('errorAlert', () => {
  it('renders a DaisyUI alert with role="alert"', () => {
    const result = errorAlert('Something went wrong');
    expect(result).toContain('role="alert"');
    expect(result).toContain('Something went wrong');
  });

  it('escapes HTML in the message to prevent XSS', () => {
    const result = errorAlert('<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });

  it('includes alert-error class', () => {
    const result = errorAlert('Error');
    expect(result).toContain('alert-error');
  });
});

describe('fieldErrors', () => {
  it('renders a list of field errors', () => {
    const errors = ['Email is required', 'Email format is invalid'];
    const result = fieldErrors(errors);
    expect(result).toContain('Email is required');
    expect(result).toContain('Email format is invalid');
  });

  it('escapes HTML in error messages', () => {
    const errors = ['<b>bad</b>'];
    const result = fieldErrors(errors);
    expect(result).toContain('&lt;b&gt;bad&lt;/b&gt;');
    expect(result).not.toContain('<b>bad</b>');
  });

  it('returns empty string for empty array', () => {
    expect(fieldErrors([])).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(fieldErrors(undefined)).toBe('');
  });

  it('renders list items for each error', () => {
    const errors = ['Error 1', 'Error 2'];
    const result = fieldErrors(errors);
    expect(result).toContain('<li');
    expect((result.match(/<li/g) ?? []).length).toBe(2);
  });
});
