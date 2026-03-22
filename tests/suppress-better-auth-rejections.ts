/**
 * Handle known unhandled rejections from better-auth internals.
 *
 * better-auth throws `APIError` internally on validation failures (password
 * too short/long, duplicate email, etc.) even when the caller uses
 * `asResponse: true`. The library converts these errors to HTTP responses,
 * but the intermediate throw surfaces as an unhandled rejection.
 *
 * Vitest 4 treats unhandled rejections as test failures (exit code 1),
 * unlike Vitest 3 which only reported them. This handler catches known
 * better-auth APIError rejections while still letting genuinely unexpected
 * rejections propagate.
 *
 * @module
 */

// Workers runtime with nodejs_compat provides process.on
// eslint-disable-next-line no-restricted-globals -- setup file runs in Workers runtime with nodejs_compat
process.on('unhandledRejection', (reason: unknown) => {
  if (reason instanceof Error && reason.constructor.name === 'APIError' && 'statusCode' in reason) {
    // Known better-auth internal rejection — handled, not suppressed.
    // The test assertions already validate the HTTP response; the
    // duplicate throw from better-auth's transaction layer is a library
    // implementation detail, not a test failure.
    return;
  }

  // Re-throw anything that isn't a known better-auth APIError
  throw reason;
});
