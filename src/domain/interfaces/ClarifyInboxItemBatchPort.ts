/**
 * ClarifyInboxItemBatchPort — output port for atomic inbox-item clarification persistence.
 *
 * Defines the contract for persisting the clarified inbox item, new action,
 * and audit events in a single atomic operation. The application-layer
 * ClarifyInboxItemToActionUseCase depends on this port; the infrastructure
 * layer implements it as a D1 batch.
 *
 * @module
 */

import type { Action } from '../entities/Action.js';
import type { AuditEvent } from '../entities/AuditEvent.js';
import type { InboxItem } from '../entities/InboxItem.js';

/**
 * Output port for atomically persisting the inbox-item clarification payload.
 *
 * Implemented in the infrastructure layer as a single D1 batch call ordered
 * for FK-safety: action → inbox_item update → audit_events.
 */
export interface ClarifyInboxItemBatchPort {
  /**
   * Atomically persists the clarified inbox item, new action, and audit events
   * in a single database operation.
   *
   * @param inboxItem - The updated inbox item (status = clarified).
   * @param action - The newly created action entity.
   * @param auditEvents - The audit events to persist (may be empty).
   * @returns Resolved promise when all entities are persisted atomically.
   */
  clarifyBatch(inboxItem: InboxItem, action: Action, auditEvents: AuditEvent[]): Promise<void>;
}
