import { User } from '../../domain/entities/User';
import { ConflictError } from '../../domain/errors/ConflictError';
import { ValidationError } from '../../domain/errors/ValidationError';
import type { PasswordHasher } from '../../domain/interfaces/PasswordHasher';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import type { UserRepository } from '../../domain/interfaces/UserRepository';
import type { Result } from '../../domain/types/Result';
import { ok, err } from '../../domain/types/Result';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { UserId } from '../../domain/value-objects/UserId';
import type { RegisterRequest } from '../dto/RegisterRequest';

/**
 * Use case for registering a new user account.
 *
 * Validates input, checks for email uniqueness, hashes the password,
 * and persists the new user entity.
 */
export class RegisterUseCase {
  private readonly userRepository: UserRepository;
  private readonly passwordHasher: PasswordHasher;
  private readonly timeProvider: TimeProvider;

  /**
   * Creates a new RegisterUseCase.
   *
   * @param userRepository - Repository for persisting and querying users
   * @param passwordHasher - Service for hashing passwords
   * @param timeProvider - Provider for current timestamps
   */
  constructor(
    userRepository: UserRepository,
    passwordHasher: PasswordHasher,
    timeProvider: TimeProvider
  ) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.timeProvider = timeProvider;
  }

  /**
   * Executes the registration use case.
   *
   * @param request - The registration request DTO
   * @returns A Result containing the new userId on success, or a ValidationError/ConflictError on failure
   */
  async execute(
    request: RegisterRequest
  ): Promise<Result<{ userId: string }, ValidationError | ConflictError>> {
    if (request.password !== request.confirmPassword) {
      return err(
        new ValidationError('Passwords do not match', {
          confirmPassword: ['Passwords do not match'],
        })
      );
    }

    let email: Email;
    try {
      email = Email.create(request.email);
    } catch (error: unknown) {
      /* istanbul ignore else -- Email.create only throws ValidationError */
      if (error instanceof ValidationError) {
        return err(error);
      }
      /* istanbul ignore next */
      throw error;
    }

    try {
      Password.create(request.password);
    } catch (error: unknown) {
      /* istanbul ignore else -- Password.create only throws ValidationError */
      if (error instanceof ValidationError) {
        return err(error);
      }
      /* istanbul ignore next */
      throw error;
    }

    const userId = UserId.generate();
    const [emailTaken, hashedPassword] = await Promise.all([
      this.userRepository.emailExists(email),
      this.passwordHasher.hash(request.password),
    ]);
    if (emailTaken) {
      return err(new ConflictError('Email is already registered'));
    }
    const now = this.timeProvider.now();
    const nowIso = new Date(now).toISOString();

    const user = User.create({
      id: userId,
      email,
      passwordHash: hashedPassword,
      now: nowIso,
    });

    await this.userRepository.save(user);

    return ok({ userId: userId.toString() });
  }
}
