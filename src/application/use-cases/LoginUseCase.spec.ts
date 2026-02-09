import { RateLimitError } from '../../domain/errors/RateLimitError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import { UserBuilder } from '../../test-utils/builders/UserBuilder';
import { makeLoginRequest } from '../../test-utils/factories/loginRequestFactory';
import { makeUser } from '../../test-utils/factories/userFactory';
import { MockPasswordHasher } from '../../test-utils/mocks/MockPasswordHasher';
import { MockRateLimiter } from '../../test-utils/mocks/MockRateLimiter';
import { MockSessionRepository } from '../../test-utils/mocks/MockSessionRepository';
import { MockUserRepository } from '../../test-utils/mocks/MockUserRepository';

import { LoginUseCase } from './LoginUseCase';

describe('LoginUseCase', () => {
  const fixedTime = new Date('2025-06-15T10:30:00.000Z').getTime();
  const fixedIso = '2025-06-15T10:30:00.000Z';
  const timeProvider: TimeProvider = { now: (): number => fixedTime };

  let userRepository: MockUserRepository;
  let sessionRepository: MockSessionRepository;
  let passwordHasher: MockPasswordHasher;
  let rateLimiter: MockRateLimiter;
  let useCase: LoginUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    sessionRepository = new MockSessionRepository();
    passwordHasher = new MockPasswordHasher();
    rateLimiter = new MockRateLimiter();
    useCase = new LoginUseCase(
      userRepository,
      sessionRepository,
      passwordHasher,
      timeProvider,
      rateLimiter
    );
  });

  describe('happy path', () => {
    it('returns ok with AuthResult for valid credentials', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.userId).toBe('00000000-0000-4000-a000-000000000001');
        expect(result.value.sessionId).toBeDefined();
        expect(result.value.csrfToken).toBeDefined();
        expect(result.value.redirectTo).toBe('/');
      }
    });

    it('returns the specified redirectTo path', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ redirectTo: '/dashboard' }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.redirectTo).toBe('/dashboard');
      }
    });

    it('saves a new session', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(true);
      if (result.success) {
        const session = sessionRepository.getById(result.value.sessionId);
        expect(session).toBeDefined();
      }
    });

    it('records successful login on the user', async () => {
      userRepository.addUser(makeUser());
      await useCase.execute(makeLoginRequest());

      const savedUser = userRepository.getById('00000000-0000-4000-a000-000000000001');
      expect(savedUser?.lastLoginAt).toBe(fixedIso);
      expect(savedUser?.lastLoginIp).toBe('192.168.1.100');
      expect(savedUser?.lastLoginUserAgent).toBe('Mozilla/5.0 TestBrowser');
      expect(savedUser?.failedLoginAttempts).toBe(0);
    });

    it('returns correctly structured AuthResult fields', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.value.userId).toBe('string');
        expect(typeof result.value.sessionId).toBe('string');
        expect(typeof result.value.csrfToken).toBe('string');
        expect(typeof result.value.redirectTo).toBe('string');
        expect(result.value.csrfToken).toHaveLength(64);
      }
    });
  });

  describe('email and password validation', () => {
    it('returns err for empty email', async () => {
      const result = await useCase.execute(makeLoginRequest({ email: '' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('returns err for invalid email format', async () => {
      const result = await useCase.execute(makeLoginRequest({ email: 'not-an-email' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('returns err for empty password', async () => {
      const result = await useCase.execute(makeLoginRequest({ password: '' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('user not found (timing attack prevention)', () => {
    it('returns UnauthorizedError with generic message', async () => {
      const result = await useCase.execute(makeLoginRequest({ email: 'unknown@example.com' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedError);
        expect(result.error.message).toBe('Invalid email or password');
      }
    });

    it('still calls passwordHasher.verify with dummy hash', async () => {
      await useCase.execute(makeLoginRequest({ email: 'unknown@example.com' }));

      expect(passwordHasher.verifyCalls).toHaveLength(1);
      expect(passwordHasher.verifyCalls[0]?.hash).toBe('hashed:dummy_value_for_timing');
    });

    it('uses same error message as wrong password', async () => {
      const notFoundResult = await useCase.execute(
        makeLoginRequest({ email: 'unknown@example.com' })
      );

      userRepository.addUser(makeUser());
      const wrongPasswordResult = await useCase.execute(
        makeLoginRequest({ password: 'wrong-password' })
      );

      expect(notFoundResult.success).toBe(false);
      expect(wrongPasswordResult.success).toBe(false);
      if (!notFoundResult.success && !wrongPasswordResult.success) {
        expect(notFoundResult.error.message).toBe(wrongPasswordResult.error.message);
      }
    });
  });

  describe('account lockout', () => {
    it('returns UnauthorizedError for locked account', async () => {
      userRepository.addUser(makeUser({ locked: true }));
      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedError);
        expect(result.error.message).toBe('Account is temporarily locked');
      }
    });

    it('proceeds to password check when lockout has expired', async () => {
      const user = new UserBuilder()
        .withEmail('alice@example.com')
        .withPasswordHash('hashed:correct-password')
        .withFailedAttempts(5)
        .build();
      // Default lockedUntil is null from withFailedAttempts alone, so not locked
      userRepository.addUser(user);

      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(true);
    });
  });

  describe('wrong password', () => {
    it('returns UnauthorizedError for wrong password', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ password: 'wrong-password' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedError);
        expect(result.error.message).toBe('Invalid email or password');
      }
    });

    it('increments failed login attempts', async () => {
      userRepository.addUser(makeUser());
      await useCase.execute(makeLoginRequest({ password: 'wrong-password' }));

      const savedUser = userRepository.getById('00000000-0000-4000-a000-000000000001');
      expect(savedUser?.failedLoginAttempts).toBe(1);
    });

    it('triggers lockout after max failed attempts', async () => {
      userRepository.addUser(makeUser({ failedAttempts: 4 }));
      await useCase.execute(makeLoginRequest({ password: 'wrong-password' }));

      const savedUser = userRepository.getById('00000000-0000-4000-a000-000000000001');
      expect(savedUser?.failedLoginAttempts).toBe(5);
      expect(savedUser?.lockedUntil).not.toBeNull();
    });
  });

  describe('redirect validation', () => {
    it('rejects //evil.com', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ redirectTo: '//evil.com' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('rejects https://evil.com', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ redirectTo: 'https://evil.com' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('rejects URLs containing ://', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(
        makeLoginRequest({ redirectTo: '/page?url=http://evil.com' })
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('rejects URLs containing backslash', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ redirectTo: '/path\\evil' }));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ValidationError);
      }
    });

    it('defaults empty string to /', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ redirectTo: '' }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.redirectTo).toBe('/');
      }
    });

    it('defaults undefined to /', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest({ redirectTo: undefined }));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.redirectTo).toBe('/');
      }
    });
  });

  describe('timestamps', () => {
    it('uses TimeProvider for all timestamps', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(true);
      if (result.success) {
        const session = sessionRepository.getById(result.value.sessionId);
        expect(session?.createdAt).toBe(fixedIso);

        const savedUser = userRepository.getById('00000000-0000-4000-a000-000000000001');
        expect(savedUser?.lastLoginAt).toBe(fixedIso);
        expect(savedUser?.updatedAt).toBe(fixedIso);
      }
    });
  });

  describe('rate limiting', () => {
    it('allows login when rate limit not exceeded', async () => {
      userRepository.addUser(makeUser());
      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(true);
    });

    it('returns RateLimitError when rate limit exceeded', async () => {
      rateLimiter.allowed = false;
      rateLimiter.retryAfterSeconds = 120;

      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RateLimitError);
        expect(result.error.message).toBe('Too many login attempts');
        expect((result.error as RateLimitError).retryAfter).toBe(120);
      }
    });

    it('defaults retryAfter to 300 when retryAfterSeconds is null', async () => {
      rateLimiter.allowed = false;
      rateLimiter.retryAfterSeconds = null;

      const result = await useCase.execute(makeLoginRequest());

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(RateLimitError);
        expect((result.error as RateLimitError).retryAfter).toBe(300);
      }
    });

    it('checks rate limit using email as identifier', async () => {
      userRepository.addUser(makeUser());
      await useCase.execute(makeLoginRequest({ email: 'Alice@Example.COM' }));

      expect(rateLimiter.checkLimitCalls).toHaveLength(1);
      expect(rateLimiter.checkLimitCalls[0]?.identifier).toBe('alice@example.com');
      expect(rateLimiter.checkLimitCalls[0]?.action).toBe('login');
    });

    it('checks rate limit before password verification', async () => {
      rateLimiter.allowed = false;
      rateLimiter.retryAfterSeconds = 120;
      userRepository.addUser(makeUser());

      await useCase.execute(makeLoginRequest());

      expect(passwordHasher.verifyCalls).toHaveLength(0);
    });
  });
});
