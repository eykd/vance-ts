# Request Verification

**Purpose**: Secure Slack request signature verification

**When to read**: Implementing webhook endpoints

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 6)

---

## Overview

Slack signs every request with HMAC-SHA256. Your worker must verify signatures before processing any request.

**Signature format**: `v0=<hex-encoded-hmac>`

**Base string**: `v0:timestamp:body`

---

## SlackRequestVerifier Implementation

```typescript
// src/infrastructure/slack/SlackRequestVerifier.ts

export interface SlackRequestVerifierConfig {
  signingSecret: string;
  timestampToleranceSeconds?: number;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  body?: string;
}

export class SlackRequestVerifier {
  private readonly signingSecret: string;
  private readonly timestampTolerance: number;

  constructor(config: SlackRequestVerifierConfig) {
    this.signingSecret = config.signingSecret;
    this.timestampTolerance = config.timestampToleranceSeconds ?? 300;
  }

  async verify(request: Request): Promise<VerificationResult> {
    const timestamp = request.headers.get('X-Slack-Request-Timestamp');
    const signature = request.headers.get('X-Slack-Signature');

    if (!timestamp || !signature) {
      return { valid: false, error: 'Missing required Slack headers' };
    }

    // Prevent replay attacks
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestampNum) > this.timestampTolerance) {
      return { valid: false, error: 'Request timestamp too old or in future' };
    }

    const body = await request.text();
    const sigBasestring = `v0:${timestamp}:${body}`;
    const expectedSignature = await this.computeSignature(sigBasestring);

    const isValid = await this.timingSafeCompare(
      new TextEncoder().encode(signature),
      new TextEncoder().encode(expectedSignature)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, body };
  }

  private async computeSignature(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.signingSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));

    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return `v0=${hashHex}`;
  }

  private async timingSafeCompare(a: Uint8Array, b: Uint8Array): Promise<boolean> {
    if (a.length !== b.length) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(32),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const [sigA, sigB] = await Promise.all([
      crypto.subtle.sign('HMAC', key, a),
      crypto.subtle.sign('HMAC', key, b),
    ]);

    const bufA = new Uint8Array(sigA);
    const bufB = new Uint8Array(sigB);

    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }

    return result === 0;
  }
}
```

---

## Verification Middleware

```typescript
// src/presentation/middleware/slackVerification.ts

export function createSlackVerificationMiddleware(env: Env) {
  const verifier = new SlackRequestVerifier({
    signingSecret: env.SLACK_SIGNING_SECRET,
  });

  return async function verifySlackRequest(
    request: Request
  ): Promise<{ verified: boolean; body?: string; response?: Response }> {
    const result = await verifier.verify(request.clone());

    if (!result.valid) {
      console.warn('Slack verification failed:', result.error);
      return {
        verified: false,
        response: new Response('Unauthorized', { status: 401 }),
      };
    }

    return { verified: true, body: result.body };
  };
}
```

---

## URL Verification Challenge

When configuring Event Subscriptions, Slack sends a challenge:

```typescript
// In EventsHandler
const payload = JSON.parse(verification.body!);

if (payload.type === 'url_verification') {
  return new Response(payload.challenge, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

---

## Rate Limiting Failed Verifications

```typescript
const failureKey = `slack_verify_fail:${clientIp}`;
const failures = parseInt((await env.CACHE.get(failureKey)) ?? '0');

if (failures > 10) {
  return new Response('Too Many Requests', { status: 429 });
}

if (!result.valid) {
  await env.CACHE.put(failureKey, String(failures + 1), {
    expirationTtl: 3600,
  });
}
```

---

## Security Best Practices

1. **Never log request bodies** - May contain sensitive data
2. **Fail secure** - Return 401 for any verification failure
3. **Use timing-safe comparison** - Prevents timing attacks
4. **Validate timestamp** - Prevents replay attacks (5-minute window)

---

## Next Steps

- For event handling → Read `implementation/event-handling.md`
- For command handling → Read `implementation/slash-commands.md`
