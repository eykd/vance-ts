import { ConflictError } from '../../domain/errors/ConflictError';
import { DomainError } from '../../domain/errors/DomainError';
import { NotFoundError } from '../../domain/errors/NotFoundError';
import { RateLimitError } from '../../domain/errors/RateLimitError';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError';
import { ValidationError } from '../../domain/errors/ValidationError';

import { mapErrorToStatusCode, getGenericErrorMessage } from './errorStatusMap';

class UnknownDomainError extends DomainError {
  readonly code = 'UNKNOWN';
}

describe('mapErrorToStatusCode', () => {
  it('maps ValidationError to 422', () => {
    expect(mapErrorToStatusCode(new ValidationError('bad input'))).toBe(422);
  });

  it('maps UnauthorizedError to 401', () => {
    expect(mapErrorToStatusCode(new UnauthorizedError('no auth'))).toBe(401);
  });

  it('maps NotFoundError to 404', () => {
    expect(mapErrorToStatusCode(new NotFoundError('missing'))).toBe(404);
  });

  it('maps ConflictError to 409', () => {
    expect(mapErrorToStatusCode(new ConflictError('duplicate'))).toBe(409);
  });

  it('maps RateLimitError to 429', () => {
    expect(mapErrorToStatusCode(new RateLimitError('slow down', 60))).toBe(429);
  });

  it('maps unknown DomainError to 500 and logs warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    expect(mapErrorToStatusCode(new UnknownDomainError('unknown'))).toBe(500);
    expect(warnSpy).toHaveBeenCalledWith('Unmapped domain error type: UnknownDomainError');

    warnSpy.mockRestore();
  });
});

describe('getGenericErrorMessage', () => {
  it('returns generic message for ValidationError', () => {
    expect(getGenericErrorMessage(new ValidationError('bad input'))).toBe('Invalid request data');
  });

  it('returns generic message for UnauthorizedError', () => {
    expect(getGenericErrorMessage(new UnauthorizedError('no auth'))).toBe(
      'Authentication required'
    );
  });

  it('returns generic message for NotFoundError', () => {
    expect(getGenericErrorMessage(new NotFoundError('missing'))).toBe('Resource not found');
  });

  it('returns generic message for ConflictError', () => {
    expect(getGenericErrorMessage(new ConflictError('duplicate'))).toBe('Resource already exists');
  });

  it('returns generic message for RateLimitError', () => {
    expect(getGenericErrorMessage(new RateLimitError('slow down', 60))).toBe(
      'Too many requests. Please try again later.'
    );
  });

  it('returns generic message for unknown DomainError', () => {
    expect(getGenericErrorMessage(new UnknownDomainError('unknown'))).toBe('An error occurred');
  });

  it('does not expose internal error details', () => {
    const error = new NotFoundError('User with ID abc-123 not found in D1 database');
    const message = getGenericErrorMessage(error);

    expect(message).not.toContain('abc-123');
    expect(message).not.toContain('D1');
    expect(message).not.toContain('database');
    expect(message).toBe('Resource not found');
  });
});
