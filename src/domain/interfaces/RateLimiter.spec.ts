import type { RateLimitConfig, RateLimitResult, RateLimiter } from './RateLimiter';

describe('RateLimiter interface', () => {
  it('satisfies the type contract with a mock implementation', async () => {
    const config: RateLimitConfig = {
      maxRequests: 5,
      windowSeconds: 60,
      blockDurationSeconds: 300,
    };

    const result: RateLimitResult = {
      allowed: true,
      remaining: 4,
      retryAfterSeconds: null,
    };

    const checkLimitMock = jest
      .fn<Promise<RateLimitResult>, [string, string, RateLimitConfig]>()
      .mockResolvedValue(result);
    const resetMock = jest.fn<Promise<void>, [string, string]>().mockResolvedValue(undefined);

    const limiter: RateLimiter = {
      checkLimit: checkLimitMock,
      reset: resetMock,
    };

    const checkResult = await limiter.checkLimit('127.0.0.1', 'login', config);
    expect(checkResult.allowed).toBe(true);
    expect(checkResult.remaining).toBe(4);
    expect(checkResult.retryAfterSeconds).toBeNull();

    await limiter.reset('127.0.0.1', 'login');
    expect(resetMock).toHaveBeenCalledWith('127.0.0.1', 'login');
  });

  it('allows config without blockDurationSeconds', () => {
    const config: RateLimitConfig = {
      maxRequests: 10,
      windowSeconds: 120,
    };

    expect(config.blockDurationSeconds).toBeUndefined();
  });
});
