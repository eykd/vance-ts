import { User } from '../../domain/entities/User';
import { ConflictError } from '../../domain/errors/ConflictError';
import { ValidationError } from '../../domain/errors/ValidationError';
import { Email } from '../../domain/value-objects/Email';
import { UserId } from '../../domain/value-objects/UserId';
import { createRegisterUseCaseDeps } from '../../test-utils/factories/registerUseCaseDepsFactory';

const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = 'securePassword123!';
const FIXED_ISO = '2025-06-15T10:30:00.000Z';

describe('RegisterUseCase', () => {
  it('returns ok with userId on successful registration', async () => {
    const { useCase } = createRegisterUseCaseDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.userId.toString()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    }
  });

  it('returns ValidationError when passwords do not match', async () => {
    const { useCase } = createRegisterUseCaseDeps();

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
    const { useCase } = createRegisterUseCaseDeps();

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
    const { useCase } = createRegisterUseCaseDeps();

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
    const { useCase } = createRegisterUseCaseDeps();
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
    const { useCase } = createRegisterUseCaseDeps();
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
    const { useCase, userRepository } = createRegisterUseCaseDeps();
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
    const { useCase, userRepository } = createRegisterUseCaseDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const savedUser = userRepository.getById(result.value.userId.toString());
      expect(savedUser).toBeDefined();
      expect(savedUser?.email.normalizedValue).toBe(VALID_EMAIL);
      expect(savedUser?.passwordHash).toBe('hashed:' + VALID_PASSWORD);
    }
  });

  it('hashes the password using passwordHasher', async () => {
    const { useCase, passwordHasher } = createRegisterUseCaseDeps();

    await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(passwordHasher.hashCalls).toEqual([VALID_PASSWORD]);
  });

  it('uses timestamps from TimeProvider', async () => {
    const { useCase, userRepository } = createRegisterUseCaseDeps();

    const result = await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      const savedUser = userRepository.getById(result.value.userId.toString());
      expect(savedUser?.createdAt).toBe(FIXED_ISO);
      expect(savedUser?.updatedAt).toBe(FIXED_ISO);
    }
  });

  it('generates unique UserIds for each registration', async () => {
    const { useCase } = createRegisterUseCaseDeps();

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
      expect(result1.value.userId.toString()).not.toBe(result2.value.userId.toString());
    }
  });

  it('performs password hash even when email is already taken (timing attack prevention)', async () => {
    const { useCase, userRepository, passwordHasher } = createRegisterUseCaseDeps();
    const email = Email.create(VALID_EMAIL);
    const userId = UserId.generate();
    const existingUser = User.create({
      id: userId,
      email,
      passwordHash: 'hashed:existing',
      now: FIXED_ISO,
    });
    userRepository.addUser(existingUser);

    await useCase.execute({
      email: VALID_EMAIL,
      password: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });

    expect(passwordHasher.hashCalls).toEqual([VALID_PASSWORD]);
  });

  it('checks password mismatch before email validation', async () => {
    const { useCase } = createRegisterUseCaseDeps();

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

  it('returns ConflictError when save fails due to UNIQUE constraint violation', async () => {
    const { useCase, userRepository } = createRegisterUseCaseDeps();
    const originalSave = userRepository.save.bind(userRepository);
    userRepository.save = (): Promise<void> =>
      Promise.reject(new Error('UNIQUE constraint failed'));

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

    // Restore for cleanup
    userRepository.save = originalSave;
  });
});
