import { parseFormBody, getFormField } from './parseFormBody';

describe('parseFormBody', () => {
  it('parses form data into a Map of string values', async () => {
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'secret123');

    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData,
    });

    const result = await parseFormBody(request);
    expect(result.get('email')).toBe('test@example.com');
    expect(result.get('password')).toBe('secret123');
  });

  it('ignores File entries', async () => {
    const formData = new FormData();
    formData.append('name', 'test');
    formData.append('file', new Blob(['content']), 'test.txt');

    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData,
    });

    const result = await parseFormBody(request);
    expect(result.get('name')).toBe('test');
    expect(result.has('file')).toBe(false);
  });

  it('returns empty Map for empty form data', async () => {
    const formData = new FormData();
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData,
    });

    const result = await parseFormBody(request);
    expect(result.size).toBe(0);
  });
});

describe('getFormField', () => {
  it('returns the value for an existing field', () => {
    const form = new Map<string, string>();
    form.set('email', 'test@example.com');
    expect(getFormField(form, 'email')).toBe('test@example.com');
  });

  it('returns null for a missing field', () => {
    const form = new Map<string, string>();
    expect(getFormField(form, 'missing')).toBeNull();
  });

  it('returns null for an empty string value', () => {
    const form = new Map<string, string>();
    form.set('email', '');
    expect(getFormField(form, 'email')).toBeNull();
  });
});
