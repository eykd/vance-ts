import { DomainError } from './DomainError';
import { RateLimitError } from './RateLimitError';

describe('RateLimitError', () => {
  it('creates an error with the correct name', () => {
    const error = new RateLimitError('Too many requests', 60);

    expect(error.name).toBe('RateLimitError');
  });

  it('creates an error with the correct message', () => {
    const error = new RateLimitError('Too many requests', 60);

    expect(error.message).toBe('Too many requests');
  });

  it('has the correct error code', () => {
    const error = new RateLimitError('Too many requests', 60);

    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('stores the retry-after duration', () => {
    const error = new RateLimitError('Too many requests', 120);

    expect(error.retryAfter).toBe(120);
  });

  it('is an instance of DomainError', () => {
    const error = new RateLimitError('Too many requests', 60);

    expect(error).toBeInstanceOf(DomainError);
  });

  it('maintains correct prototype chain', () => {
    const error = new RateLimitError('Too many requests', 60);

    expect(Object.getPrototypeOf(error)).toBe(RateLimitError.prototype);
  });

  it('throws if retryAfter is zero', () => {
    expect(() => new RateLimitError('Too many requests', 0)).toThrow(
      'retryAfter must be a positive finite number'
    );
  });

  it('throws if retryAfter is negative', () => {
    expect(() => new RateLimitError('Too many requests', -1)).toThrow(
      'retryAfter must be a positive finite number'
    );
  });

  it('throws if retryAfter is NaN', () => {
    expect(() => new RateLimitError('Too many requests', NaN)).toThrow(
      'retryAfter must be a positive finite number'
    );
  });

  it('throws if retryAfter is Infinity', () => {
    expect(() => new RateLimitError('Too many requests', Infinity)).toThrow(
      'retryAfter must be a positive finite number'
    );
  });
});
