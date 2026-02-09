import type { RateLimitConfig } from '../domain/interfaces/RateLimiter';
import type { CookieOptions } from '../types/CookieOptions';
import { DEFAULT_COOKIE_OPTIONS, DEV_COOKIE_OPTIONS } from '../types/CookieOptions';

/**
 * Application-wide configuration derived from the runtime environment.
 */
export interface AppConfig {
  /** Cookie naming and security settings. */
  readonly cookie: CookieOptions;

  /** Whether the application is running in development mode. */
  readonly isDevelopment: boolean;

  /** Rate limit configuration for login attempts. */
  readonly loginRateLimit: RateLimitConfig;

  /** Rate limit configuration for registration attempts. */
  readonly registerRateLimit: RateLimitConfig;
}

/** Valid runtime environment names. */
type ValidEnvironment = 'development' | 'production';

/** Set of recognized environment values. */
const VALID_ENVIRONMENTS: ReadonlySet<string> = new Set<string>([
  'development',
  'production',
] satisfies ValidEnvironment[]);

/**
 * Creates an AppConfig based on the runtime environment name.
 *
 * Valid environment values are 'development' and 'production'.
 * Unknown values (including empty strings) safely default to production settings.
 *
 * @param environment - Runtime environment name ('development' or 'production')
 * @returns The application configuration
 */
export function createAppConfig(environment: string): AppConfig {
  const isValid = VALID_ENVIRONMENTS.has(environment);
  const isDevelopment = isValid && environment === 'development';

  if (isDevelopment) {
    return {
      cookie: DEV_COOKIE_OPTIONS,
      isDevelopment: true,
      loginRateLimit: {
        maxRequests: 20,
        windowSeconds: 60,
      },
      registerRateLimit: {
        maxRequests: 10,
        windowSeconds: 300,
      },
    };
  }

  return {
    cookie: DEFAULT_COOKIE_OPTIONS,
    isDevelopment: false,
    loginRateLimit: {
      maxRequests: 10,
      windowSeconds: 60,
    },
    registerRateLimit: {
      maxRequests: 5,
      windowSeconds: 300,
    },
  };
}
