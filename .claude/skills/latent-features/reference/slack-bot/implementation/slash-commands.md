# Slash Commands

**Purpose**: Implement Slack slash command handlers

**When to read**: Adding slash commands to your bot

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 8)

---

## Command Payload Structure

```typescript
// src/application/dto/SlackCommandPayload.ts

export interface SlackCommandPayload {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string; // e.g., /task
  text: string; // Text after command
  response_url: string; // For delayed responses
  trigger_id: string; // For opening modals
  api_app_id: string;
}
```

---

## Commands Handler

```typescript
// src/presentation/handlers/slack/CommandsHandler.ts

export async function handleSlackCommands(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const verifier = new SlackRequestVerifier({
    signingSecret: env.SLACK_SIGNING_SECRET,
  });

  const verification = await verifier.verify(request.clone());

  if (!verification.valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse form-encoded body
  const formData = new URLSearchParams(verification.body!);
  const payload = parseCommandPayload(formData);

  const handler = getCommandHandler(payload.command, env);

  if (!handler) {
    return jsonResponse({
      response_type: 'ephemeral',
      text: `Unknown command: ${payload.command}`,
    });
  }

  try {
    const response = await handler.handle(payload, ctx);
    return jsonResponse(response);
  } catch (error) {
    console.error('Command error:', error);
    return jsonResponse({
      response_type: 'ephemeral',
      text: 'An error occurred processing your command.',
    });
  }
}

function parseCommandPayload(formData: URLSearchParams): SlackCommandPayload {
  return {
    token: formData.get('token') ?? '',
    team_id: formData.get('team_id') ?? '',
    team_domain: formData.get('team_domain') ?? '',
    channel_id: formData.get('channel_id') ?? '',
    channel_name: formData.get('channel_name') ?? '',
    user_id: formData.get('user_id') ?? '',
    user_name: formData.get('user_name') ?? '',
    command: formData.get('command') ?? '',
    text: formData.get('text') ?? '',
    response_url: formData.get('response_url') ?? '',
    trigger_id: formData.get('trigger_id') ?? '',
    api_app_id: formData.get('api_app_id') ?? '',
  };
}

function jsonResponse(data: SlackCommandResponse): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## Task Command Handler

```typescript
// src/application/command-handlers/TaskCommandHandler.ts

export class TaskCommandHandler implements CommandHandler {
  constructor(private readonly env: Env) {}

  async handle(payload: SlackCommandPayload, ctx: ExecutionContext): Promise<SlackCommandResponse> {
    const subcommand = payload.text.split(' ')[0].toLowerCase();

    switch (subcommand) {
      case 'create':
        return this.handleCreate(payload);
      case 'list':
        return this.handleList(payload);
      case 'modal':
        return this.handleOpenModal(payload);
      default:
        return this.handleHelp();
    }
  }

  private async handleCreate(payload: SlackCommandPayload): Promise<SlackCommandResponse> {
    const title = payload.text.replace(/^create\s+/i, '').trim();

    if (!title) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide a task title. Usage: `/task create <title>`',
      };
    }

    const task = await this.createTask.execute({
      title,
      slackUserId: payload.user_id,
      slackChannelId: payload.channel_id,
      slackTeamId: payload.team_id,
    });

    return {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `<@${payload.user_id}> created:` },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*${task.title}*` },
          accessory: {
            type: 'button',
            text: { type: 'plain_text', text: 'Complete' },
            style: 'primary',
            action_id: 'complete_task',
            value: task.id,
          },
        },
      ],
    };
  }

  private handleHelp(): SlackCommandResponse {
    return {
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Task Command Help' },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              '`/task create <title>` - Create a new task',
              '`/task list` - List your tasks',
              '`/task modal` - Open task creation modal',
            ].join('\n'),
          },
        },
      ],
    };
  }
}

interface SlackCommandResponse {
  response_type: 'ephemeral' | 'in_channel';
  text?: string;
  blocks?: Block[];
}
```

---

## Opening Modals

```typescript
private async handleOpenModal(
  payload: SlackCommandPayload
): Promise<SlackCommandResponse> {
  const installation = await this.getInstallation(payload.team_id);

  if (!installation) {
    return {
      response_type: 'ephemeral',
      text: 'App not properly installed.'
    };
  }

  await this.slackApi.openView({
    token: installation.botToken,
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'create_task_modal',
      title: { type: 'plain_text', text: 'Create Task' },
      submit: { type: 'plain_text', text: 'Create' },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: 'input',
          block_id: 'title_block',
          element: {
            type: 'plain_text_input',
            action_id: 'title_input'
          },
          label: { type: 'plain_text', text: 'Title' }
        }
      ]
    }
  });

  return { response_type: 'ephemeral', text: '' };
}
```

---

## Delayed Responses

For long operations, acknowledge immediately and respond later:

```typescript
// Return immediately
ctx.waitUntil(async () => {
  const result = await performLongOperation();

  await fetch(payload.response_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response_type: 'in_channel',
      replace_original: true,
      text: `Operation complete: ${result}`,
    }),
  });
});

return { response_type: 'ephemeral', text: 'Processing...' };
```

---

## Response Types

| Type         | Visibility                | Use Case                     |
| ------------ | ------------------------- | ---------------------------- |
| `ephemeral`  | Only user who ran command | Errors, help, private info   |
| `in_channel` | Everyone in channel       | Task created, public actions |

---

## Next Steps

- For interactive components → Read `implementation/interactive-components.md`
- For Block Kit formatting → Read `implementation/block-kit-messaging.md`
