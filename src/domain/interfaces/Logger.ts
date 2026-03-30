/**
 * Logger port interface.
 *
 * Defines the contract for structured logging, decoupled from any
 * concrete I/O implementation (e.g., `console`). Use cases accept this
 * interface — never call `console` methods directly.
 *
 * @module
 */

/**
 * Port interface for application-layer logging.
 *
 * Implementations live in `src/infrastructure/` and may write to `console`,
 * structured logging services, or test spies. Use cases depend only on this
 * interface, keeping the application layer free of I/O side effects.
 */
export interface Logger {
  /**
   * Logs an informational message.
   *
   * @param message - Human-readable description of the event.
   */
  info(message: string): void;

  /**
   * Logs an error-level message with an optional cause.
   *
   * @param message - Human-readable description of the error context.
   * @param cause - The underlying error or value that triggered the log entry.
   */
  error(message: string, cause?: unknown): void;
}
