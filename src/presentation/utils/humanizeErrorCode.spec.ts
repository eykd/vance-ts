/**
 * Tests for humanizeErrorCode utility.
 */

import { describe, expect, it } from 'vitest';

import { humanizeErrorCode } from './humanizeErrorCode.js';

describe('humanizeErrorCode', () => {
  it('converts single-word code to capitalized form', () => {
    expect(humanizeErrorCode('error')).toBe('Error');
  });

  it('converts snake_case code to sentence case with spaces', () => {
    expect(humanizeErrorCode('action_not_found')).toBe('Action not found');
  });

  it('handles domain error codes', () => {
    expect(humanizeErrorCode('title_too_long')).toBe('Title too long');
    expect(humanizeErrorCode('title_required')).toBe('Title required');
  });

  it('handles status transition codes', () => {
    expect(humanizeErrorCode('invalid_status_transition')).toBe('Invalid status transition');
  });

  it('handles already_clarified code', () => {
    expect(humanizeErrorCode('already_clarified')).toBe('Already clarified');
  });
});
