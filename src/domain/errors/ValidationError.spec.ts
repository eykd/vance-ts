import { DomainError } from './DomainError';
import { ValidationError } from './ValidationError';

describe('ValidationError', () => {
  it('creates an error with the correct name', () => {
    const error = new ValidationError('Validation failed');

    expect(error.name).toBe('ValidationError');
  });

  it('creates an error with the correct message', () => {
    const error = new ValidationError('Validation failed');

    expect(error.message).toBe('Validation failed');
  });

  it('has the correct error code', () => {
    const error = new ValidationError('Validation failed');

    expect(error.code).toBe('VALIDATION_ERROR');
  });

  it('is an instance of DomainError', () => {
    const error = new ValidationError('Validation failed');

    expect(error).toBeInstanceOf(DomainError);
  });

  it('accepts optional field-level errors', () => {
    const fields = {
      email: ['Must be a valid email address'],
      password: ['Must be at least 12 characters'],
    };
    const error = new ValidationError('Validation failed', fields);

    expect(error.fields).toEqual(fields);
  });

  it('has undefined fields when not provided', () => {
    const error = new ValidationError('Validation failed');

    expect(error.fields).toBeUndefined();
  });

  it('maintains correct prototype chain', () => {
    const error = new ValidationError('Validation failed');

    expect(Object.getPrototypeOf(error)).toBe(ValidationError.prototype);
  });

  it('shallow-copies fields to prevent external mutation', () => {
    const fields = {
      email: ['Must be a valid email address'],
    };
    const error = new ValidationError('Validation failed', fields);

    // Mutate the original object
    fields['password'] = ['Too short'];

    // Error's fields should not be affected
    expect(error.fields).not.toHaveProperty('password');
    expect(error.fields).toEqual({
      email: ['Must be a valid email address'],
    });
  });
});
