/**
 * Re-exports random source types from the domain layer.
 *
 * RandomPort is defined in the domain layer where port interfaces
 * belong per Clean Architecture. This module re-exports it for
 * backward compatibility. Rng is re-exported from selectionModes.
 *
 * @module application/prestoplot/RandomSource
 */

export type { RandomPort } from '../../domain/prestoplot/randomPort.js';
export type { Rng } from '../../domain/prestoplot/selectionModes.js';
