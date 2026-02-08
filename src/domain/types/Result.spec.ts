import { type Result, ok, err } from './Result';

describe('Result', () => {
  describe('ok', () => {
    it('creates a successful result with a value', () => {
      const result = ok(42);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
      }
    });

    it('creates a successful result with an object', () => {
      const value = { id: '123', name: 'Test' };
      const result = ok(value);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(value);
      }
    });

    it('creates a successful result with null', () => {
      const result = ok(null);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeNull();
      }
    });

    it('creates a successful result with undefined', () => {
      const result = ok(undefined);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeUndefined();
      }
    });
  });

  describe('err', () => {
    it('creates a failed result with an error', () => {
      const error = new Error('Something went wrong');
      const result = err(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it('creates a failed result with a string error', () => {
      const result = err('Something went wrong');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Something went wrong');
      }
    });

    it('creates a failed result with a custom error object', () => {
      const error = { code: 'ERR_001', message: 'Custom error' };
      const result = err(error);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toEqual(error);
      }
    });
  });

  describe('type narrowing', () => {
    it('narrows to success type when success is true', () => {
      const result: Result<number, string> = ok(42);

      if (result.success) {
        // TypeScript should infer that result.value exists
        const value: number = result.value;
        expect(value).toBe(42);
      } else {
        throw new Error('Should not reach error branch');
      }
    });

    it('narrows to error type when success is false', () => {
      const result: Result<number, string> = err('error message');

      if (!result.success) {
        // TypeScript should infer that result.error exists
        const error: string = result.error;
        expect(error).toBe('error message');
      } else {
        throw new Error('Should not reach success branch');
      }
    });
  });

  describe('use case simulation', () => {
    function divide(a: number, b: number): Result<number, string> {
      if (b === 0) {
        return err('Cannot divide by zero');
      }
      return ok(a / b);
    }

    it('returns success for valid division', () => {
      const result = divide(10, 2);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(5);
      }
    });

    it('returns error for division by zero', () => {
      const result = divide(10, 0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Cannot divide by zero');
      }
    });
  });
});
