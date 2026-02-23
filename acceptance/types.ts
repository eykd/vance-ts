/**
 * Acceptance test pipeline type definitions.
 *
 * These types represent the intermediate representation (IR) used to pass
 * structured data between pipeline stages (parse → generate).
 */

/**
 * A single GWT step (GIVEN, WHEN, or THEN) from a spec file.
 */
export interface Step {
  /** The GWT keyword: "GIVEN", "WHEN", or "THEN". */
  keyword: string;
  /** The step text (everything after the keyword and a space). */
  text: string;
  /** The 1-based line number in the source spec file. */
  line: number;
}

/**
 * A single scenario from a GWT spec file, consisting of a description and
 * its steps.
 */
export interface Scenario {
  /** The scenario description (the text after the leading `;` on a description line). */
  description: string;
  /** The steps belonging to this scenario, in order. */
  steps: Step[];
  /** The 1-based line number of the description line in the source spec file. */
  line: number;
}

/**
 * A parsed feature (spec file), containing all scenarios extracted from the
 * file.
 */
export interface Feature {
  /** The path to the source spec file, as passed to the parser. */
  sourceFile: string;
  /** The scenarios parsed from the file, in order. */
  scenarios: Scenario[];
}
