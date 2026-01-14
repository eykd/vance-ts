# Interactive Components

**Purpose**: Handle buttons, modals, and select menus

**When to read**: Adding interactive UI elements

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 9)

---

## Interaction Payload Structure

```typescript
// src/application/dto/SlackInteractionPayload.ts

export interface SlackInteractionPayload {
  type: InteractionType;
  team: { id: string; domain: string };
  user: { id: string; username: string; name: string };
  channel?: { id: string; name: string };
  trigger_id: string;
  response_url: string;

  // For block_actions
  actions?: BlockAction[];
  message?: Message;

  // For view_submission
  view?: ViewSubmission;

  // For shortcut
  callback_id?: string;
}

export type InteractionType =
  | 'block_actions' // Button clicks, select changes
  | 'view_submission' // Modal form submission
  | 'view_closed' // Modal closed
  | 'shortcut'; // Global/message shortcuts

export interface BlockAction {
  type: string;
  action_id: string;
  block_id: string;
  value?: string;
  selected_option?: { value: string };
  action_ts: string;
}

export interface ViewSubmission {
  id: string;
  callback_id: string;
  private_metadata?: string;
  state: {
    values: Record<string, Record<string, InputValue>>;
  };
}
```

---

## Interactions Handler

```typescript
// src/presentation/handlers/slack/InteractionsHandler.ts

export async function handleSlackInteractions(
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

  // Parse payload (form-encoded with JSON in 'payload' field)
  const formData = new URLSearchParams(verification.body!);
  const payloadJson = formData.get('payload');

  if (!payloadJson) {
    return new Response('Bad Request', { status: 400 });
  }

  const payload: SlackInteractionPayload = JSON.parse(payloadJson);

  switch (payload.type) {
    case 'block_actions':
      return handleBlockActions(payload, env, ctx);
    case 'view_submission':
      return handleViewSubmission(payload, env);
    case 'shortcut':
      return handleShortcut(payload, env);
    default:
      return new Response('', { status: 200 });
  }
}
```

---

## Block Actions Handler

```typescript
async function handleBlockActions(
  payload: SlackInteractionPayload,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  for (const action of payload.actions ?? []) {
    switch (action.action_id) {
      case 'complete_task':
        ctx.waitUntil(processCompleteTask(action, payload, env));
        break;
      case 'delete_task':
        ctx.waitUntil(processDeleteTask(action, payload, env));
        break;
    }
  }

  return new Response('', { status: 200 });
}

async function processCompleteTask(
  action: BlockAction,
  payload: SlackInteractionPayload,
  env: Env
): Promise<void> {
  const taskId = action.value!;

  try {
    const task = await completeTask.execute({
      taskId,
      completedBy: payload.user.id,
    });

    // Update original message
    await fetch(payload.response_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        replace_original: true,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `~${task.title}~\n✅ Completed by <@${payload.user.id}>`,
            },
          },
        ],
      }),
    });
  } catch (error) {
    await fetch(payload.response_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'ephemeral',
        replace_original: false,
        text: 'Failed to complete task.',
      }),
    });
  }
}
```

---

## View Submission Handler

```typescript
async function handleViewSubmission(payload: SlackInteractionPayload, env: Env): Promise<Response> {
  const view = payload.view!;

  if (view.callback_id !== 'create_task_modal') {
    return new Response('', { status: 200 });
  }

  const values = view.state.values;
  const title = values.title_block?.title_input?.value;

  // Validate
  if (!title || title.length < 1) {
    return new Response(
      JSON.stringify({
        response_action: 'errors',
        errors: { title_block: 'Title is required' },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create task
  try {
    await createTask.execute({
      title,
      slackUserId: payload.user.id,
      slackTeamId: payload.team.id,
    });

    return new Response(
      JSON.stringify({
        response_action: 'clear',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        response_action: 'errors',
        errors: { title_block: 'Failed to create task.' },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
```

---

## Message Update Patterns

```typescript
// Replace original message
await fetch(response_url, {
  method: 'POST',
  body: JSON.stringify({
    replace_original: true,
    blocks: [
      /* new blocks */
    ],
  }),
});

// Delete original message
await fetch(response_url, {
  method: 'POST',
  body: JSON.stringify({ delete_original: true }),
});

// Add ephemeral message (only visible to clicker)
await fetch(response_url, {
  method: 'POST',
  body: JSON.stringify({
    response_type: 'ephemeral',
    replace_original: false,
    text: 'Action completed!',
  }),
});
```

---

## Modal Response Actions

| Action   | Purpose                   |
| -------- | ------------------------- |
| `clear`  | Close modal on success    |
| `errors` | Show validation errors    |
| `update` | Update modal content      |
| `push`   | Push new modal onto stack |

---

## Next Steps

- For OAuth installation → Read `implementation/oauth-installation.md`
- For Block Kit formatting → Read `implementation/block-kit-messaging.md`
