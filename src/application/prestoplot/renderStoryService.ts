/**
 * RenderStoryService — public entry point for grammar-based text generation.
 *
 * Accepts a grammar key and seed, loads the grammar from storage, resolves
 * includes, creates a transient RenderEngine, and returns a typed result.
 *
 * **Never-throws contract**: All exceptions are caught and mapped to
 * typed {@link RenderStoryResult} error variants.
 *
 * @module application/prestoplot/renderStoryService
 */

import {
  CircularIncludeError,
  GrammarParseError,
  IncludeDepthError,
  IncludeLimitError,
  RenderBudgetError,
  StorageError,
  TemplateError,
} from '../../domain/prestoplot/errors.js';
import type { Grammar, Rule } from '../../domain/prestoplot/grammar.js';
import { createSeed } from '../../domain/prestoplot/seed.js';
import type { Seed } from '../../domain/prestoplot/seed.js';

import { grammarFromDto } from './dto.js';
import type { StoragePort } from './GrammarStorage.js';
import type { RandomPort } from './RandomSource.js';
import { createRenderEngine } from './renderEngine.js';
import type { TemplateEnginePort } from './TemplateEngine.js';

/**
 * Seed string length guard. Prevents DoS from extremely long seed strings
 * causing expensive SHA-256 operations.
 */
export const MAX_SEED_LENGTH = 256;

/**
 * Include chain depth limit. Root grammar is depth 0; first include level is depth 1.
 * Throw IncludeDepthError when depth exceeds this value.
 */
export const MAX_INCLUDE_DEPTH = 20;

/**
 * Total resolved grammars limit (including transitive includes).
 * Throw IncludeLimitError when exceeded.
 */
export const MAX_INCLUDE_COUNT = 50;

/** Request to render a grammar story. */
export interface RenderStoryRequest {
  /** The grammar key to load from storage. */
  readonly grammarKey: string;
  /** The seed string for deterministic rendering. */
  readonly seed: string;
}

/** Typed result of a render story operation. */
export type RenderStoryResult =
  | { readonly ok: true; readonly text: string }
  | { readonly ok: false; readonly kind: 'invalid_seed'; readonly message: string }
  | { readonly ok: false; readonly kind: 'module_not_found'; readonly moduleName: string }
  | {
      readonly ok: false;
      readonly kind: 'circular_include';
      readonly chain: readonly string[];
    }
  | {
      readonly ok: false;
      readonly kind: 'parse_error';
      readonly moduleName: string;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly kind: 'template_error';
      readonly sourcePath: string;
      readonly message: string;
    }
  | {
      readonly ok: false;
      readonly kind: 'storage_error';
      readonly moduleName: string;
      readonly message: string;
    }
  | { readonly ok: false; readonly kind: 'seed_error'; readonly message: string }
  | { readonly ok: false; readonly kind: 'render_budget'; readonly evaluationCount: number }
  | {
      readonly ok: false;
      readonly kind: 'include_depth';
      readonly moduleName: string;
      readonly depth: number;
    }
  | { readonly ok: false; readonly kind: 'include_limit'; readonly count: number };

/**
 * Resolve includes for a grammar, loading transitive dependencies from storage.
 * Merges included grammar rules into the base grammar (base rules take precedence).
 *
 * @param grammar - The base grammar.
 * @param storage - Storage port for loading included grammars.
 * @param visited - Set of already-visited grammar keys for cycle detection.
 * @param depth - Current include depth.
 * @returns Merged grammar with all includes resolved.
 */
async function resolveIncludes(
  grammar: Grammar,
  storage: StoragePort,
  visited: Set<string>,
  depth: number
): Promise<Grammar> {
  if (grammar.includes.length === 0) {
    return grammar;
  }

  const mergedRules = new Map<string, Rule>(grammar.rules);

  for (const includeKey of grammar.includes) {
    if (visited.has(includeKey)) {
      // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
      throw new CircularIncludeError([...visited, includeKey]);
    }

    if (depth + 1 > MAX_INCLUDE_DEPTH) {
      // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
      throw new IncludeDepthError(includeKey, depth + 1);
    }

    if (visited.size + 1 > MAX_INCLUDE_COUNT) {
      // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
      throw new IncludeLimitError(visited.size + 1);
    }

    const dto = await storage.load(includeKey);
    if (dto === null) {
      // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
      throw new StorageError(
        'module_not_found',
        `Included grammar "${includeKey}" not found in storage`
      );
    }

    const parseResult = grammarFromDto(dto);
    if (!parseResult.success) {
      // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
      throw parseResult.error;
    }

    visited.add(includeKey);
    const resolved = await resolveIncludes(parseResult.value, storage, visited, depth + 1);

    // Merge: base grammar rules take precedence over included rules
    for (const [name, rule] of resolved.rules) {
      if (!mergedRules.has(name)) {
        mergedRules.set(name, rule);
      }
    }
  }

  return Object.freeze({
    key: grammar.key,
    rules: mergedRules,
    includes: [],
    entry: grammar.entry,
  });
}

/**
 * Render a grammar story from a key and seed.
 *
 * Never throws — all errors are mapped to typed {@link RenderStoryResult} variants.
 *
 * @param request - The render request (grammar key + seed).
 * @param storage - Storage port for loading grammars.
 * @param randomPort - Port for seed hashing and RNG creation.
 * @param templateEngine - Port for evaluating template expressions.
 * @returns A typed result: success with text, or failure with error details.
 */
export async function renderStory(
  request: RenderStoryRequest,
  storage: StoragePort,
  randomPort: RandomPort,
  templateEngine: TemplateEnginePort
): Promise<RenderStoryResult> {
  try {
    // Validate seed length before other processing
    if (request.seed.length > MAX_SEED_LENGTH) {
      return {
        ok: false,
        kind: 'invalid_seed',
        message: `Seed exceeds maximum length of ${String(MAX_SEED_LENGTH)}`,
      };
    }

    // Validate seed (non-empty, non-whitespace)
    const seedResult = createSeed(request.seed);
    if (!seedResult.success) {
      return { ok: false, kind: 'invalid_seed', message: seedResult.error.message };
    }
    const seed: Seed = seedResult.value;

    // Load grammar from storage
    let dto;
    try {
      dto = await storage.load(request.grammarKey);
    } catch (storageErr: unknown) {
      const message = storageErr instanceof Error ? storageErr.message : 'Unknown storage error';
      return {
        ok: false,
        kind: 'storage_error',
        moduleName: request.grammarKey,
        message,
      };
    }
    if (dto === null) {
      return { ok: false, kind: 'module_not_found', moduleName: request.grammarKey };
    }

    // Parse DTO to domain Grammar
    const parseResult = grammarFromDto(dto);
    if (!parseResult.success) {
      return {
        ok: false,
        kind: 'parse_error',
        moduleName: request.grammarKey,
        message: parseResult.error.message,
      };
    }

    // Resolve includes
    const visited = new Set<string>([request.grammarKey]);
    const resolvedGrammar = await resolveIncludes(parseResult.value, storage, visited, 0);

    // Create transient render engine and render entry rule
    const engine = createRenderEngine(resolvedGrammar, randomPort, templateEngine, seed);
    const text = await engine.renderEntry();

    return { ok: true, text };
  } catch (error: unknown) {
    return mapErrorToResult(error, request.grammarKey);
  }
}

/**
 * Map a caught error to a typed RenderStoryResult variant.
 *
 * @param error - The caught error to classify.
 * @param grammarKey - The grammar key for contextual error messages.
 * @returns A typed error result variant.
 */
function mapErrorToResult(error: unknown, grammarKey: string): RenderStoryResult {
  if (error instanceof RenderBudgetError) {
    return { ok: false, kind: 'render_budget', evaluationCount: error.evaluationCount };
  }
  if (error instanceof CircularIncludeError) {
    return { ok: false, kind: 'circular_include', chain: error.chain };
  }
  if (error instanceof IncludeDepthError) {
    return {
      ok: false,
      kind: 'include_depth',
      moduleName: error.moduleName,
      depth: error.depth,
    };
  }
  if (error instanceof IncludeLimitError) {
    return { ok: false, kind: 'include_limit', count: error.count };
  }
  if (error instanceof GrammarParseError) {
    return {
      ok: false,
      kind: 'parse_error',
      moduleName: grammarKey,
      message: error.message,
    };
  }
  if (error instanceof TemplateError) {
    return {
      ok: false,
      kind: 'template_error',
      sourcePath: grammarKey,
      message: error.message,
    };
  }
  if (error instanceof StorageError) {
    return {
      ok: false,
      kind: 'storage_error',
      moduleName: grammarKey,
      message: error.message,
    };
  }
  // Seed hashing failure or any other unexpected error
  if (error instanceof Error) {
    // Check if this is a crypto/seed-related error from seedToInt
    return { ok: false, kind: 'seed_error', message: error.message };
  }
  return { ok: false, kind: 'seed_error', message: 'Unknown error during rendering' };
}
