import { DomainError } from './DomainError';

// Concrete implementation for testing
class TestDomainError extends DomainError {
  readonly code = 'TEST_ERROR';
}

describe('DomainError', () => {
  it('creates an error with the correct name', () => {
    const error = new TestDomainError('Test message');

    expect(error.name).toBe('TestDomainError');
  });

  it('creates an error with the correct message', () => {
    const error = new TestDomainError('Test message');

    expect(error.message).toBe('Test message');
  });

  it('is an instance of Error', () => {
    const error = new TestDomainError('Test message');

    expect(error).toBeInstanceOf(Error);
  });

  it('is an instance of DomainError', () => {
    const error = new TestDomainError('Test message');

    expect(error).toBeInstanceOf(DomainError);
  });

  it('has a stack trace', () => {
    const error = new TestDomainError('Test message');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('TestDomainError');
  });

  it('maintains correct prototype chain', () => {
    const error = new TestDomainError('Test message');

    expect(Object.getPrototypeOf(error)).toBe(TestDomainError.prototype);
  });
});
