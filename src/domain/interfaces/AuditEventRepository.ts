/**
 * AuditEventRepository port.
 *
 * Defines the persistence contract for {@link AuditEvent} entities.
 * Audit events are append-only — no update or delete operations are defined.
 * Implementations live in the infrastructure layer (e.g. D1AuditEventRepository).
 *
 * @module
 */

import type { AuditEvent } from '../entities/AuditEvent';

/**
 * Repository interface for {@link AuditEvent} persistence.
 *
 * All methods append new events. No queries or mutations are defined;
 * the audit log is written but not read at runtime in this slice.
 */
export interface AuditEventRepository {
  /**
   * Appends a single audit event to the log.
   *
   * @param event - The audit event to persist.
   */
  save(event: AuditEvent): Promise<void>;

  /**
   * Appends multiple audit events to the log in a single batch operation.
   *
   * Used by provisioning and clarification to record all related events
   * atomically within the same D1 batch.
   *
   * @param events - The audit events to persist.
   */
  saveBatch(events: AuditEvent[]): Promise<void>;
}
