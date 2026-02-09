import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { MockPasswordHasher } from '../mocks/MockPasswordHasher';
import { MockUserRepository } from '../mocks/MockUserRepository';

import { createRegisterUseCaseDeps } from './registerUseCaseDepsFactory';

describe('createRegisterUseCaseDeps', () => {
  it('creates all dependencies', () => {
    const deps = createRegisterUseCaseDeps();

    expect(deps.userRepository).toBeInstanceOf(MockUserRepository);
    expect(deps.passwordHasher).toBeInstanceOf(MockPasswordHasher);
    expect(deps.timeProvider).toBeDefined();
    expect(deps.useCase).toBeInstanceOf(RegisterUseCase);
  });

  it('creates a timeProvider that returns a fixed timestamp', () => {
    const deps = createRegisterUseCaseDeps();

    const timestamp = deps.timeProvider.now();
    expect(timestamp).toBe(new Date('2025-06-15T10:30:00.000Z').getTime());
  });

  it('creates fresh instances on each call', () => {
    const deps1 = createRegisterUseCaseDeps();
    const deps2 = createRegisterUseCaseDeps();

    expect(deps1.userRepository).not.toBe(deps2.userRepository);
    expect(deps1.passwordHasher).not.toBe(deps2.passwordHasher);
    expect(deps1.useCase).not.toBe(deps2.useCase);
  });

  it('creates a use case wired to the repositories', async () => {
    const { useCase } = createRegisterUseCaseDeps();

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'securePassword123!',
      confirmPassword: 'securePassword123!',
    });

    expect(result.success).toBe(true);
  });
});
