# Event Handling

**Purpose**: Handle Slack event subscriptions

**When to read**: Implementing event-driven bot features

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 7)

---

## Event Payload Structure

```typescript
// src/application/dto/SlackEventPayload.ts

export interface SlackEventEnvelope {
  token: string;
  team_id: string;
  api_app_id: string;
  event: SlackEvent;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  authorizations: Authorization[];
}

export interface SlackEvent {
  type: string;
  user?: string;
  channel?: string;
  ts?: string;
  text?: string;
}

export interface MessageEvent extends SlackEvent {
  type: 'message';
  channel_type: 'channel' | 'im' | 'mpim' | 'group';
  subtype?: string;
  thread_ts?: string;
}

export interface AppMentionEvent extends SlackEvent {
  type: 'app_mention';
  text: string;
  channel: string;
  user: string;
}

export interface ReactionAddedEvent extends SlackEvent {
  type: 'reaction_added';
  reaction: string;
  item: { type: string; channel: string; ts: string };
  item_user: string;
}
```

---

## Events Handler

```typescript
// src/presentation/handlers/slack/EventsHandler.ts

export async function handleSlackEvents(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // 1. Verify request
  const verifier = new SlackRequestVerifier({
    signingSecret: env.SLACK_SIGNING_SECRET,
  });

  const verification = await verifier.verify(request.clone());

  if (!verification.valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = JSON.parse(verification.body!);

  // 2. Handle URL verification
  if (payload.type === 'url_verification') {
    return new Response(payload.challenge, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 3. Acknowledge immediately, process async
  ctx.waitUntil(processEvent(payload, env));

  return new Response('', { status: 200 });
}

async function processEvent(envelope: SlackEventEnvelope, env: Env): Promise<void> {
  const event = envelope.event;

  // Skip bot messages to prevent loops
  if ('bot_id' in event) return;

  // Deduplicate events
  const eventKey = `slack_event:${envelope.event_id}`;
  const processed = await env.CACHE.get(eventKey);

  if (processed) {
    console.log('Duplicate event, skipping:', envelope.event_id);
    return;
  }

  await env.CACHE.put(eventKey, 'processing', { expirationTtl: 3600 });

  try {
    switch (event.type) {
      case 'message':
        await new MessageEventHandler(env).handle(event, envelope);
        break;
      case 'app_mention':
        await new AppMentionHandler(env).handle(event, envelope);
        break;
      case 'reaction_added':
        await new ReactionEventHandler(env).handle(event, envelope);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    await env.CACHE.put(eventKey, 'completed', { expirationTtl: 3600 });
  } catch (error) {
    console.error('Event processing error:', error);
    await env.CACHE.delete(eventKey); // Allow retry
  }
}
```

---

## App Mention Handler

```typescript
// src/application/event-handlers/AppMentionHandler.ts

export class AppMentionHandler {
  private readonly slackApi: SlackApiClient;

  constructor(private readonly env: Env) {
    this.slackApi = new SlackApiClient(env);
  }

  async handle(event: AppMentionEvent, envelope: SlackEventEnvelope): Promise<void> {
    // Remove bot mention from text
    const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    const installation = await this.getInstallation(envelope.team_id);
    if (!installation) return;

    if (text.toLowerCase().startsWith('list tasks')) {
      await this.handleListTasks(event, installation);
    } else if (text.toLowerCase().startsWith('create task')) {
      await this.handleCreateTask(event, text, installation);
    } else {
      await this.handleHelp(event, installation);
    }
  }

  private async handleListTasks(
    event: AppMentionEvent,
    installation: SlackInstallation
  ): Promise<void> {
    const tasks = await this.taskRepository.findBySlackUser(event.user);

    await this.slackApi.postMessage({
      token: installation.botToken,
      channel: event.channel,
      thread_ts: event.ts,
      blocks: this.buildTaskListBlocks(tasks),
    });
  }

  private async getInstallation(teamId: string): Promise<SlackInstallation | null> {
    const cached = await this.env.CACHE.get(`installation:${teamId}`);
    if (cached) return JSON.parse(cached);

    const installation = await this.repo.findByTeamId(teamId);
    if (installation) {
      await this.env.CACHE.put(`installation:${teamId}`, JSON.stringify(installation), {
        expirationTtl: 300,
      });
    }
    return installation;
  }
}
```

---

## Event Deduplication

```typescript
// src/infrastructure/cache/EventDeduplicator.ts

export class EventDeduplicator {
  constructor(private readonly kv: KVNamespace) {}

  async checkAndMark(eventId: string): Promise<{ shouldProcess: boolean }> {
    const key = `event:${eventId}`;
    const existing = await this.kv.get(key);

    if (existing === 'completed') {
      return { shouldProcess: false };
    }

    if (existing === 'processing') {
      await this.sleep(100);
      const recheck = await this.kv.get(key);
      if (recheck) return { shouldProcess: false };
    }

    await this.kv.put(key, 'processing', { expirationTtl: 60 });
    return { shouldProcess: true };
  }

  async markCompleted(eventId: string): Promise<void> {
    await this.kv.put(`event:${eventId}`, 'completed', {
      expirationTtl: 86400,
    });
  }

  async markFailed(eventId: string): Promise<void> {
    await this.kv.delete(`event:${eventId}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Key Patterns

1. **Always acknowledge first** - Return 200 before processing
2. **Use ctx.waitUntil()** - Process asynchronously
3. **Skip bot messages** - Prevent infinite loops
4. **Deduplicate events** - Slack may retry delivery
5. **Cache installations** - Reduce D1 queries

---

## Next Steps

- For slash commands → Read `implementation/slash-commands.md`
- For interactive components → Read `implementation/interactive-components.md`
