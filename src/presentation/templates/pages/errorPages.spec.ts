import { forbiddenPage, rateLimitPage } from './errorPages';

describe('forbiddenPage', () => {
  it('renders Forbidden heading', () => {
    const result = forbiddenPage();
    expect(result).toContain('<h1>Forbidden</h1>');
  });

  it('renders CSRF token message', () => {
    const result = forbiddenPage();
    expect(result).toContain('Invalid CSRF token.');
  });
});

describe('rateLimitPage', () => {
  it('renders Too Many Requests heading', () => {
    const result = rateLimitPage();
    expect(result).toContain('<h1>Too Many Requests</h1>');
  });

  it('renders retry message', () => {
    const result = rateLimitPage();
    expect(result).toContain('Please try again later.');
  });
});
