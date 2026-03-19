import type { Feature, Scenario, Step } from './types.js';

/**
 * Determines whether a line is a separator line.
 * Separator lines contain only `;` and `=` characters (non-empty after trim).
 *
 * @param line - The line to test.
 * @returns True if the line is a separator.
 */
function isSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.length > 0 && /^[;=]+$/.test(trimmed);
}

/**
 * Parses a GWT spec file content into a Feature object.
 *
 * This is a pure function — it performs no I/O.
 *
 * @param content - The full text content of the spec file.
 * @param sourcePath - The path to the source file (stored in the Feature).
 * @returns The parsed Feature containing all scenarios.
 */
export function parseSpec(content: string, sourcePath: string): Feature {
  const lines = content.split('\n');
  const scenarios: Scenario[] = [];

  let inBlock = false;
  let currentDescription: string | null = null;
  let currentLine = 0;
  let currentSteps: Step[] = [];

  const flushScenario = (): void => {
    if (currentDescription !== null) {
      scenarios.push({
        description: currentDescription,
        steps: currentSteps,
        line: currentLine,
      });
      currentDescription = null;
      currentSteps = [];
      currentLine = 0;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    /* c8 ignore next */
    const line = lines[i] ?? '';
    const lineNum = i + 1;

    if (isSeparatorLine(line)) {
      if (inBlock && currentSteps.length > 0) {
        // A separator after accumulated steps means a new block is starting — flush.
        // A separator with no steps is either an opening bar or the closing bar of
        // a header block (;=== / ; Description / ;=== / steps...).
        flushScenario();
      }
      inBlock = true;
      continue;
    }

    if (!inBlock) continue;

    if (line.startsWith(';')) {
      // Description line (non-separator starting with ;)
      if (currentDescription === null) {
        currentDescription = line.slice(1).trim();
        currentLine = lineNum;
      }
      continue;
    }

    const stepMatch = /^(GIVEN|WHEN|THEN) (.+)$/.exec(line);
    if (stepMatch !== null) {
      // Regex capture groups are guaranteed non-null after a successful match
      const keyword = stepMatch[1] as string;
      const text = stepMatch[2] as string;
      currentSteps.push({ keyword, text, line: lineNum });
    }
  }

  // Flush last scenario
  flushScenario();

  return { sourceFile: sourcePath, scenarios };
}
