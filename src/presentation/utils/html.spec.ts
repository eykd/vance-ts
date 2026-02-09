import { escapeHtml, html, safe } from './html';

describe('escapeHtml', () => {
  it('escapes ampersand', () => {
    expect(escapeHtml('a&b')).toBe('a&amp;b');
  });

  it('escapes less-than', () => {
    expect(escapeHtml('a<b')).toBe('a&lt;b');
  });

  it('escapes greater-than', () => {
    expect(escapeHtml('a>b')).toBe('a&gt;b');
  });

  it('escapes double quotes', () => {
    expect(escapeHtml('a"b')).toBe('a&quot;b');
  });

  it('escapes single quotes', () => {
    expect(escapeHtml("a'b")).toBe('a&#x27;b');
  });

  it('escapes multiple characters in one string', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('returns empty string for empty input', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('returns string unchanged when no special characters', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('html tagged template', () => {
  it('auto-escapes interpolated string values', () => {
    const userInput = '<script>alert("xss")</script>';
    const result = html`<div>${userInput}</div>`;
    expect(result).toBe('<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>');
  });

  it('does not double-escape static template parts', () => {
    const result = html`<div class="test">hello</div>`;
    expect(result).toBe('<div class="test">hello</div>');
  });

  it('handles multiple interpolations', () => {
    const name = "O'Brien";
    const role = '<admin>';
    const result = html`<span>${name}</span><span>${role}</span>`;
    expect(result).toBe('<span>O&#x27;Brien</span><span>&lt;admin&gt;</span>');
  });

  it('converts number interpolations to escaped strings', () => {
    const count = 42;
    const result = html`<span>${count}</span>`;
    expect(result).toBe('<span>42</span>');
  });

  it('handles template with no interpolations', () => {
    const result = html`<div>static</div>`;
    expect(result).toBe('<div>static</div>');
  });

  it('does not escape SafeHtml values', () => {
    const trustedHtml = safe('<strong>bold</strong>');
    const result = html`<div>${trustedHtml}</div>`;
    expect(result).toBe('<div><strong>bold</strong></div>');
  });

  it('mixes safe and unsafe interpolations', () => {
    const trusted = safe('<em>safe</em>');
    const untrusted = '<em>unsafe</em>';
    const result = html`${trusted} ${untrusted}`;
    expect(result).toBe('<em>safe</em> &lt;em&gt;unsafe&lt;/em&gt;');
  });
});
