import { DomainError } from './DomainError';
import { NotFoundError } from './NotFoundError';

describe('NotFoundError', () => {
  it('creates an error with the correct name', () => {
    const error = new NotFoundError('User not found');

    expect(error.name).toBe('NotFoundError');
  });

  it('creates an error with the correct message', () => {
    const error = new NotFoundError('User not found');

    expect(error.message).toBe('User not found');
  });

  it('has the correct error code', () => {
    const error = new NotFoundError('User not found');

    expect(error.code).toBe('NOT_FOUND');
  });

  it('is an instance of DomainError', () => {
    const error = new NotFoundError('User not found');

    expect(error).toBeInstanceOf(DomainError);
  });

  it('maintains correct prototype chain', () => {
    const error = new NotFoundError('User not found');

    expect(Object.getPrototypeOf(error)).toBe(NotFoundError.prototype);
  });
});
