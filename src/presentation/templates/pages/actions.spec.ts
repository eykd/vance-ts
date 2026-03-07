import { describe, expect, it } from 'vitest';

import { actionsPage } from './actions.js';

describe('actionsPage', () => {
  it('renders a complete HTML document with Actions heading', () => {
    const result = actionsPage({ actions: [] });

    expect(result).toMatch(/^<!DOCTYPE html>/);
    expect(result).toContain('<h1>Actions</h1>');
  });

  it('renders each action with its title and status', () => {
    const result = actionsPage({
      actions: [
        { id: 'a1', title: 'Buy groceries', status: 'active' },
        { id: 'a2', title: 'Fix bike', status: 'inactive' },
      ],
    });

    expect(result).toContain('data-id="a1"');
    expect(result).toContain('Buy groceries');
    expect(result).toContain('data-id="a2"');
    expect(result).toContain('Fix bike');
    expect(result).toContain('active');
    expect(result).toContain('inactive');
  });

  it('renders an Activate button with hx-post for inactive actions', () => {
    const result = actionsPage({
      actions: [{ id: 'a1', title: 'Buy groceries', status: 'inactive' }],
    });

    expect(result).toContain('hx-post="/app/_/actions/a1/activate"');
    expect(result).toContain('>Activate</button>');
  });

  it('renders an Activate button for ready actions', () => {
    const result = actionsPage({
      actions: [{ id: 'a1', title: 'Buy groceries', status: 'ready' }],
    });

    expect(result).toContain('hx-post="/app/_/actions/a1/activate"');
    expect(result).toContain('>Activate</button>');
  });

  it('renders a Complete button with hx-post for active actions', () => {
    const result = actionsPage({
      actions: [{ id: 'a1', title: 'Buy groceries', status: 'active' }],
    });

    expect(result).toContain('hx-post="/app/_/actions/a1/complete"');
    expect(result).toContain('>Complete</button>');
  });

  it('does not render a Complete button for inactive actions', () => {
    const result = actionsPage({
      actions: [{ id: 'a1', title: 'Buy groceries', status: 'inactive' }],
    });

    expect(result).not.toContain('>Complete</button>');
  });
});
