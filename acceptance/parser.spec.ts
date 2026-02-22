import { describe, expect, it } from 'vitest';

import { parseSpec } from './parser';

describe('parseSpec', () => {
  it('returns empty scenarios for empty content', () => {
    const feature = parseSpec('', 'test.txt');
    expect(feature.sourceFile).toBe('test.txt');
    expect(feature.scenarios).toHaveLength(0);
  });

  it('returns empty scenarios for content with no separators', () => {
    const feature = parseSpec('GIVEN something.\nWHEN action.\nTHEN result.', 'test.txt');
    expect(feature.scenarios).toHaveLength(0);
  });

  it('returns empty scenarios for a separator with no description', () => {
    const feature = parseSpec(';===\n', 'test.txt');
    expect(feature.scenarios).toHaveLength(0);
  });

  it('returns one scenario with empty steps for separator + description only', () => {
    const content = ';===\n; My scenario.\n';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(1);
    expect(feature.scenarios[0]?.description).toBe('My scenario.');
    expect(feature.scenarios[0]?.steps).toHaveLength(0);
    expect(feature.scenarios[0]?.line).toBe(2);
  });

  it('parses a scenario with all three step keywords', () => {
    const content = [
      ';===',
      '; Author does something.',
      'GIVEN a precondition.',
      'WHEN an action occurs.',
      'THEN an outcome is observed.',
    ].join('\n');
    const feature = parseSpec(content, 'specs/US01.txt');

    expect(feature.sourceFile).toBe('specs/US01.txt');
    expect(feature.scenarios).toHaveLength(1);

    const scenario = feature.scenarios[0];
    expect(scenario?.description).toBe('Author does something.');
    expect(scenario?.steps).toHaveLength(3);

    expect(scenario?.steps[0]?.keyword).toBe('GIVEN');
    expect(scenario?.steps[0]?.text).toBe('a precondition.');
    expect(scenario?.steps[0]?.line).toBe(3);

    expect(scenario?.steps[1]?.keyword).toBe('WHEN');
    expect(scenario?.steps[1]?.text).toBe('an action occurs.');
    expect(scenario?.steps[1]?.line).toBe(4);

    expect(scenario?.steps[2]?.keyword).toBe('THEN');
    expect(scenario?.steps[2]?.text).toBe('an outcome is observed.');
    expect(scenario?.steps[2]?.line).toBe(5);
  });

  it('trims description text after leading semicolon', () => {
    const content = ';===\n;   Padded description.  \n';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios[0]?.description).toBe('Padded description.');
  });

  it('records correct line numbers for description and steps', () => {
    const content = ';===\n; First scenario.\nGIVEN line 3 step.';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios[0]?.line).toBe(2);
    expect(feature.scenarios[0]?.steps[0]?.line).toBe(3);
  });

  it('ignores lines before the first separator', () => {
    const content = 'ignored line\n;===\n; Valid scenario.\nGIVEN step.';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(1);
    expect(feature.scenarios[0]?.description).toBe('Valid scenario.');
  });

  it('ignores non-step, non-description lines inside a block', () => {
    const content = [
      ';===',
      '; Scenario.',
      'GIVEN step.',
      '',
      'some random line',
      'THEN outcome.',
    ].join('\n');
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios[0]?.steps).toHaveLength(2);
    expect(feature.scenarios[0]?.steps[0]?.keyword).toBe('GIVEN');
    expect(feature.scenarios[0]?.steps[1]?.keyword).toBe('THEN');
  });

  it('parses multiple scenarios separated by separator lines', () => {
    const content = [
      ';===',
      '; First scenario.',
      'GIVEN first.',
      ';===',
      '; Second scenario.',
      'WHEN second.',
    ].join('\n');
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(2);
    expect(feature.scenarios[0]?.description).toBe('First scenario.');
    expect(feature.scenarios[1]?.description).toBe('Second scenario.');
  });

  it('handles multiple consecutive separators as a single block boundary', () => {
    const content = [';===', ';===', '; Scenario after double separator.', 'GIVEN step.'].join(
      '\n'
    );
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(1);
    expect(feature.scenarios[0]?.description).toBe('Scenario after double separator.');
  });

  it('ignores additional description lines after the first', () => {
    const content = [
      ';===',
      '; First description line.',
      '; Second description line (ignored).',
      'GIVEN step.',
    ].join('\n');
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios[0]?.description).toBe('First description line.');
  });

  it('flushes last scenario at end of input without trailing separator', () => {
    const content = ';===\n; Last scenario.\nTHEN result.';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(1);
    expect(feature.scenarios[0]?.description).toBe('Last scenario.');
  });

  it('handles separator with mixed ; and = characters', () => {
    const content = ';;===;;;\n; Valid scenario.\n';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(1);
  });

  it('handles whitespace-only lines inside a block without error', () => {
    const content = ';===\n; Scenario.\n   \nGIVEN step.';
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios[0]?.steps).toHaveLength(1);
  });

  it('parses a scenario with a closing header separator (;=== / ; Desc / ;=== / steps)', () => {
    const content = [
      ';=============================================',
      '; Author views the health status.',
      ';=============================================',
      'GIVEN the service is running.',
      'WHEN the user checks the health endpoint.',
      'THEN the response shows status ok.',
    ].join('\n');
    const feature = parseSpec(content, 'specs/US01.txt');
    expect(feature.scenarios).toHaveLength(1);
    expect(feature.scenarios[0]?.description).toBe('Author views the health status.');
    expect(feature.scenarios[0]?.steps).toHaveLength(3);
    expect(feature.scenarios[0]?.steps[0]?.keyword).toBe('GIVEN');
    expect(feature.scenarios[0]?.steps[1]?.keyword).toBe('WHEN');
    expect(feature.scenarios[0]?.steps[2]?.keyword).toBe('THEN');
  });

  it('parses multiple scenarios each with closing header separators', () => {
    const content = [
      ';===',
      '; First scenario.',
      ';===',
      'GIVEN first step.',
      ';===',
      '; Second scenario.',
      ';===',
      'WHEN second step.',
    ].join('\n');
    const feature = parseSpec(content, 'test.txt');
    expect(feature.scenarios).toHaveLength(2);
    expect(feature.scenarios[0]?.description).toBe('First scenario.');
    expect(feature.scenarios[0]?.steps).toHaveLength(1);
    expect(feature.scenarios[1]?.description).toBe('Second scenario.');
    expect(feature.scenarios[1]?.steps).toHaveLength(1);
  });
});
