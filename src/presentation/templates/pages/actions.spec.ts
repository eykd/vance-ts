import { describe, expect, it } from 'vitest';

import { actionsPage } from './actions.js';

describe('actionsPage', () => {
  it('renders a complete HTML document with Actions heading', () => {
    const result = actionsPage({ actions: [] });

    expect(result).toMatch(/^<!DOCTYPE html>/);
    expect(result).toContain('<h1>Actions</h1>');
  });
});
