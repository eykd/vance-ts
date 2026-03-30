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
  ModuleNotFoundError,
  RenderBudgetError,
  StorageError,
  TemplateError,
} from '../../domain/prestoplot/errors.js';
import type { Grammar, Rule } from '../../domain/prestoplot/grammar.js';
import { createSeed } from '../../domain/prestoplot/seed.js';
import type { Seed } from '../../domain/prestoplot/seed.js';

import { GRAMMAR_KEY_PATTERN } from './constants.js';
import { grammarFromDto } from './dto.js';
import type { GrammarDto, StoragePort } from './GrammarStorage.js';
import type { RandomPort } from './RandomSource.js';
import { createRenderEngine } from './renderEngine.js';
import type { TemplateEnginePort } from './TemplateEngine.js';

/** Re-export GRAMMAR_KEY_PATTERN for backward-compatible public API. */
export { GRAMMAR_KEY_PATTERN };

/**
 * Grammar key length guard. Prevents abuse from extremely long key strings
 * before reaching storage.
 */
export const MAX_GRAMMAR_KEY_LENGTH = 128;

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
  | { readonly success: true; readonly text: string }
  | { readonly success: false; readonly kind: 'invalid_key'; readonly message: string }
  | { readonly success: false; readonly kind: 'invalid_seed'; readonly message: string }
  | { readonly success: false; readonly kind: 'module_not_found'; readonly moduleName: string }
  | {
      readonly success: false;
      readonly kind: 'circular_include';
      readonly chain: readonly string[];
    }
  | {
      readonly success: false;
      readonly kind: 'parse_error';
      readonly moduleName: string;
      readonly message: string;
    }
  | {
      readonly success: false;
      readonly kind: 'template_error';
      readonly sourcePath: string;
      readonly message: string;
    }
  | {
      readonly success: false;
      readonly kind: 'storage_error';
      readonly moduleName: string;
      readonly message: string;
    }
  | { readonly success: false; readonly kind: 'seed_error'; readonly message: string }
  | { readonly success: false; readonly kind: 'render_budget'; readonly evaluationCount: number }
  | {
      readonly success: false;
      readonly kind: 'include_depth';
      readonly moduleName: string;
      readonly depth: number;
    }
  | { readonly success: false; readonly kind: 'include_limit'; readonly count: number };

/** BFS queue entry for include resolution. */
interface IncludeQueueEntry {
  /** The grammar whose includes need processing. */
  readonly grammar: Grammar;
  /** Current depth in the include tree. */
  readonly depth: number;
  /** Path from root to this grammar (for cycle detection). Also passed as the chain to {@link CircularIncludeError} when a cycle is found. */
  readonly path: readonly string[];
}

/**
 * Validate that all StructRule field references point to rules that exist
 * in the merged rules map. Throws GrammarParseError if a reference is dangling.
 *
 * @param rules - The merged rules map after include resolution.
 * @param grammarKey - The root grammar key for error messages.
 */
function validateStructRuleReferences(rules: ReadonlyMap<string, Rule>, grammarKey: string): void {
  for (const [ruleName, rule] of rules) {
    if (rule.type === 'struct') {
      for (const [fieldName, ruleRef] of rule.fields) {
        if (!rules.has(ruleRef)) {
          // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
          throw new GrammarParseError(
            'missing_field_reference',
            `Grammar "${grammarKey}": StructRule "${ruleName}" field "${fieldName}" references rule "${ruleRef}" which does not exist after include resolution`
          );
        }
      }
    }
  }
}

/**
 * Resolve includes for a grammar using BFS left-to-right traversal.
 *
 * Loads each BFS level in parallel via Promise.all. Uses a path stack for
 * circular include detection and a seen set for diamond dedup.
 * Merges included grammar rules into the base grammar (base rules take
 * precedence, then left-to-right among includes).
 *
 * After resolution, validates that StructRule field references resolve to
 * rules present in the merged set.
 *
 * @param grammar - The base grammar.
 * @param storage - Storage port for loading included grammars.
 * @param rootKey - The root grammar key (for the seen set).
 * @returns Merged grammar with all includes resolved.
 */
async function resolveIncludes(
  grammar: Grammar,
  storage: StoragePort,
  rootKey: string
): Promise<Grammar> {
  if (grammar.includes.length === 0) {
    validateStructRuleReferences(grammar.rules, grammar.key);
    return grammar;
  }

  const mergedRules = new Map<string, Rule>(grammar.rules);
  const seen = new Set<string>([rootKey]);

  let queue: IncludeQueueEntry[] = [{ grammar, depth: 0, path: [rootKey] }];

  while (queue.length > 0) {
    /** Pending loads for this BFS level, preserving left-to-right order. */
    const batch: { key: string; depth: number; path: readonly string[] }[] = [];

    for (const entry of queue) {
      for (const includeKey of entry.grammar.includes) {
        // Cycle: key appears in the path from root to current node
        if (entry.path.includes(includeKey)) {
          // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
          throw new CircularIncludeError([...entry.path, includeKey]);
        }

        // Diamond dedup: already visited via another branch
        if (seen.has(includeKey)) {
          continue;
        }

        const nextDepth = entry.depth + 1;
        if (nextDepth > MAX_INCLUDE_DEPTH) {
          // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
          throw new IncludeDepthError(includeKey, nextDepth);
        }

        seen.add(includeKey);
        if (seen.size > MAX_INCLUDE_COUNT) {
          // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
          throw new IncludeLimitError(seen.size);
        }

        batch.push({
          key: includeKey,
          depth: nextDepth,
          path: [...entry.path, includeKey],
        });
      }
    }

    if (batch.length === 0) {
      break;
    }

    // Parallel load all includes in this BFS level
    const dtos = await Promise.all(batch.map((b) => storage.load(b.key)));

    const nextQueue: IncludeQueueEntry[] = [];

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i]!;
      const dto = dtos[i] ?? null;

      if (dto === null) {
        // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
        throw new ModuleNotFoundError(item.key);
      }

      const parseResult = grammarFromDto(dto);
      if (!parseResult.success) {
        // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
        throw parseResult.error;
      }

      // Merge rules: first occurrence wins (parent > left include > right include)
      for (const [name, rule] of parseResult.value.rules) {
        if (!mergedRules.has(name)) {
          mergedRules.set(name, rule);
        }
      }

      // Enqueue for next BFS level if this grammar has its own includes
      if (parseResult.value.includes.length > 0) {
        nextQueue.push({
          grammar: parseResult.value,
          depth: item.depth,
          path: item.path,
        });
      }
    }

    queue = nextQueue;
  }

  validateStructRuleReferences(mergedRules, grammar.key);

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
    // Validate grammar key length and format before storage call
    if (request.grammarKey.length > MAX_GRAMMAR_KEY_LENGTH) {
      return {
        success: false,
        kind: 'invalid_key',
        message: `Grammar key exceeds maximum length of ${String(MAX_GRAMMAR_KEY_LENGTH)}`,
      };
    }
    if (!GRAMMAR_KEY_PATTERN.test(request.grammarKey)) {
      return {
        success: false,
        kind: 'invalid_key',
        message: `Grammar key "${request.grammarKey}" must match pattern ${GRAMMAR_KEY_PATTERN.toString()}`,
      };
    }

    // Validate seed length before other processing
    if (request.seed.length > MAX_SEED_LENGTH) {
      return {
        success: false,
        kind: 'invalid_seed',
        message: `Seed exceeds maximum length of ${String(MAX_SEED_LENGTH)}`,
      };
    }

    // Validate seed (non-empty, non-whitespace)
    const seedResult = createSeed(request.seed);
    if (!seedResult.success) {
      return { success: false, kind: 'invalid_seed', message: seedResult.error.message };
    }
    const seed: Seed = seedResult.value;

    // Load grammar from storage
    let dto: GrammarDto | null;
    try {
      dto = await storage.load(request.grammarKey);
    } catch (storageErr: unknown) {
      const message = storageErr instanceof Error ? storageErr.message : 'Unknown storage error';
      return {
        success: false,
        kind: 'storage_error',
        moduleName: request.grammarKey,
        message,
      };
    }
    if (dto === null) {
      return { success: false, kind: 'module_not_found', moduleName: request.grammarKey };
    }

    // Parse DTO to domain Grammar
    const parseResult = grammarFromDto(dto);
    if (!parseResult.success) {
      return {
        success: false,
        kind: 'parse_error',
        moduleName: request.grammarKey,
        message: parseResult.error.message,
      };
    }

    // Resolve includes (BFS, parallel per level)
    const resolvedGrammar = await resolveIncludes(parseResult.value, storage, request.grammarKey);

    // Create transient render engine and render entry rule
    const engine = createRenderEngine(resolvedGrammar, randomPort, templateEngine, seed);
    const text = await engine.renderEntry();

    return { success: true, text };
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
    return { success: false, kind: 'render_budget', evaluationCount: error.evaluationCount };
  }
  if (error instanceof CircularIncludeError) {
    return { success: false, kind: 'circular_include', chain: error.chain };
  }
  if (error instanceof IncludeDepthError) {
    return {
      success: false,
      kind: 'include_depth',
      moduleName: error.moduleName,
      depth: error.depth,
    };
  }
  if (error instanceof IncludeLimitError) {
    return { success: false, kind: 'include_limit', count: error.count };
  }
  if (error instanceof GrammarParseError) {
    return {
      success: false,
      kind: 'parse_error',
      moduleName: grammarKey,
      message: error.message,
    };
  }
  if (error instanceof TemplateError) {
    return {
      success: false,
      kind: 'template_error',
      sourcePath: grammarKey,
      message: error.message,
    };
  }
  if (error instanceof ModuleNotFoundError) {
    return { success: false, kind: 'module_not_found', moduleName: error.moduleName };
  }
  if (error instanceof StorageError) {
    return {
      success: false,
      kind: 'storage_error',
      moduleName: grammarKey,
      message: error.message,
    };
  }
  // Seed hashing failure or any other unexpected error
  if (error instanceof Error) {
    // Check if this is a crypto/seed-related error from seedToInt
    return { success: false, kind: 'seed_error', message: error.message };
  }
  return { success: false, kind: 'seed_error', message: 'Unknown error during rendering' };
}
