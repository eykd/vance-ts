/**
 * Context information for log entries.
 *
 * Used to provide structured metadata about events being logged.
 */
export interface LogContext {
  /**
   * User ID associated with the event.
   */
  userId?: string;

  /**
   * Session ID associated with the event.
   */
  sessionId?: string;

  /**
   * IP address of the client.
   */
  ip?: string;

  /**
   * Action being performed.
   */
  action?: string;

  /**
   * Additional context fields.
   */
  [key: string]: unknown;
}

/**
 * Logger interface for structured logging.
 *
 * This interface is a port in the domain layer. Implementations live
 * in the infrastructure layer (e.g., ConsoleLogger).
 *
 * All log methods accept optional context for structured logging.
 * Implementations should format context as JSON in production and
 * human-readable format in development.
 */
export interface Logger {
  /**
   * Log an informational message.
   *
   * Use for general application flow and non-critical events.
   *
   * @param message - Human-readable message
   * @param context - Optional structured context
   */
  info(message: string, context?: LogContext): void;

  /**
   * Log a warning message.
   *
   * Use for recoverable errors or unusual conditions that don't
   * prevent the application from functioning.
   *
   * @param message - Human-readable message
   * @param context - Optional structured context
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Log an error message.
   *
   * Use for unexpected errors that indicate a problem requiring
   * investigation.
   *
   * @param message - Human-readable message
   * @param error - Error object with stack trace
   * @param context - Optional structured context
   */
  error(message: string, error: Error, context?: LogContext): void;

  /**
   * Log a security-related event.
   *
   * Use for authentication failures, authorization violations,
   * rate limit violations, and other security-relevant events.
   *
   * These logs should be monitored for security threats and
   * compliance purposes.
   *
   * @param event - Security event name (e.g., 'failed_login', 'account_locked')
   * @param context - Structured context (always required for security events)
   */
  security(event: string, context: LogContext): void;
}
