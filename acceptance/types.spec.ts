import { describe, it, expect } from 'vitest';

import type { Feature, Scenario, Step } from './types';

describe('types', () => {
  it('Step has keyword, text, and line fields', () => {
    const step: Step = { keyword: 'GIVEN', text: 'something exists.', line: 5 };
    expect(step.keyword).toBe('GIVEN');
    expect(step.text).toBe('something exists.');
    expect(step.line).toBe(5);
  });

  it('Scenario has description, steps, and line fields', () => {
    const step: Step = { keyword: 'WHEN', text: 'action occurs.', line: 7 };
    const scenario: Scenario = {
      description: 'User performs action.',
      steps: [step],
      line: 6,
    };
    expect(scenario.description).toBe('User performs action.');
    expect(scenario.steps).toHaveLength(1);
    expect(scenario.line).toBe(6);
  });

  it('Feature has sourceFile and scenarios fields', () => {
    const feature: Feature = {
      sourceFile: 'specs/acceptance-specs/US01-example.txt',
      scenarios: [],
    };
    expect(feature.sourceFile).toBe('specs/acceptance-specs/US01-example.txt');
    expect(feature.scenarios).toHaveLength(0);
  });
});
