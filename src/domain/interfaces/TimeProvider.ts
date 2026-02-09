/**
 * Port defining how the domain accesses the current time.
 *
 * Implementations live in the infrastructure layer (e.g., SystemTimeProvider).
 * Injecting this interface makes time-dependent code deterministically testable.
 */
export interface TimeProvider {
  /**
   * Returns the current time as milliseconds since the Unix epoch.
   *
   * @returns Current timestamp in milliseconds
   */
  now(): number;
}
