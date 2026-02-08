import { ConflictError } from './ConflictError';
import { DomainError } from './DomainError';

describe('ConflictError', () => {
  it('creates an error with the correct name', () => {
    const error = new ConflictError('Email already registered');

    expect(error.name).toBe('ConflictError');
  });

  it('creates an error with the correct message', () => {
    const error = new ConflictError('Email already registered');

    expect(error.message).toBe('Email already registered');
  });

  it('has the correct error code', () => {
    const error = new ConflictError('Email already registered');

    expect(error.code).toBe('CONFLICT');
  });

  it('is an instance of DomainError', () => {
    const error = new ConflictError('Email already registered');

    expect(error).toBeInstanceOf(DomainError);
  });

  it('maintains correct prototype chain', () => {
    const error = new ConflictError('Email already registered');

    expect(Object.getPrototypeOf(error)).toBe(ConflictError.prototype);
  });
});
