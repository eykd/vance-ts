import { describe, expect, it } from 'vitest';

import { authErrorStatusCode } from './authErrorStatus';

describe('authErrorStatusCode', () => {
  it('returns 400 when no error code is provided', () => {
    expect(authErrorStatusCode(null)).toBe(400);
  });

  it('returns 400 for empty string error code', () => {
    expect(authErrorStatusCode('')).toBe(400);
  });

  it('returns 400 for client auth errors', () => {
    const clientErrors = [
      'state_mismatch',
      'state_not_found',
      'invalid_callback_request',
      'INVALID_TOKEN',
      'please_restart_the_process',
    ];
    for (const code of clientErrors) {
      expect(authErrorStatusCode(code)).toBe(400);
    }
  });

  it('returns 500 for internal_server_error', () => {
    expect(authErrorStatusCode('internal_server_error')).toBe(500);
  });

  it('returns 400 for unknown error codes (default)', () => {
    expect(authErrorStatusCode('UNKNOWN')).toBe(400);
    expect(authErrorStatusCode('some_novel_error')).toBe(400);
  });
});
