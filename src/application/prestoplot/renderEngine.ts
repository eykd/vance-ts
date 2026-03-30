/**
 * Per-render execution engine for grammar-based text generation.
 *
 * RenderEngine is transient — constructed fresh for each `render()` call.
 * It MUST NOT be stored as a singleton field. RenderContext is single-use:
 * once a render call completes (success or failure), the context is discarded.
 *
 * @module application/prestoplot/renderEngine
 */

import { RenderBudgetError, RenderError } from '../../domain/prestoplot/errors.js';
import type { Grammar, ListRule, TextRule } from '../../domain/prestoplot/grammar.js';
import { RenderStrategy, SelectionMode } from '../../domain/prestoplot/grammar.js';
import type { Seed } from '../../domain/prestoplot/seed.js';
import type { SelectionState } from '../../domain/prestoplot/selectionModes.js';
import {
  createSelectionState,
  selectList,
  selectPick,
  selectRatchet,
  selectReuse,
} from '../../domain/prestoplot/selectionModes.js';

import type { RandomPort, Rng } from './RandomSource.js';
import type { TemplateEnginePort } from './TemplateEngine.js';

/** Per-render work budget to prevent exponential-time grammar expansion. */
export const MAX_EVALUATIONS = 10_000;

/** Regex to match {{ ruleName }} references in template text. */
const RULE_REF_RE = /\{\{\s*(\w+)\s*\}\}/;

/**
 * Per-render runtime state. Single-use — discarded after each render call.
 */
interface RenderContext {
  /** Async SHA-256 results cache, keyed by scoped seed string. */
  readonly seedIntCache: Map<string, number>;
  /** Shared selection state for stateful modes (PICK, RATCHET). */
  readonly selectionState: SelectionState;
  /** Total rule evaluations in this render pass. */
  evaluationCount: number;
}

/**
 * Per-render execution engine. Resolves rules, evaluates templates,
 * manages selection state and seed scoping.
 */
export interface RenderEngine {
  /** Render the grammar's entry rule to a final string. */
  renderEntry(): Promise<string>;
}

/**
 * Creates a new RenderEngine for a single render pass.
 *
 * @param grammar - The resolved grammar (includes already merged).
 * @param randomPort - Port for seed hashing and RNG creation.
 * @param templateEngine - Port for evaluating template expressions.
 * @param seed - The base seed for this render.
 * @returns A RenderEngine that renders the grammar's entry rule.
 */
export function createRenderEngine(
  grammar: Grammar,
  randomPort: RandomPort,
  templateEngine: TemplateEnginePort,
  seed: Seed
): RenderEngine {
  const context: RenderContext = {
    seedIntCache: new Map(),
    selectionState: createSelectionState(),
    evaluationCount: 0,
  };

  /**
   * Cached seed-to-int conversion. Avoids redundant SHA-256 calls
   * for the same scoped seed within a single render pass.
   *
   * @param scopedSeed - The scoped seed string to convert.
   * @returns The integer hash of the scoped seed.
   */
  async function getSeedInt(scopedSeed: string): Promise<number> {
    const cached = context.seedIntCache.get(scopedSeed);
    if (cached !== undefined) {
      return cached;
    }
    const value = await randomPort.seedToInt(scopedSeed);
    context.seedIntCache.set(scopedSeed, value);
    return value;
  }

  /**
   * Creates a deterministic RNG for a given rule, scoped by base seed.
   *
   * @param ruleName - The rule name to scope the RNG seed.
   * @returns A deterministic RNG seeded for the given rule.
   */
  async function getRng(ruleName: string): Promise<Rng> {
    const scopedSeed = `${seed}-${ruleName}`;
    const seedInt = await getSeedInt(scopedSeed);
    return randomPort.createRng(seedInt);
  }

  /**
   * Select from weighted alternatives using RNG.
   *
   * @param alternatives - The weighted alternatives to choose from.
   * @param rng - The random number generator for selection.
   * @returns The selected alternative text.
   */
  function selectWeighted(alternatives: TextRule['alternatives'], rng: Rng): string {
    const totalWeight = alternatives.reduce((sum, alt) => sum + alt.weight, 0);
    let roll = rng.next() * totalWeight;
    for (const alt of alternatives) {
      roll -= alt.weight;
      if (roll <= 0) {
        return alt.text;
      }
    }
    // Fallback to last alternative (floating point edge case)
    return alternatives[alternatives.length - 1]!.text;
  }

  /**
   * Select an item from a list rule based on its selection mode.
   * Delegates to domain selection functions for REUSE, PICK, RATCHET, LIST.
   *
   * @param rule - The list rule to select an item from.
   * @returns The selected item string.
   */
  async function selectListItem(rule: ListRule): Promise<string> {
    switch (rule.selectionMode) {
      case SelectionMode.REUSE: {
        const rng = await getRng(rule.name);
        return selectReuse(rule.items, rng);
      }
      case SelectionMode.RATCHET: {
        return selectRatchet(rule.items, rule.name, context.selectionState);
      }
      case SelectionMode.LIST: {
        const count = context.selectionState.ratchetCounts.get(rule.name) ?? 0;
        context.selectionState.ratchetCounts.set(rule.name, count + 1);
        return selectList(rule.items, count);
      }
      case SelectionMode.PICK: {
        const rng = await getRng(rule.name);
        return selectPick(rule.items, rng, rule.name, context.selectionState);
      }
      case SelectionMode.MARKOV: {
        // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
        throw new RenderError('unsupported_mode', 'MARKOV selection mode is not yet implemented');
      }
    }
  }

  /**
   * Resolve template text by rendering rule references left-to-right,
   * then delegating remaining expressions to the template engine.
   *
   * Phase 1: Replace `{{ RuleName }}` where RuleName is a known grammar rule.
   * Each occurrence triggers a separate `renderRule` call, essential for
   * stateful selection modes (RATCHET, PICK) that advance on each call.
   *
   * Phase 2: Pass result through templateEngine.evaluate() for complex
   * expressions (dot-access, article accessors, comments).
   *
   * @param text - The template text containing rule references to resolve.
   * @returns The fully resolved template string.
   */
  async function resolveTemplate(text: string): Promise<string> {
    // Phase 1: resolve known grammar rule references left-to-right
    let result = text;
    const renderedCtx: Record<string, string> = {};
    let searchStart = 0;

    while (searchStart < result.length) {
      const remaining = result.slice(searchStart);
      const match = RULE_REF_RE.exec(remaining);
      if (match === null) {
        break;
      }

      const ref = match[1]!;
      if (grammar.rules.has(ref)) {
        // Known rule — render and replace inline
        const rendered = await renderRule(ref);
        renderedCtx[ref] = rendered;
        const absoluteIndex = searchStart + match.index;
        result =
          result.slice(0, absoluteIndex) + rendered + result.slice(absoluteIndex + match[0].length);
        searchStart = absoluteIndex + rendered.length;
      } else {
        // Not a known rule — skip past this match for template engine
        searchStart = searchStart + match.index + match[0].length;
      }
    }

    // Phase 2: delegate to template engine for remaining expressions
    return templateEngine.evaluate(result, renderedCtx, 0);
  }

  /**
   * Render a rule by name, incrementing the evaluation counter.
   *
   * @param ruleName - The name of the rule to render.
   * @returns The rendered string output of the rule.
   */
  async function renderRule(ruleName: string): Promise<string> {
    context.evaluationCount++;
    if (context.evaluationCount > MAX_EVALUATIONS) {
      // eslint-disable-next-line no-restricted-syntax -- caught by renderStory's never-throws contract
      throw new RenderBudgetError(context.evaluationCount);
    }

    const rule = grammar.rules.get(ruleName);
    if (rule === undefined) {
      return '';
    }

    let rawText: string;
    let strategy: RenderStrategy;

    switch (rule.type) {
      case 'text': {
        const rng = await getRng(rule.name);
        rawText = selectWeighted(rule.alternatives, rng);
        strategy = rule.strategy;
        break;
      }
      case 'list': {
        rawText = await selectListItem(rule);
        strategy = rule.strategy;
        break;
      }
      case 'struct': {
        // Struct: render fields into context, evaluate template
        const fieldCtx: Record<string, string> = {};
        for (const [fieldName, ruleRef] of rule.fields) {
          fieldCtx[fieldName] = await renderRule(ruleRef);
        }
        return templateEngine.evaluate(rule.template, fieldCtx, 0);
      }
    }

    if (strategy === RenderStrategy.TEMPLATE) {
      return resolveTemplate(rawText);
    }
    return rawText;
  }

  return {
    async renderEntry(): Promise<string> {
      return renderRule(grammar.entry);
    },
  };
}
