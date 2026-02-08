import { ConsoleLogger } from './ConsoleLogger';

describe('ConsoleLogger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('development mode', () => {
    it('logs info messages with human-readable format', () => {
      const logger = new ConsoleLogger('development');

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.+\] INFO:/),
        'Test message'
      );
    });

    it('logs info messages with context', () => {
      const logger = new ConsoleLogger('development');
      const context = { userId: 'user-123', action: 'test' };

      logger.info('Test message', context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.+\] INFO:/),
        'Test message',
        context
      );
    });

    it('logs warning messages', () => {
      const logger = new ConsoleLogger('development');

      logger.warn('Warning message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.+\] WARN:/),
        'Warning message'
      );
    });

    it('logs error messages with stack trace', () => {
      const logger = new ConsoleLogger('development');
      const error = new Error('Test error');

      logger.error('Error occurred', error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.+\] ERROR:/),
        'Error occurred',
        expect.objectContaining({
          error: 'Test error',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          stack: expect.any(String),
        })
      );
    });

    it('logs security events with context', () => {
      const logger = new ConsoleLogger('development');
      const context = { userId: 'user-123', ip: '192.168.1.1' };

      logger.security('failed_login', context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.+\] SECURITY:/),
        'failed_login',
        expect.objectContaining({
          userId: 'user-123',
          ip: '192.168.1.1',
          securityEvent: true,
        })
      );
    });
  });

  describe('production mode', () => {
    it('logs info messages as JSON', () => {
      const logger = new ConsoleLogger('production');

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/"level":"INFO"/));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/"message":"Test message"/));
    });

    it('logs info messages with context as JSON', () => {
      const logger = new ConsoleLogger('production');
      const context = { userId: 'user-123', action: 'test' };

      logger.info('Test message', context);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const rawLog = String(consoleSpy.mock.calls[0]?.[0]);
      const loggedJson = JSON.parse(rawLog) as Record<string, unknown>;
      expect(loggedJson).toMatchObject({
        level: 'INFO',
        message: 'Test message',
        userId: 'user-123',
        action: 'test',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
      });
    });

    it('logs warning messages as JSON', () => {
      const logger = new ConsoleLogger('production');

      logger.warn('Warning message');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const rawLog = String(consoleSpy.mock.calls[0]?.[0]);
      const loggedJson = JSON.parse(rawLog) as Record<string, unknown>;
      expect(loggedJson).toMatchObject({
        level: 'WARN',
        message: 'Warning message',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
      });
    });

    it('logs error messages with stack trace as JSON', () => {
      const logger = new ConsoleLogger('production');
      const error = new Error('Test error');

      logger.error('Error occurred', error);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const rawLog = String(consoleSpy.mock.calls[0]?.[0]);
      const loggedJson = JSON.parse(rawLog) as Record<string, unknown>;
      expect(loggedJson).toMatchObject({
        level: 'ERROR',
        message: 'Error occurred',
        error: 'Test error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        stack: expect.any(String),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
      });
    });

    it('logs security events as JSON', () => {
      const logger = new ConsoleLogger('production');
      const context = { userId: 'user-123', ip: '192.168.1.1' };

      logger.security('failed_login', context);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const rawLog = String(consoleSpy.mock.calls[0]?.[0]);
      const loggedJson = JSON.parse(rawLog) as Record<string, unknown>;
      expect(loggedJson).toMatchObject({
        level: 'SECURITY',
        message: 'failed_login',
        userId: 'user-123',
        ip: '192.168.1.1',
        securityEvent: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
      });
    });

    it('defaults to production mode when environment not specified', () => {
      const logger = new ConsoleLogger();

      logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/"level":"INFO"/));
    });

    it('prevents context from overriding structural fields', () => {
      const logger = new ConsoleLogger('production');
      const maliciousContext = {
        timestamp: 'fake-timestamp',
        level: 'FAKE',
        message: 'injected message',
      };

      logger.info('Real message', maliciousContext);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const rawLog = String(consoleSpy.mock.calls[0]?.[0]);
      const loggedJson = JSON.parse(rawLog) as Record<string, unknown>;
      expect(loggedJson['level']).toBe('INFO');
      expect(loggedJson['message']).toBe('Real message');
      expect(loggedJson['timestamp']).not.toBe('fake-timestamp');
    });
  });

  describe('message sanitization', () => {
    it('sanitizes newlines in development mode messages', () => {
      const logger = new ConsoleLogger('development');

      logger.info('Line1\nLine2\rLine3');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[.+\] INFO:/),
        'Line1 Line2 Line3'
      );
    });

    it('sanitizes newlines in production mode messages', () => {
      const logger = new ConsoleLogger('production');

      logger.info('Line1\nLine2\rLine3');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const rawLog = String(consoleSpy.mock.calls[0]?.[0]);
      const loggedJson = JSON.parse(rawLog) as Record<string, unknown>;
      expect(loggedJson['message']).toBe('Line1 Line2 Line3');
    });
  });
});
