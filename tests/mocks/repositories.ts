/**
 * Shared mock factories for domain repository interfaces.
 *
 * Provides properly-typed mock implementations that match the domain
 * interfaces exactly, eliminating `as unknown as Interface` double casts
 * across test files.
 *
 * @module
 */

import { vi } from 'vitest';

import type { ActionRepository } from '../../src/domain/interfaces/ActionRepository';
import type { AreaRepository } from '../../src/domain/interfaces/AreaRepository';
import type { AuditEventRepository } from '../../src/domain/interfaces/AuditEventRepository';
import type { ClarifyInboxItemBatchPort } from '../../src/domain/interfaces/ClarifyInboxItemBatchPort';
import type { ContextRepository } from '../../src/domain/interfaces/ContextRepository';
import type { InboxItemRepository } from '../../src/domain/interfaces/InboxItemRepository';

/** Mock return type helper that preserves both mock and interface types. */
type Mocked<T> = { [K in keyof T]: T[K] & ReturnType<typeof vi.fn> };

/**
 * Creates a typed mock ActionRepository.
 *
 * @returns A mock implementing all ActionRepository methods.
 */
export function mockActionRepo(): Mocked<ActionRepository> {
  return {
    save: vi.fn<ActionRepository['save']>().mockResolvedValue(undefined),
    getById: vi.fn<ActionRepository['getById']>().mockResolvedValue(null),
    listByWorkspaceId: vi.fn<ActionRepository['listByWorkspaceId']>().mockResolvedValue([]),
  };
}

/**
 * Creates a typed mock AuditEventRepository.
 *
 * @returns A mock implementing all AuditEventRepository methods.
 */
export function mockAuditRepo(): Mocked<AuditEventRepository> {
  return {
    save: vi.fn<AuditEventRepository['save']>().mockResolvedValue(undefined),
    saveBatch: vi.fn<AuditEventRepository['saveBatch']>().mockResolvedValue(undefined),
  };
}

/**
 * Creates a typed mock InboxItemRepository.
 *
 * @returns A mock implementing all InboxItemRepository methods.
 */
export function mockInboxRepo(): Mocked<InboxItemRepository> {
  return {
    save: vi.fn<InboxItemRepository['save']>().mockResolvedValue(undefined),
    getById: vi.fn<InboxItemRepository['getById']>().mockResolvedValue(null),
    listByWorkspaceId: vi.fn<InboxItemRepository['listByWorkspaceId']>().mockResolvedValue([]),
    countByWorkspaceId: vi.fn<InboxItemRepository['countByWorkspaceId']>().mockResolvedValue(0),
  };
}

/**
 * Creates a typed mock AreaRepository.
 *
 * @returns A mock implementing all AreaRepository methods.
 */
export function mockAreaRepo(): Mocked<AreaRepository> {
  return {
    save: vi.fn<AreaRepository['save']>().mockResolvedValue(undefined),
    getById: vi.fn<AreaRepository['getById']>().mockResolvedValue(null),
    getActiveById: vi.fn<AreaRepository['getActiveById']>().mockResolvedValue(null),
    listByWorkspaceId: vi.fn<AreaRepository['listByWorkspaceId']>().mockResolvedValue([]),
  };
}

/**
 * Creates a typed mock ContextRepository.
 *
 * @returns A mock implementing all ContextRepository methods.
 */
export function mockContextRepo(): Mocked<ContextRepository> {
  return {
    save: vi.fn<ContextRepository['save']>().mockResolvedValue(undefined),
    getById: vi.fn<ContextRepository['getById']>().mockResolvedValue(null),
    listByWorkspaceId: vi.fn<ContextRepository['listByWorkspaceId']>().mockResolvedValue([]),
  };
}

/**
 * Creates a typed mock ClarifyInboxItemBatchPort.
 *
 * @returns A mock implementing all ClarifyInboxItemBatchPort methods.
 */
export function mockBatchPort(): Mocked<ClarifyInboxItemBatchPort> {
  return {
    clarifyBatch: vi.fn<ClarifyInboxItemBatchPort['clarifyBatch']>().mockResolvedValue(undefined),
  };
}
