import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Ledger represents a session continuity ledger for preserving state across context clears
 */
export class Ledger {
  sessionName: string;
  goal: string;
  constraints: string[];
  completed: string[];
  inProgress: string[];
  keyDecisions: string[];
  workingFiles: string[];

  private static readonly LEDGERS_DIR = 'thoughts/ledgers';

  /**
   * Creates a new ledger instance
   *
   * @param sessionName - The name of the session for this ledger
   */
  constructor(sessionName: string) {
    this.sessionName = sessionName;
    this.goal = '';
    this.constraints = [];
    this.completed = [];
    this.inProgress = [];
    this.keyDecisions = [];
    this.workingFiles = [];
  }

  /**
   * Converts the ledger to markdown format
   *
   * @returns Markdown string representation of the ledger
   */
  toMarkdown(): string {
    const sections: string[] = ['# Session Continuity Ledger', ''];

    sections.push('## Current Goal');
    sections.push(this.goal === '' ? '' : this.goal);
    sections.push('');

    sections.push('## Constraints');
    this.constraints.forEach((constraint) => {
      sections.push(`- ${constraint}`);
    });
    sections.push('');

    sections.push('## Completed');
    this.completed.forEach((item) => {
      sections.push(`- [x] ${item}`);
    });
    sections.push('');

    sections.push('## In Progress');
    this.inProgress.forEach((item) => {
      sections.push(`- [ ] ${item}`);
    });
    sections.push('');

    sections.push('## Key Decisions');
    this.keyDecisions.forEach((decision) => {
      sections.push(`- ${decision}`);
    });
    sections.push('');

    sections.push('## Working Files');
    this.workingFiles.forEach((file) => {
      sections.push(`- ${file}`);
    });

    return sections.join('\n');
  }

  /**
   * Saves the ledger to a file in the ledgers directory
   */
  save(): void {
    const filePath = join(Ledger.LEDGERS_DIR, `CONTINUITY_CLAUDE-${this.sessionName}.md`);
    const content = this.toMarkdown();
    writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * Loads a ledger from a file
   *
   * @param sessionName - The name of the session to load
   * @returns The loaded ledger instance
   */
  static load(sessionName: string): Ledger {
    const filePath = join(Ledger.LEDGERS_DIR, `CONTINUITY_CLAUDE-${sessionName}.md`);

    if (!existsSync(filePath)) {
      throw new Error(`Ledger file not found: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    const ledger = new Ledger(sessionName);

    const lines = content.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const lineContent = lines[i];
      if (lineContent === undefined) {
        continue;
      }
      const line = lineContent.trim();

      if (line.startsWith('## ')) {
        currentSection = line.substring(3);
        continue;
      }

      if (line === '' || line.startsWith('#')) {
        continue;
      }

      switch (currentSection) {
        case 'Current Goal':
          ledger.goal = line;
          break;
        case 'Constraints':
          if (line.startsWith('- ')) {
            ledger.constraints.push(line.substring(2));
          }
          break;
        case 'Completed':
          if (line.startsWith('- [x] ')) {
            ledger.completed.push(line.substring(6));
          }
          break;
        case 'In Progress':
          if (line.startsWith('- [ ] ')) {
            ledger.inProgress.push(line.substring(6));
          }
          break;
        case 'Key Decisions':
          if (line.startsWith('- ')) {
            ledger.keyDecisions.push(line.substring(2));
          }
          break;
        case 'Working Files':
          if (line.startsWith('- ')) {
            ledger.workingFiles.push(line.substring(2));
          }
          break;
      }
    }

    return ledger;
  }
}
