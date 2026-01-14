# Testing Strategies

**Purpose**: Test Slack bot integrations

**When to read**: Writing tests for Slack handlers

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 14)

---

## Test Fixtures

### Event Builder

```typescript
// tests/fixtures/SlackEventBuilder.ts

export class SlackEventBuilder {
  private envelope: SlackEventEnvelope = {
    token: 'test-token',
    team_id: 'T12345678',
    api_app_id: 'A12345678',
    event: {
      type: 'message',
      user: 'U12345678',
      channel: 'C12345678',
      ts: '1234567890.123456',
    },
    type: 'event_callback',
    event_id: 'Ev12345678',
    event_time: 1234567890,
    authorizations: [],
  };

  withTeamId(teamId: string): this {
    this.envelope.team_id = teamId;
    return this;
  }

  withMessageEvent(text: string): this {
    this.envelope.event = {
      type: 'message',
      user: 'U12345678',
      channel: 'C12345678',
      ts: '1234567890.123456',
      text,
    };
    return this;
  }

  withAppMention(text: string): this {
    this.envelope.event = {
      type: 'app_mention',
      user: 'U12345678',
      channel: 'C12345678',
      ts: '1234567890.123456',
      text,
    };
    return this;
  }

  withReactionAdded(reaction: string): this {
    this.envelope.event = {
      type: 'reaction_added',
      user: 'U12345678',
      reaction,
      item: { type: 'message', channel: 'C12345678', ts: '1234567890.123456' },
      item_user: 'U87654321',
    };
    return this;
  }

  build(): SlackEventEnvelope {
    return { ...this.envelope };
  }
}
```

### Command Builder

```typescript
// tests/fixtures/SlackCommandBuilder.ts

export class SlackCommandBuilder {
  private payload: SlackCommandPayload = {
    token: 'test-token',
    team_id: 'T12345678',
    team_domain: 'test-workspace',
    channel_id: 'C12345678',
    channel_name: 'general',
    user_id: 'U12345678',
    user_name: 'testuser',
    command: '/task',
    text: '',
    response_url: 'https://hooks.slack.com/commands/...',
    trigger_id: 'trigger123',
    api_app_id: 'A12345678',
  };

  withCommand(command: string): this {
    this.payload.command = command;
    return this;
  }

  withText(text: string): this {
    this.payload.text = text;
    return this;
  }

  withUserId(userId: string): this {
    this.payload.user_id = userId;
    return this;
  }

  build(): SlackCommandPayload {
    return { ...this.payload };
  }

  toFormData(): string {
    return new URLSearchParams(Object.entries(this.payload) as [string, string][]).toString();
  }
}
```

---

## Test Helpers

```typescript
// tests/helpers/slackTestHelpers.ts

import { createHmac } from 'crypto';

export function createTestSignature(
  body: string,
  signingSecret: string
): { signature: string; timestamp: string } {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const sigBasestring = `v0:${timestamp}:${body}`;

  const signature = 'v0=' + createHmac('sha256', signingSecret).update(sigBasestring).digest('hex');

  return { signature, timestamp };
}

export function createMockSlackApi() {
  return {
    postMessage: vi.fn().mockResolvedValue({ ok: true, ts: '1234567890.123456' }),
    openView: vi.fn().mockResolvedValue({ ok: true }),
    updateMessage: vi.fn().mockResolvedValue({ ok: true }),
    addReaction: vi.fn().mockResolvedValue({ ok: true }),
  };
}

export function createMockInstallation(overrides: Partial<SlackInstallation> = {}) {
  return {
    id: 'inst-123',
    teamId: 'T12345678',
    teamName: 'Test Workspace',
    botUserId: 'U_BOT_123',
    botToken: 'xoxb-test-token',
    scope: 'chat:write,commands',
    installedBy: 'U12345678',
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
```

---

## Unit Tests

```typescript
// src/application/event-handlers/AppMentionHandler.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppMentionHandler } from './AppMentionHandler';
import { SlackEventBuilder } from '../../../tests/fixtures/SlackEventBuilder';

describe('AppMentionHandler', () => {
  let handler: AppMentionHandler;
  let mockSlackApi: ReturnType<typeof createMockSlackApi>;

  beforeEach(() => {
    mockSlackApi = createMockSlackApi();

    const mockEnv = {
      DB: {} as D1Database,
      CACHE: {
        get: vi.fn().mockResolvedValue(
          JSON.stringify({
            teamId: 'T12345678',
            botToken: 'xoxb-test',
          })
        ),
        put: vi.fn(),
      } as unknown as KVNamespace,
    };

    handler = new AppMentionHandler(mockEnv);
    (handler as any).slackApi = mockSlackApi;
  });

  it('should respond to list tasks command', async () => {
    const event = new SlackEventBuilder().withAppMention('<@U_BOT> list tasks').build();

    await handler.handle(event.event as AppMentionEvent, event);

    expect(mockSlackApi.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'C12345678',
        thread_ts: expect.any(String),
      })
    );
  });

  it('should respond with help for unknown commands', async () => {
    const event = new SlackEventBuilder().withAppMention('<@U_BOT> unknown').build();

    await handler.handle(event.event as AppMentionEvent, event);

    expect(mockSlackApi.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: expect.stringContaining('Available Commands'),
            }),
          }),
        ]),
      })
    );
  });
});
```

---

## Integration Tests

```typescript
// tests/integration/slack/events.integration.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { unstable_dev } from 'wrangler';
import { SlackEventBuilder } from '../../fixtures/SlackEventBuilder';
import { createTestSignature } from '../../helpers/slackTestHelpers';

describe('Slack Events Integration', () => {
  let worker: UnstableDevWorker;

  beforeAll(async () => {
    worker = await unstable_dev('src/index.ts', {
      experimental: { disableExperimentalWarning: true },
    });
  });

  afterAll(async () => {
    await worker.stop();
  });

  it('should respond to URL verification challenge', async () => {
    const body = JSON.stringify({
      type: 'url_verification',
      challenge: 'test-challenge',
      token: 'test-token',
    });

    const { signature, timestamp } = createTestSignature(body, 'test-signing-secret');

    const response = await worker.fetch('/slack/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Slack-Signature': signature,
        'X-Slack-Request-Timestamp': timestamp,
      },
      body,
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('test-challenge');
  });

  it('should reject invalid signatures', async () => {
    const response = await worker.fetch('/slack/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Slack-Signature': 'v0=invalid',
        'X-Slack-Request-Timestamp': String(Math.floor(Date.now() / 1000)),
      },
      body: '{}',
    });

    expect(response.status).toBe(401);
  });
});
```

---

## Testing Patterns

| Test Type   | What to Test               | Tools                          |
| ----------- | -------------------------- | ------------------------------ |
| Unit        | Handler logic, builders    | Vitest, mocks                  |
| Integration | Request flow, verification | unstable_dev                   |
| E2E         | Full Slack interaction     | Manual or Slack test workspace |

---

## Mock Environment

```typescript
function createMockEnv(): Env {
  return {
    DB: {} as D1Database,
    CACHE: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace,
    SLACK_SIGNING_SECRET: 'test-signing-secret',
    SLACK_CLIENT_ID: 'test-client-id',
    SLACK_CLIENT_SECRET: 'test-client-secret',
    ENVIRONMENT: 'test',
  };
}
```

---

## Next Steps

- For complete implementation → Read `docs/slack-bot-integration-guide.md`
- For architecture review → Read `architecture/overview.md`
