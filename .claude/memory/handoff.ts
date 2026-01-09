import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Handoff outcome status
 */
export type HandoffOutcome = 'SUCCESS' | 'PARTIAL_PLUS' | 'PARTIAL' | 'BLOCKED';

/**
 * Handoff represents a detailed session handoff for cross-session continuity
 */
export class Handoff {
  sessionId: string;
  created: Date;
  outcome: HandoffOutcome;
  contextSummary: string;
  recentChanges: string[];
  whatWorked: string[];
  whatFailed: string[];
  patternsDiscovered: string[];
  nextSteps: string[];
  openQuestions: string[];

  private static readonly HANDOFFS_DIR = 'thoughts/handoffs';

  /**
   * Creates a new handoff instance
   *
   * @param sessionId - The session ID for this handoff
   */
  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.created = new Date();
    this.outcome = 'PARTIAL_PLUS';
    this.contextSummary = '';
    this.recentChanges = [];
    this.whatWorked = [];
    this.whatFailed = [];
    this.patternsDiscovered = [];
    this.nextSteps = [];
    this.openQuestions = [];
  }

  /**
   * Converts the handoff to markdown format with YAML frontmatter
   *
   * @returns Markdown string representation of the handoff
   */
  toMarkdown(): string {
    const sections: string[] = [];

    // Frontmatter
    sections.push('---');
    sections.push(`session_id: ${this.sessionId}`);
    sections.push(`created: ${this.created.toISOString()}`);
    sections.push(`outcome: ${this.outcome}`);
    sections.push('---');
    sections.push('');

    // Title
    sections.push('# Session Handoff');
    sections.push('');

    // Context Summary
    sections.push('## Context Summary');
    sections.push(this.contextSummary === '' ? '' : this.contextSummary);
    sections.push('');

    // Recent Changes
    sections.push('## Recent Changes');
    this.recentChanges.forEach((change) => {
      sections.push(`- ${change}`);
    });
    sections.push('');

    // What Worked
    sections.push('## What Worked');
    this.whatWorked.forEach((item) => {
      sections.push(`- ${item}`);
    });
    sections.push('');

    // What Failed / Blockers
    sections.push('## What Failed / Blockers');
    this.whatFailed.forEach((item) => {
      sections.push(`- ${item}`);
    });
    sections.push('');

    // Patterns Discovered
    sections.push('## Patterns Discovered');
    this.patternsDiscovered.forEach((pattern) => {
      sections.push(`- ${pattern}`);
    });
    sections.push('');

    // Next Steps
    sections.push('## Next Steps');
    this.nextSteps.forEach((step) => {
      sections.push(`- ${step}`);
    });
    sections.push('');

    // Open Questions
    sections.push('## Open Questions');
    this.openQuestions.forEach((question) => {
      sections.push(`- ${question}`);
    });

    return sections.join('\n');
  }

  /**
   * Saves the handoff to a timestamped file in the session's handoff directory
   */
  save(): void {
    const sessionDir = join(Handoff.HANDOFFS_DIR, this.sessionId);

    if (!existsSync(sessionDir)) {
      mkdirSync(sessionDir, { recursive: true });
    }

    const timestamp = this.created.toISOString();
    const filename = `handoff-${timestamp}.md`;
    const filePath = join(sessionDir, filename);

    const content = this.toMarkdown();
    writeFileSync(filePath, content, 'utf-8');
  }
}
