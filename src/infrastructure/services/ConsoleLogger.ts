import { type Logger, type LogContext } from '../../domain/interfaces/Logger';

/**
 * Simple console-based logger implementation.
 *
 * In development, logs are formatted for readability.
 * In production, logs are JSON-structured for Cloudflare Logpush.
 *
 * This logger uses console.log, console.warn, and console.error which
 * are available in Cloudflare Workers. Logs are automatically captured
 * by Cloudflare and can be exported via Logpush to external services.
 */
export class ConsoleLogger implements Logger {
  private readonly isDevelopment: boolean;

  /**
   * Creates a new console logger.
   *
   * @param environment - Runtime environment name (e.g., 'development', 'production')
   */
  constructor(environment?: string) {
    this.isDevelopment = environment === 'development';
  }

  /**
   * Logs an informational message.
   *
   * @param message - Human-readable log message
   * @param context - Optional structured context metadata
   */
  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  /**
   * Logs a warning message.
   *
   * @param message - Human-readable log message
   * @param context - Optional structured context metadata
   */
  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  /**
   * Logs an error message with stack trace information.
   *
   * @param message - Human-readable log message
   * @param error - Error object containing stack trace
   * @param context - Optional structured context metadata
   */
  error(message: string, error: Error, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error.message,
      stack: error.stack,
    };
    this.log('ERROR', message, errorContext);
  }

  /**
   * Logs a security-related event.
   *
   * @param event - Security event name
   * @param context - Structured context metadata for the security event
   */
  security(event: string, context: LogContext): void {
    const securityContext: LogContext = {
      ...context,
      securityEvent: true,
    };
    this.log('SECURITY', event, securityContext);
  }

  /**
   * Routes a log entry to the appropriate formatter.
   *
   * @param level - Log severity level
   * @param message - Human-readable log message
   * @param context - Optional structured context metadata
   */
  private log(level: string, message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.logDevelopment(level, message, context);
    } else {
      this.logProduction(level, message, context);
    }
  }

  /**
   * Formats and outputs a log entry for development readability.
   *
   * @param level - Log severity level
   * @param message - Human-readable log message
   * @param context - Optional structured context metadata
   */
  private logDevelopment(level: string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const sanitizedMessage = this.sanitizeMessage(message);
    const prefix = `[${timestamp}] ${level}:`;

    if (context !== undefined && Object.keys(context).length > 0) {
      // eslint-disable-next-line no-console
      console.log(prefix, sanitizedMessage, context);
    } else {
      // eslint-disable-next-line no-console
      console.log(prefix, sanitizedMessage);
    }
  }

  /**
   * Formats and outputs a log entry as JSON for production logging.
   *
   * @param level - Log severity level
   * @param message - Human-readable log message
   * @param context - Optional structured context metadata
   */
  private logProduction(level: string, message: string, context?: LogContext): void {
    // SECURITY: Structural fields (timestamp, level, message) are placed AFTER the
    // ...context spread so they always win. This prevents a malicious or buggy caller
    // from injecting fake timestamps, levels, or messages via the context object.
    const entry = {
      ...context,
      timestamp: new Date().toISOString(),
      level,
      message: this.sanitizeMessage(message),
    };

    // eslint-disable-next-line no-console -- JSON.stringify for structured logging
    console.log(JSON.stringify(entry));
  }

  /**
   * Sanitizes log messages to prevent CRLF injection.
   *
   * @param message - Raw log message
   * @returns Sanitized message with newlines replaced
   */
  private sanitizeMessage(message: string): string {
    return message.replace(/[\r\n]/g, ' ');
  }
}
