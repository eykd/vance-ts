import { User } from '../../domain/entities/User';
import { ConflictError } from '../../domain/errors/ConflictError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import { Email } from '../../domain/value-objects/Email';
import { UserId } from '../../domain/value-objects/UserId';
import { MockPasswordHasher } from '../../test-utils/mocks/MockPasswordHasher';
import { MockUserRepository } from '../../test-utils/mocks/MockUserRepository';

import { RegisterUseCase } from './RegisterUseCase';

const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = 'securePassword123!';
const FIXED_TIME = new Date('2025-06-15T10:30:00.000Z').getTime();
const FIXED_ISO = '2025-06-15T10:30:00.000Z';

/**
 * Creates fresh test dependencies for each test case.
 *
 * @returns The mock repositories, password hasher, time provider, and use case instance
 */
function createDeps(): {
  userRepository: MockUserRepository;
  passwordHasher: MockPasswordHasher;
  timeProvider: TimeProvider;
  useCase: RegisterUseCase;
} {
  const userRepository = new MockUserRepository();
  const passwordHasher = new MockPasswordHasher();
  const timeProvider: TimeProvider = { now: (): number => FIXED_TIME };
  const useCase = new RegisterUseCase(userRepository, passwordHasher, timeProvider);
  return { userRepository, passwordHasher, timeProvider, useCase };
}

describe('RegisterUseCase', () => {
  it('returns ok with userId on successful registration', async () => {
    const { useCase } = createDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.value.userId).toBe('string');
      expect(result.value.userId.length).toBeGreaterThan(0);
    }
  });

  it('returns ValidationError when passwords do not match', async () => {
    const { useCase } = createDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: 'differentPassword123!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe('Passwords do not match');
      expect((result.error as ValidationError).fields).toEqual({
        confirmPassword: ['Passwords do not match'],
      });
    }
  });

  it('returns ValidationError for empty email', async () => {
    const { useCase } = createDeps();

    const result = await useCase.execute({
      email: '',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('returns ValidationError for invalid email format', async () => {
    const { useCase } = createDeps();

    const result = await useCase.execute({
      email: 'not-an-email',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('returns ValidationError for password too short', async () => {
    const { useCase } = createDeps();
    const shortPassword = 'short';

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: shortPassword,
      confirmPassword: shortPassword,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('returns ValidationError for common password', async () => {
    const { useCase } = createDeps();
    const commonPassword = 'passwordpassword';

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: commonPassword,
      confirmPassword: commonPassword,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('returns ConflictError when email is already taken', async () => {
    const { useCase, userRepository } = createDeps();
    const email = Email.create(VALID_EMAIL);
    const userId = UserId.generate();
    const existingUser = User.create({
      id: userId,
      email,
      passwordHash: 'hashed:existing',
      now: FIXED_ISO,
    });
    userRepository.addUser(existingUser);

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ConflictError);
      expect(result.error.message).toBe('Email is already registered');
    }
  });

  it('saves user with correct email and password hash', async () => {
    const { useCase, userRepository } = createDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const savedUser = userRepository.getById(result.value.userId);
      expect(savedUser).toBeDefined();
      expect(savedUser?.email.normalizedValue).toBe(VALID_EMAIL);
      expect(savedUser?.passwordHash).toBe('hashed:' + VALID_PASSWORD);
    }
  });

  it('hashes the password using passwordHasher', async () => {
    const { useCase, passwordHasher } = createDeps();

    await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(passwordHasher.hashCalls).toEqual([VALID_PASSWORD]);
  });

  it('uses timestamps from TimeProvider', async () => {
    const { useCase, userRepository } = createDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const savedUser = userRepository.getById(result.value.userId);
      expect(savedUser?.createdAt).toBe(FIXED_ISO);
      expect(savedUser?.updatedAt).toBe(FIXED_ISO);
    }
  });

  it('generates unique UserIds for each registration', async () => {
    const { useCase } = createDeps();

    const result1 = await useCase.execute({
      email: 'user1@example.com',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    const result2 = await useCase.execute({
      email: 'user2@example.com',
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    if (result1.success && result2.success) {
      expect(result1.value.userId).not.toBe(result2.value.userId);
    }
  });

  it('checks password mismatch before email validation', async () => {
    const { useCase } = createDeps();

    const result = await useCase.execute({
      email: '',
      password: VALID_PASSWORD,
      confirmPassword: 'differentPassword123!',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValidationError);
      expect(result.error.message).toBe('Passwords do not match');
    }
  });
});
