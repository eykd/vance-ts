/**
 * Re-exports grammar storage types from the domain layer.
 *
 * StoragePort and GrammarDto are defined in the domain layer
 * where port interfaces belong per Clean Architecture. This module
 * re-exports them for backward compatibility.
 *
 * @module application/prestoplot/GrammarStorage
 */

export type { GrammarDto, StoragePort } from '../../domain/prestoplot/storagePort.js';
