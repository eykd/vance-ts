/**
 * D1AuditEventRepository — Cloudflare D1 implementation of AuditEventRepository.
 *
 * Appends {@link AuditEvent} entities to the `audit_event` D1 table.
 * This is an append-only repository — no query or delete methods are defined.
 *
 * @module
 */

import type { AuditEvent } from '../../domain/entities/AuditEvent';
import type { AuditEventRepository } from '../../domain/interfaces/AuditEventRepository';

/**
 * D1-backed implementation of the {@link AuditEventRepository} port.
 *
 * Stub implementation — full D1 query logic is added in workspace-bms.1.3.7.
 */
export class D1AuditEventRepository implements AuditEventRepository {
  private readonly _db: D1Database;

  /**
   * Creates a new D1AuditEventRepository.
   *
   * @param db - The D1 database binding from the Cloudflare Workers environment.
   */
  constructor(db: D1Database) {
    this._db = db;
    void this._db;
  }

  /**
   * Appends a single audit event to the log.
   *
   * @param _event - The audit event to persist.
   * @returns Resolved promise on success.
   */
  save(_event: AuditEvent): Promise<void> {
    return Promise.reject(new Error('D1AuditEventRepository.save: not yet implemented'));
  }

  /**
   * Appends multiple audit events to the log in a single batch operation.
   *
   * @param _events - The audit events to persist.
   * @returns Resolved promise on success.
   */
  saveBatch(_events: AuditEvent[]): Promise<void> {
    return Promise.reject(new Error('D1AuditEventRepository.saveBatch: not yet implemented'));
  }
}
