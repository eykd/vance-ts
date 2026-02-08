import { DomainError } from './DomainError';
import { UnauthorizedError } from './UnauthorizedError';

describe('UnauthorizedError', () => {
  it('creates an error with the correct name', () => {
    const error = new UnauthorizedError('Invalid credentials');

    expect(error.name).toBe('UnauthorizedError');
  });

  it('creates an error with the correct message', () => {
    const error = new UnauthorizedError('Invalid credentials');

    expect(error.message).toBe('Invalid credentials');
  });

  it('has the correct error code', () => {
    const error = new UnauthorizedError('Invalid credentials');

    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('is an instance of DomainError', () => {
    const error = new UnauthorizedError('Invalid credentials');

    expect(error).toBeInstanceOf(DomainError);
  });

  it('maintains correct prototype chain', () => {
    const error = new UnauthorizedError('Invalid credentials');

    expect(Object.getPrototypeOf(error)).toBe(UnauthorizedError.prototype);
  });
});
