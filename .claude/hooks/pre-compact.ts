interface PreCompactInput {
  manuallyInvoked: boolean;
  contextUsagePercent: number;
}

interface PreCompactOutput {
  result: 'continue' | 'block';
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

async function main() {
  const input: PreCompactInput = JSON.parse(await readStdin());

  const output: PreCompactOutput = {
    result: 'continue',
  };

  // If manually invoked, prompt user to save ledger first
  if (input.manuallyInvoked) {
    output.result = 'block';
    output.message = `⚠️ Manual Compaction Blocked

Please save your session state first:

1. Review your current progress
2. Save to ledger with /continuity_ledger or manually create a ledger file
3. Then run /compact again

Compaction is lossy - save state first!`;
  } else {
    // Auto-triggered compaction - warn but allow
    output.message = `🚨 Auto-Compaction Triggered at ${input.contextUsagePercent}%

RECOMMENDATION: Consider using /clear instead:
1. Save current state to ledger
2. Run /clear for fresh context
3. Ledger will auto-load on resume

Auto-compaction is lossy. For better quality, use ledger + /clear workflow.`;
  }

  console.log(JSON.stringify(output));
}

main().catch((error) => {
  console.error(JSON.stringify({ result: 'continue', message: `Error in PreCompact hook: ${error.message}` }));
  process.exit(0);
});
