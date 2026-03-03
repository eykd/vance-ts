/**
 * Tests for WorkspaceProvisioningService.
 *
 * Focuses on the critical FK ordering requirement: audit events must be inserted
 * LAST in the D1 batch because audit_event.actor_id references actor(id).
 * Inserting audit events before the actor row would cause FK constraint failures.
 *
 * Required batch order: [0] workspace, [1] actor, [2..4] area x3, [5..9] context x5,
 * [10..19] audit_event x10 — ALL audit events last.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkspaceProvisioningService } from './WorkspaceProvisioningService';

/**
 * Minimal D1PreparedStatement mock with a bind spy.
 *
 * @returns A mock D1PreparedStatement with all methods stubbed.
 */
function makeStmt(): D1PreparedStatement {
  const bindSpy = vi.fn().mockReturnThis();
  return {
    bind: bindSpy,
    run: vi.fn(),
    all: vi.fn(),
    raw: vi.fn(),
    first: vi.fn(),
  } as unknown as D1PreparedStatement;
}

/**
 * Creates a mock D1Database that tracks which SQL was used to prepare each statement.
 *
 * @returns Mock database, batch spy, and a function to retrieve SQL for a statement object.
 */
function makeMockDb(): {
  db: D1Database;
  batchSpy: ReturnType<typeof vi.fn>;
  getSql: (stmt: D1PreparedStatement) => string;
} {
  const stmtToSql = new Map<D1PreparedStatement, string>();
  const batchSpy = vi.fn().mockResolvedValue([]);

  const db = {
    prepare: vi.fn((sql: string) => {
      const stmt = makeStmt();
      stmtToSql.set(stmt, sql);
      return stmt;
    }),
    batch: batchSpy,
    exec: vi.fn(),
    dump: vi.fn(),
  } as unknown as D1Database;

  return { db, batchSpy, getSql: (stmt) => stmtToSql.get(stmt) ?? '' };
}

describe('WorkspaceProvisioningService', () => {
  const userId = 'user-00000000-0000-4000-8000-000000000001';
  const email = 'alice@example.com';
  let db: D1Database;
  let batchSpy: ReturnType<typeof vi.fn>;
  let getSql: (stmt: D1PreparedStatement) => string;
  let service: WorkspaceProvisioningService;

  beforeEach(async () => {
    ({ db, batchSpy, getSql } = makeMockDb());
    service = new WorkspaceProvisioningService(db);
    await service.provisionForUser(userId, email);
  });

  describe('batch statement count', () => {
    it('calls db.batch() exactly once', () => {
      expect(batchSpy).toHaveBeenCalledTimes(1);
    });

    it('batch contains exactly 20 statements (1 workspace + 1 actor + 3 areas + 5 contexts + 10 audit events)', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(stmts).toHaveLength(20);
    });
  });

  describe('FK ordering — workspace first', () => {
    it('statement[0] is workspace INSERT', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(getSql(stmts[0]!)).toMatch(/INSERT INTO workspace/i);
    });
  });

  describe('FK ordering — actor second', () => {
    it('statement[1] is actor INSERT', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(getSql(stmts[1]!)).toMatch(/INSERT INTO actor/i);
    });
  });

  describe('FK ordering — areas third (statements 2–4)', () => {
    it('statements[2], [3], [4] are area INSERTs', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(getSql(stmts[2]!)).toMatch(/INSERT INTO area/i);
      expect(getSql(stmts[3]!)).toMatch(/INSERT INTO area/i);
      expect(getSql(stmts[4]!)).toMatch(/INSERT INTO area/i);
    });
  });

  describe('FK ordering — contexts fourth (statements 5–9)', () => {
    it('statements[5]–[9] are context INSERTs', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      for (let i = 5; i <= 9; i++) {
        expect(getSql(stmts[i]!)).toMatch(/INSERT INTO context/i);
      }
    });
  });

  describe('FK ordering — audit events last (statements 10–19)', () => {
    it('statements[10]–[19] are all audit_event INSERTs', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      for (let i = 10; i <= 19; i++) {
        expect(getSql(stmts[i]!)).toMatch(/INSERT INTO audit_event/i);
      }
    });

    it('no audit_event INSERT appears before position 10', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      for (let i = 0; i < 10; i++) {
        expect(getSql(stmts[i]!)).not.toMatch(/INSERT INTO audit_event/i);
      }
    });
  });

  describe('SQL parameterization — no external values interpolated', () => {
    it('workspace INSERT SQL does not contain userId (uses ? placeholder)', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(getSql(stmts[0]!)).not.toContain(userId);
    });

    it('workspace INSERT SQL does not contain email (uses ? placeholder)', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(getSql(stmts[0]!)).not.toContain(email);
    });

    it('actor INSERT SQL does not contain userId (uses ? placeholder)', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      expect(getSql(stmts[1]!)).not.toContain(userId);
    });

    it('workspace INSERT uses .bind() with userId as a parameter', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      const workspaceStmt = stmts[0]!;
      // The bind spy is attached to the underlying mock; retrieve it via cast
      const bindMock = (workspaceStmt as unknown as { bind: ReturnType<typeof vi.fn> }).bind;
      const [callArgs] = bindMock.mock.calls as unknown[][];
      expect(callArgs).toContain(userId);
    });

    it('actor INSERT uses .bind() with userId as a parameter', () => {
      const [stmts] = batchSpy.mock.calls[0] as [D1PreparedStatement[]];
      const actorStmt = stmts[1]!;
      const bindMock = (actorStmt as unknown as { bind: ReturnType<typeof vi.fn> }).bind;
      const [callArgs] = bindMock.mock.calls as unknown[][];
      expect(callArgs).toContain(userId);
    });
  });

  describe('idempotency — UNIQUE constraint failure', () => {
    it('returns without throwing when workspace already exists (UNIQUE constraint failed)', async () => {
      const { db: idempotentDb } = makeMockDb();
      const batchFn = vi.fn().mockRejectedValue(new Error('UNIQUE constraint failed: workspace.user_id'));
      (idempotentDb as unknown as { batch: typeof batchFn }).batch = batchFn;

      const idempotentService = new WorkspaceProvisioningService(idempotentDb);
      await expect(idempotentService.provisionForUser(userId, email)).resolves.toBeUndefined();
    });

    it('re-throws errors that are not UNIQUE constraint failures', async () => {
      const { db: failDb } = makeMockDb();
      const batchFn = vi.fn().mockRejectedValue(new Error('D1 service temporarily unavailable'));
      (failDb as unknown as { batch: typeof batchFn }).batch = batchFn;

      const failService = new WorkspaceProvisioningService(failDb);
      await expect(failService.provisionForUser(userId, email)).rejects.toThrow(
        'D1 service temporarily unavailable'
      );
    });
  });
});
