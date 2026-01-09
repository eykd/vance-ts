interface StatusLineInput {
  contextUsagePercent: number;
  contextUsageTokens: number;
}

interface StatusLineOutput {
  text: string;
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

function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

async function main() {
  const input: StatusLineInput = JSON.parse(await readStdin());

  const percent = input.contextUsagePercent;
  const tokens = formatTokens(input.contextUsageTokens);

  // Color-coded status indicator
  let indicator: string;
  if (percent >= 80) {
    indicator = '🔴';
  } else if (percent >= 60) {
    indicator = '🟡';
  } else {
    indicator = '🟢';
  }

  const output: StatusLineOutput = {
    text: `${indicator} ${tokens} ${percent}%`,
  };

  console.log(JSON.stringify(output));
}

main().catch((error) => {
  console.error(JSON.stringify({ text: 'Error' }));
  process.exit(0);
});
