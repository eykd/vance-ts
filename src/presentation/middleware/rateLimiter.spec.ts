import type { Logger } from '../../domain/interfaces/Logger';
import type { RateLimitConfig, RateLimiter } from '../../domain/interfaces/RateLimiter';

import { checkRateLimit } from './rateLimiter';

/**
 * Creates a mock Logger with jest.fn() for all methods.
 *
 * @returns A mock Logger instance
 */
function createMockLogger(): Logger {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    security: jest.fn(),
  };
}

/**
 * Creates a mock RateLimiter that returns the given result.
 *
 * @param result - The rate limit check result
 * @param result.allowed - Whether the request is allowed
 * @param result.remaining - Remaining requests in the window
 * @param result.retryAfterSeconds - Seconds until retry, or null
 * @returns A mock RateLimiter instance
 */
function createMockRateLimiter(result: {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number | null;
}): RateLimiter {
  return {
    checkLimit: jest.fn().mockResolvedValue(result),
    reset: jest.fn().mockResolvedValue(undefined),
  };
}

const config: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};

describe('checkRateLimit', () => {
  it('returns null when request is allowed', async () => {
    const limiter = createMockRateLimiter({ allowed: true, remaining: 4, retryAfterSeconds: null });
    const logger = createMockLogger();
    const request = new Request('https://example.com', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' },
    });

    const result = await checkRateLimit(request, { rateLimiter: limiter, logger }, config);
    expect(result).toBeNull();
  });

  it('returns 429 Response when rate limit exceeded', async () => {
    const limiter = createMockRateLimiter({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
    const logger = createMockLogger();
    const request = new Request('https://example.com', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' },
    });

    const result = await checkRateLimit(request, { rateLimiter: limiter, logger }, config);
    expect(result).not.toBeNull();
    expect(result?.status).toBe(429);
    expect(result?.headers.get('Retry-After')).toBe('60');
  });

  it('uses default Retry-After when retryAfterSeconds is null', async () => {
    const limiter = createMockRateLimiter({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: null,
    });
    const logger = createMockLogger();
    const request = new Request('https://example.com', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' },
    });

    const result = await checkRateLimit(request, { rateLimiter: limiter, logger }, config);
    expect(result).not.toBeNull();
    expect(result?.headers.get('Retry-After')).toBe('60');
  });

  it('logs security event when rate limit is exceeded', async () => {
    const limiter = createMockRateLimiter({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 30,
    });
    const logger = createMockLogger();
    const request = new Request('https://example.com', {
      headers: { 'CF-Connecting-IP': '5.6.7.8' },
    });

    await checkRateLimit(request, { rateLimiter: limiter, logger }, config);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(logger.security).toHaveBeenCalledWith(
      'rate_limit_exceeded',
      expect.objectContaining({ ip: '5.6.7.8' })
    );
  });

  it('extracts client IP and passes it to rate limiter', async () => {
    const limiter = createMockRateLimiter({ allowed: true, remaining: 3, retryAfterSeconds: null });
    const logger = createMockLogger();
    const request = new Request('https://example.com', {
      headers: { 'CF-Connecting-IP': '10.0.0.1' },
    });

    await checkRateLimit(request, { rateLimiter: limiter, logger }, config);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(limiter.checkLimit).toHaveBeenCalledWith('10.0.0.1', expect.any(String), config);
  });

  it('returns response with security headers', async () => {
    const limiter = createMockRateLimiter({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
    const logger = createMockLogger();
    const request = new Request('https://example.com', {
      headers: { 'CF-Connecting-IP': '1.2.3.4' },
    });

    const result = await checkRateLimit(request, { rateLimiter: limiter, logger }, config);
    expect(result?.headers.get('Content-Type')).toContain('text/html');
    expect(result?.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('passes action name to rate limiter', async () => {
    const limiter = createMockRateLimiter({ allowed: true, remaining: 3, retryAfterSeconds: null });
    const logger = createMockLogger();
    const request = new Request('https://example.com/auth/login', {
      headers: { 'CF-Connecting-IP': '10.0.0.1' },
    });

    await checkRateLimit(request, { rateLimiter: limiter, logger }, config, 'login');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(limiter.checkLimit).toHaveBeenCalledWith('10.0.0.1', 'login', config);
  });
});
