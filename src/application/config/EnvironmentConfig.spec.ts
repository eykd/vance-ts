import { DEFAULT_COOKIE_OPTIONS, DEV_COOKIE_OPTIONS } from '../../domain/types/CookieOptions';

import { createAppConfig } from './EnvironmentConfig';

describe('createAppConfig', () => {
  describe('development environment', () => {
    it('returns dev cookie options for development', () => {
      const config = createAppConfig('development');
      expect(config.cookie).toEqual(DEV_COOKIE_OPTIONS);
    });

    it('sets isDevelopment to true', () => {
      const config = createAppConfig('development');
      expect(config.isDevelopment).toBe(true);
    });

    it('uses relaxed login rate limits', () => {
      const config = createAppConfig('development');
      expect(config.loginRateLimit.maxRequests).toBe(20);
      expect(config.loginRateLimit.windowSeconds).toBe(60);
    });

    it('uses relaxed register rate limits', () => {
      const config = createAppConfig('development');
      expect(config.registerRateLimit.maxRequests).toBe(10);
      expect(config.registerRateLimit.windowSeconds).toBe(300);
    });
  });

  describe('production environment', () => {
    it('returns production cookie options for production', () => {
      const config = createAppConfig('production');
      expect(config.cookie).toEqual(DEFAULT_COOKIE_OPTIONS);
    });

    it('sets isDevelopment to false', () => {
      const config = createAppConfig('production');
      expect(config.isDevelopment).toBe(false);
    });

    it('uses strict login rate limits', () => {
      const config = createAppConfig('production');
      expect(config.loginRateLimit.maxRequests).toBe(10);
      expect(config.loginRateLimit.windowSeconds).toBe(60);
    });

    it('uses strict register rate limits', () => {
      const config = createAppConfig('production');
      expect(config.registerRateLimit.maxRequests).toBe(5);
      expect(config.registerRateLimit.windowSeconds).toBe(300);
    });
  });

  describe('edge cases', () => {
    it('defaults to production for empty string', () => {
      const config = createAppConfig('');
      expect(config.cookie).toEqual(DEFAULT_COOKIE_OPTIONS);
      expect(config.isDevelopment).toBe(false);
    });

    it('defaults to production for unknown environment', () => {
      const config = createAppConfig('staging');
      expect(config.cookie).toEqual(DEFAULT_COOKIE_OPTIONS);
      expect(config.isDevelopment).toBe(false);
    });

    it('is case-sensitive (Development is production)', () => {
      const config = createAppConfig('Development');
      expect(config.cookie).toEqual(DEFAULT_COOKIE_OPTIONS);
      expect(config.isDevelopment).toBe(false);
    });

    it('treats any non-allowlisted value as production', () => {
      const values = ['staging', 'PRODUCTION', 'dev', ''];
      for (const value of values) {
        const config = createAppConfig(value);
        expect(config.isDevelopment).toBe(false);
        expect(config.loginRateLimit.maxRequests).toBe(10);
      }
    });
  });
});
