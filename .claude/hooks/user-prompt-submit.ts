interface UserPromptSubmitInput {
  prompt: string;
  contextUsagePercent: number;
}

interface UserPromptSubmitOutput {
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

async function main() {
  const input: UserPromptSubmitInput = JSON.parse(await readStdin());

  const output: UserPromptSubmitOutput = {
    result: 'continue',
  };

  const percent = input.contextUsagePercent;

  // Tiered warnings based on context usage
  if (percent >= 90) {
    output.message = `🚨 CONTEXT CRITICAL: ${percent}%

ACTION REQUIRED NOW:
1. Save your work to a continuity ledger immediately
2. Run /clear to reset context
3. Ledger will auto-load on resume

Auto-compaction is imminent and lossy!`;
  } else if (percent >= 80) {
    output.message = `⚠️ CONTEXT HIGH: ${percent}%

RECOMMENDED: Save ledger and /clear soon
- Context quality degrades above 80%
- Auto-compaction may trigger
- Use ledger + /clear for fresh context`;
  } else if (percent >= 70) {
    output.message = `💡 Context at ${percent}%

Consider creating a handoff when you reach a stopping point.
Clearing context proactively maintains quality.`;
  }

  console.log(JSON.stringify(output));
}

main().catch((error) => {
  console.error(JSON.stringify({ result: 'continue', message: `Error in UserPromptSubmit hook: ${error.message}` }));
  process.exit(0);
});
