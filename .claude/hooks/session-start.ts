import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

interface SessionStartInput {
  type: 'start' | 'resume' | 'compact';
}

interface SessionStartOutput {
  result: 'continue';
  message?: string;
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function findMostRecentLedger(): string | null {
  const ledgersDir = join(process.cwd(), 'thoughts', 'ledgers');

  if (!existsSync(ledgersDir)) {
    return null;
  }

  const files = readdirSync(ledgersDir)
    .filter((file) => file.startsWith('CONTINUITY_CLAUDE-') && file.endsWith('.md'))
    .map((file) => ({
      name: file,
      path: join(ledgersDir, file),
      mtime: statSync(join(ledgersDir, file)).mtime,
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

  if (files.length === 0) {
    return null;
  }

  return files[0].path;
}

async function main() {
  const input: SessionStartInput = JSON.parse(await readStdin());

  const output: SessionStartOutput = {
    result: 'continue',
  };

  // Only load ledger on resume or start after compact
  if (input.type === 'resume' || input.type === 'compact') {
    const ledgerPath = findMostRecentLedger();

    if (ledgerPath) {
      const ledgerContent = readFileSync(ledgerPath, 'utf-8');

      output.message = `📋 Continuity Ledger Loaded

${ledgerContent}

---

The ledger above contains your current session state. Review the "In Progress" section to see what you were working on.`;
    }
  }

  console.log(JSON.stringify(output));
}

main().catch((error) => {
  console.error(JSON.stringify({ result: 'continue', message: `Error loading ledger: ${error.message}` }));
  process.exit(0);
});
