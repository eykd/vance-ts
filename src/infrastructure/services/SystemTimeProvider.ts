import type { TimeProvider } from '../../domain/interfaces/TimeProvider';

/**
 * Production implementation of TimeProvider using the system clock.
 *
 * Delegates to Date.now() for the current timestamp.
 */
export class SystemTimeProvider implements TimeProvider {
  /**
   * Returns the current time as milliseconds since the Unix epoch.
   *
   * @returns Current timestamp in milliseconds
   */
  now(): number {
    return Date.now();
  }
}
