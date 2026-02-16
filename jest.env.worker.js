const { TestEnvironment } = require('jest-environment-node');

/**
 * Custom Jest environment for Cloudflare Workers source code.
 *
 * Extends the Node.js environment but removes Node-specific globals
 * that are not available in the Workers runtime and not needed by
 * Jest internals.
 *
 * Note: `process` cannot be removed because Jest infrastructure
 * (graceful-fs, react-is, pretty-format) depends on it at runtime.
 * Use ESLint `no-restricted-globals` to catch `process` usage in
 * source code instead.
 *
 * Web Standard APIs (fetch, Request, Response, Headers, URL, crypto,
 * TextEncoder, TextDecoder, setTimeout, console, structuredClone)
 * remain available as they exist in both Node.js and Workers.
 */
class WorkerEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    delete this.global.Buffer;
    delete this.global.setImmediate;
    delete this.global.clearImmediate;
  }
}

module.exports = WorkerEnvironment;
