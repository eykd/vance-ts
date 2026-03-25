import { describe, expect, it } from 'vitest';

import { dashboardPage } from './dashboard';

describe('dashboardPage', () => {
  describe('with zero counts', () => {
    const result = dashboardPage({ inboxCount: 0, actionCount: 0 });

    it('renders a complete HTML document', () => {
      expect(result).toMatch(/^<!DOCTYPE html>/);
    });

    it('renders the inbox count', () => {
      expect(result).toContain('0');
    });

    it('renders the action count', () => {
      expect(result).toContain('0');
    });

    it('renders a quick capture form', () => {
      expect(result).toContain('name="title"');
    });

    it('quick capture form posts to the inbox partial endpoint', () => {
      expect(result).toContain('hx-post="/app/_/inbox/capture"');
    });

    it('quick capture form targets the captured-items list', () => {
      expect(result).toContain('hx-target="#captured-items"');
    });

    it('quick capture form appends new items', () => {
      expect(result).toContain('hx-swap="beforeend"');
    });

    it('quick capture form resets after successful submission', () => {
      expect(result).toContain('hx-on::after-request="if(event.detail.successful) this.reset()"');
    });

    it('renders an empty captured-items list', () => {
      expect(result).toContain('id="captured-items"');
    });
  });

  describe('with non-zero counts', () => {
    const result = dashboardPage({ inboxCount: 5, actionCount: 3 });

    it('displays the inbox count value', () => {
      expect(result).toContain('5');
    });

    it('displays the action count value', () => {
      expect(result).toContain('3');
    });
  });
});
