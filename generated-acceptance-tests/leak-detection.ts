/**
 * Opt-in afterEach hook that verifies D1 tables are empty after
 * isolatedStorage rollback. Activates only when the DETECT_STATE_LEAKS
 * miniflare binding is set to 'true'.
 *
 * This catches cases where isolatedStorage silently fails to roll back state.
 */

import { env } from 'cloudflare:test';
import { afterEach, expect } from 'vitest';

/** Registers an afterEach hook that checks for leaked D1 rows. */
export function registerLeakDetection(): void {
  const shouldDetect = (env as Record<string, unknown>)['DETECT_STATE_LEAKS'];
  if (shouldDetect !== 'true') return;

  afterEach(async () => {
    const tables = ['session', 'account', 'verification', 'user'] as const;
    for (const table of tables) {
      const result = await env.DB.prepare(`SELECT COUNT(*) as c FROM ${table}`).first<{ c: number }>();
      expect(result?.c ?? 0, `Leaked rows in ${table} — isolatedStorage may not be working`).toBe(0);
    }
  });
}
