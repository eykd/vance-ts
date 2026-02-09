import type { AuthResult } from '../../application/dto/AuthResult';
import type { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import type { LogoutUseCase } from '../../application/use-cases/LogoutUseCase';
import type { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { ConflictError } from '../../domain/errors/ConflictError';
import { RateLimitError } from '../../domain/errors/RateLimitError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { Logger } from '../../domain/interfaces/Logger';
import type { RateLimitConfig, RateLimiter } from '../../domain/interfaces/RateLimiter';
import { err, ok } from '../../domain/types/Result';
import { CsrfToken } from '../../domain/value-objects/CsrfToken';
import { SessionId } from '../../domain/value-objects/SessionId';
import { UserId } from '../../domain/value-objects/UserId';

import { AuthHandlers } from './AuthHandlers';

/**
 * Creates a mock Logger with jest.fn() for all methods.
 *
 * @returns A mock Logger instance
 */
function createMockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    security: jest.fn(),
  };
}

/**
 * Creates a mock LoginUseCase.
 *
 * @returns A mocked LoginUseCase
 */
function createMockLoginUseCase(): jest.Mocked<LoginUseCase> {
  return { execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>;
}

/**
 * Creates a mock RegisterUseCase.
 *
 * @returns A mocked RegisterUseCase
 */
function createMockRegisterUseCase(): jest.Mocked<RegisterUseCase> {
  return { execute: jest.fn() } as unknown as jest.Mocked<RegisterUseCase>;
}

/**
 * Creates a mock LogoutUseCase.
 *
 * @returns A mocked LogoutUseCase
 */
function createMockLogoutUseCase(): jest.Mocked<LogoutUseCase> {
  return { execute: jest.fn() } as unknown as jest.Mocked<LogoutUseCase>;
}

/**
 * Creates a mock RateLimiter.
 *
 * @returns A mocked RateLimiter that allows all requests by default
 */
function createMockRateLimiter(): jest.Mocked<RateLimiter> {
  return {
    checkLimit: jest
      .fn()
      .mockResolvedValue({ allowed: true, remaining: 4, retryAfterSeconds: null }),
    reset: jest.fn().mockResolvedValue(undefined),
  };
}

/** Default dependencies for constructing AuthHandlers. */
interface TestDeps {
  loginUseCase: jest.Mocked<LoginUseCase>;
  registerUseCase: jest.Mocked<RegisterUseCase>;
  logoutUseCase: jest.Mocked<LogoutUseCase>;
  rateLimiter: jest.Mocked<RateLimiter>;
  logger: jest.Mocked<Logger>;
}

/**
 * Creates default test dependencies.
 *
 * @returns All mocked dependencies
 */
function createTestDeps(): TestDeps {
  return {
    loginUseCase: createMockLoginUseCase(),
    registerUseCase: createMockRegisterUseCase(),
    logoutUseCase: createMockLogoutUseCase(),
    rateLimiter: createMockRateLimiter(),
    logger: createMockLogger(),
  };
}

/**
 * Creates an AuthHandlers instance with default test dependencies.
 *
 * @param overrides - Optional dependency overrides
 * @returns The AuthHandlers instance and its dependencies
 */
function createHandlers(overrides?: Partial<TestDeps>): { handlers: AuthHandlers; deps: TestDeps } {
  const deps = { ...createTestDeps(), ...overrides };
  const handlers = new AuthHandlers(
    deps.loginUseCase,
    deps.registerUseCase,
    deps.logoutUseCase,
    deps.rateLimiter,
    deps.logger,
    TEST_LOGIN_RATE_LIMIT,
    TEST_REGISTER_RATE_LIMIT
  );
  return { handlers, deps };
}

/**
 * Builds a POST request with form data.
 *
 * @param url - The request URL
 * @param fields - Form field key-value pairs
 * @param headers - Optional additional headers
 * @returns A Request with form body
 */
function postRequest(
  url: string,
  fields: Record<string, string>,
  headers?: Record<string, string>
): Request {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return new Request(url, {
    method: 'POST',
    body: formData,
    headers: {
      'CF-Connecting-IP': '1.2.3.4',
      Cookie: '__Host-csrf=test-csrf-token',
      ...headers,
    },
  });
}

/** Test rate limit config for login. */
const TEST_LOGIN_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

/** Test rate limit config for registration. */
const TEST_REGISTER_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 300,
};

const MOCK_CSRF_TOKEN = 'a'.repeat(64);
const MOCK_SESSION_ID = '00000000-0000-4000-a000-000000000001';

describe('AuthHandlers', () => {
  describe('handleGetLogin', () => {
    it('returns 200 with login page HTML', () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/login');

      const response = handlers.handleGetLogin(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/html');
    });

    it('sets a CSRF cookie', () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/login');

      const response = handlers.handleGetLogin(request);
      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('__Host-csrf=');
    });

    it('includes security headers', () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/login');

      const response = handlers.handleGetLogin(request);
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('includes a CSRF token in the form', async () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/login');

      const response = handlers.handleGetLogin(request);
      const body = await response.text();
      expect(body).toContain('name="_csrf"');
    });

    it('preserves redirectTo query parameter', async () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/login?redirectTo=/dashboard');

      const response = handlers.handleGetLogin(request);
      const body = await response.text();
      expect(body).toContain('/dashboard');
    });
  });

  describe('handleGetRegister', () => {
    it('returns 200 with register page HTML', () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/register');

      const response = handlers.handleGetRegister(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/html');
    });

    it('sets a CSRF cookie', () => {
      const { handlers } = createHandlers();
      const request = new Request('https://example.com/auth/register');

      const response = handlers.handleGetRegister(request);
      const setCookie = response.headers.get('Set-Cookie');
      expect(setCookie).toContain('__Host-csrf=');
    });
  });

  describe('handlePostLogin', () => {
    it('redirects on successful login', async () => {
      const { handlers, deps } = createHandlers();
      const authResult: AuthResult = {
        userId: UserId.fromString(MOCK_SESSION_ID),
        sessionId: SessionId.fromString(MOCK_SESSION_ID),
        csrfToken: CsrfToken.fromString(MOCK_CSRF_TOKEN),
        redirectTo: '/',
      };
      deps.loginUseCase.execute.mockResolvedValue(ok(authResult));

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'test@example.com',
        password: 'validpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('/');
    });

    it('sets session and CSRF cookies on successful login', async () => {
      const { handlers, deps } = createHandlers();
      const authResult: AuthResult = {
        userId: UserId.fromString(MOCK_SESSION_ID),
        sessionId: SessionId.fromString(MOCK_SESSION_ID),
        csrfToken: CsrfToken.fromString(MOCK_CSRF_TOKEN),
        redirectTo: '/',
      };
      deps.loginUseCase.execute.mockResolvedValue(ok(authResult));

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'test@example.com',
        password: 'validpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      // Node.js Headers concatenates Set-Cookie with comma; check combined value
      const setCookie = response.headers.get('Set-Cookie') ?? '';
      expect(setCookie).toContain('__Host-session=');
      expect(setCookie).toContain('__Host-csrf=');
    });

    it('uses HTMX redirect for HTMX requests', async () => {
      const { handlers, deps } = createHandlers();
      const authResult: AuthResult = {
        userId: UserId.fromString(MOCK_SESSION_ID),
        sessionId: SessionId.fromString(MOCK_SESSION_ID),
        csrfToken: CsrfToken.fromString(MOCK_CSRF_TOKEN),
        redirectTo: '/dashboard',
      };
      deps.loginUseCase.execute.mockResolvedValue(ok(authResult));

      const request = postRequest(
        'https://example.com/auth/login',
        {
          _csrf: 'test-csrf-token',
          email: 'test@example.com',
          password: 'validpassword123',
        },
        { 'HX-Request': 'true' }
      );

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('HX-Redirect')).toBe('/dashboard');
    });

    it('returns 403 when CSRF token is missing', async () => {
      const { handlers } = createHandlers();
      const request = postRequest('https://example.com/auth/login', {
        email: 'test@example.com',
        password: 'validpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(403);
    });

    it('returns 429 when rate limited', async () => {
      const { handlers, deps } = createHandlers();
      deps.rateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 60,
      });

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'test@example.com',
        password: 'validpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('re-renders login page with error on UnauthorizedError', async () => {
      const { handlers, deps } = createHandlers();
      deps.loginUseCase.execute.mockResolvedValue(
        err(new UnauthorizedError('Invalid email or password'))
      );

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'test@example.com',
        password: 'wrongpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('alert-error');
      expect(body).toContain('Invalid email or password');
    });

    it('re-renders login page with error on ValidationError', async () => {
      const { handlers, deps } = createHandlers();
      deps.loginUseCase.execute.mockResolvedValue(err(new ValidationError('Invalid email')));

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'bad',
        password: 'validpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('alert-error');
    });

    it('returns 429 on RateLimitError from use case', async () => {
      const { handlers, deps } = createHandlers();
      deps.loginUseCase.execute.mockResolvedValue(
        err(new RateLimitError('Too many login attempts', 300))
      );

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'test@example.com',
        password: 'validpassword123',
      });

      const response = await handlers.handlePostLogin(request);
      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('300');
    });

    it('logs security event on failed login', async () => {
      const { handlers, deps } = createHandlers();
      deps.loginUseCase.execute.mockResolvedValue(
        err(new UnauthorizedError('Invalid email or password'))
      );

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
        email: 'test@example.com',
        password: 'wrongpassword123',
      });

      await handlers.handlePostLogin(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(deps.logger.security).toHaveBeenCalledWith(
        'login_failed',
        expect.objectContaining({ ip: '1.2.3.4' })
      );
    });

    it('defaults email and password to empty when missing from form', async () => {
      const { handlers, deps } = createHandlers();
      deps.loginUseCase.execute.mockResolvedValue(err(new ValidationError('Invalid input')));

      const request = postRequest('https://example.com/auth/login', {
        _csrf: 'test-csrf-token',
      });

      await handlers.handlePostLogin(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(deps.loginUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: '',
          password: '',
        })
      );
    });

    it('passes IP and user agent to use case', async () => {
      const { handlers, deps } = createHandlers();
      const authResult: AuthResult = {
        userId: UserId.fromString(MOCK_SESSION_ID),
        sessionId: SessionId.fromString(MOCK_SESSION_ID),
        csrfToken: CsrfToken.fromString(MOCK_CSRF_TOKEN),
        redirectTo: '/',
      };
      deps.loginUseCase.execute.mockResolvedValue(ok(authResult));

      const request = postRequest(
        'https://example.com/auth/login',
        {
          _csrf: 'test-csrf-token',
          email: 'test@example.com',
          password: 'validpassword123',
        },
        { 'User-Agent': 'TestBrowser/1.0' }
      );

      await handlers.handlePostLogin(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(deps.loginUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'validpassword123',
          ipAddress: '1.2.3.4',
          userAgent: 'TestBrowser/1.0',
        })
      );
    });
  });

  describe('handlePostRegister', () => {
    it('redirects to login with registered param on success', async () => {
      const { handlers, deps } = createHandlers();
      deps.registerUseCase.execute.mockResolvedValue(
        ok({ userId: UserId.fromString(MOCK_SESSION_ID) })
      );

      const request = postRequest('https://example.com/auth/register', {
        _csrf: 'test-csrf-token',
        email: 'new@example.com',
        password: 'validpassword123',
        confirmPassword: 'validpassword123',
      });

      const response = await handlers.handlePostRegister(request);
      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('/auth/login?registered=true');
    });

    it('returns 403 when CSRF token is missing', async () => {
      const { handlers } = createHandlers();
      const request = postRequest('https://example.com/auth/register', {
        email: 'new@example.com',
        password: 'validpassword123',
        confirmPassword: 'validpassword123',
      });

      const response = await handlers.handlePostRegister(request);
      expect(response.status).toBe(403);
    });

    it('returns 429 when rate limited', async () => {
      const { handlers, deps } = createHandlers();
      deps.rateLimiter.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        retryAfterSeconds: 120,
      });

      const request = postRequest('https://example.com/auth/register', {
        _csrf: 'test-csrf-token',
        email: 'new@example.com',
        password: 'validpassword123',
        confirmPassword: 'validpassword123',
      });

      const response = await handlers.handlePostRegister(request);
      expect(response.status).toBe(429);
    });

    it('re-renders register page with validation errors', async () => {
      const { handlers, deps } = createHandlers();
      deps.registerUseCase.execute.mockResolvedValue(
        err(
          new ValidationError('Password too short', {
            password: ['Password must be at least 12 characters'],
          })
        )
      );

      const request = postRequest('https://example.com/auth/register', {
        _csrf: 'test-csrf-token',
        email: 'new@example.com',
        password: 'short',
        confirmPassword: 'short',
      });

      const response = await handlers.handlePostRegister(request);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('Password must be at least 12 characters');
    });

    it('re-renders with generic message on ConflictError', async () => {
      const { handlers, deps } = createHandlers();
      deps.registerUseCase.execute.mockResolvedValue(
        err(new ConflictError('Email is already registered'))
      );

      const request = postRequest('https://example.com/auth/register', {
        _csrf: 'test-csrf-token',
        email: 'existing@example.com',
        password: 'validpassword123',
        confirmPassword: 'validpassword123',
      });

      const response = await handlers.handlePostRegister(request);
      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('alert-error');
      // Should NOT reveal that the email exists
      expect(body).not.toContain('already registered');
    });

    it('defaults fields to empty when missing from form', async () => {
      const { handlers, deps } = createHandlers();
      deps.registerUseCase.execute.mockResolvedValue(err(new ValidationError('Invalid input')));

      const request = postRequest('https://example.com/auth/register', {
        _csrf: 'test-csrf-token',
      });

      await handlers.handlePostRegister(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(deps.registerUseCase.execute).toHaveBeenCalledWith({
        email: '',
        password: '',
        confirmPassword: '',
      });
    });

    it('preserves email on validation error', async () => {
      const { handlers, deps } = createHandlers();
      deps.registerUseCase.execute.mockResolvedValue(
        err(new ValidationError('Passwords do not match'))
      );

      const request = postRequest('https://example.com/auth/register', {
        _csrf: 'test-csrf-token',
        email: 'keep@example.com',
        password: 'password123456',
        confirmPassword: 'different123456',
      });

      const response = await handlers.handlePostRegister(request);
      const body = await response.text();
      expect(body).toContain('keep@example.com');
    });
  });

  describe('handlePostLogout', () => {
    it('returns 403 when CSRF token is missing on logout', async () => {
      const { handlers } = createHandlers();

      const request = postRequest(
        'https://example.com/auth/logout',
        {},
        { Cookie: '__Host-session=some-session-id' }
      );

      const response = await handlers.handlePostLogout(request);
      expect(response.status).toBe(403);
    });

    it('clears session and CSRF cookies', async () => {
      const { handlers, deps } = createHandlers();
      deps.logoutUseCase.execute.mockResolvedValue(ok(undefined));

      const request = postRequest(
        'https://example.com/auth/logout',
        {
          _csrf: 'test-csrf-token',
        },
        { Cookie: '__Host-session=some-session-id; __Host-csrf=test-csrf-token' }
      );

      const response = await handlers.handlePostLogout(request);
      const setCookie = response.headers.get('Set-Cookie') ?? '';
      expect(setCookie).toContain('__Host-session=;');
      expect(setCookie).toContain('__Host-csrf=;');
    });

    it('redirects to login page', async () => {
      const { handlers, deps } = createHandlers();
      deps.logoutUseCase.execute.mockResolvedValue(ok(undefined));

      const request = postRequest(
        'https://example.com/auth/logout',
        {
          _csrf: 'test-csrf-token',
        },
        { Cookie: '__Host-session=some-session-id; __Host-csrf=test-csrf-token' }
      );

      const response = await handlers.handlePostLogout(request);
      expect(response.status).toBe(303);
      expect(response.headers.get('Location')).toBe('/auth/login');
    });

    it('succeeds even without a session cookie', async () => {
      const { handlers, deps } = createHandlers();
      deps.logoutUseCase.execute.mockResolvedValue(ok(undefined));

      const request = postRequest('https://example.com/auth/logout', {
        _csrf: 'test-csrf-token',
      });

      const response = await handlers.handlePostLogout(request);
      expect(response.status).toBe(303);
    });

    it('calls logout use case with session ID', async () => {
      const { handlers, deps } = createHandlers();
      deps.logoutUseCase.execute.mockResolvedValue(ok(undefined));

      const request = postRequest(
        'https://example.com/auth/logout',
        {
          _csrf: 'test-csrf-token',
        },
        { Cookie: '__Host-session=my-session-id; __Host-csrf=test-csrf-token' }
      );

      await handlers.handlePostLogout(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(deps.logoutUseCase.execute).toHaveBeenCalledWith('my-session-id');
    });

    it('calls logout use case with empty string when no cookie', async () => {
      const { handlers, deps } = createHandlers();
      deps.logoutUseCase.execute.mockResolvedValue(ok(undefined));

      const request = postRequest('https://example.com/auth/logout', {
        _csrf: 'test-csrf-token',
      });

      await handlers.handlePostLogout(request);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(deps.logoutUseCase.execute).toHaveBeenCalledWith('');
    });
  });
});
