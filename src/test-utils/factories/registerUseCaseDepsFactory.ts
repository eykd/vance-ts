import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import type { TimeProvider } from '../../domain/interfaces/TimeProvider';
import { MockPasswordHasher } from '../mocks/MockPasswordHasher';
import { MockUserRepository } from '../mocks/MockUserRepository';

/**
 * Creates fresh test dependencies for RegisterUseCase.
 *
 * @returns The mock repositories, password hasher, time provider, and use case instance
 */
export function createRegisterUseCaseDeps(): {
  userRepository: MockUserRepository;
  passwordHasher: MockPasswordHasher;
  timeProvider: TimeProvider;
  useCase: RegisterUseCase;
} {
  const FIXED_TIME = new Date('2025-06-15T10:30:00.000Z').getTime();
  const userRepository = new MockUserRepository();
  const passwordHasher = new MockPasswordHasher();
  const timeProvider: TimeProvider = { now: (): number => FIXED_TIME };
  const useCase = new RegisterUseCase(userRepository, passwordHasher, timeProvider);
  return { userRepository, passwordHasher, timeProvider, useCase };
}
