# Block Kit Messaging

**Purpose**: Build rich formatted Slack messages

**When to read**: Creating structured message layouts

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 11)

---

## SlackBlockBuilder

Fluent API for constructing Block Kit messages:

```typescript
// src/infrastructure/slack/SlackBlockBuilder.ts

export class SlackBlockBuilder {
  private blocks: Block[] = [];

  header(text: string): this {
    this.blocks.push({
      type: 'header',
      text: { type: 'plain_text', text, emoji: true },
    });
    return this;
  }

  section(text: string): this {
    this.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text },
    });
    return this;
  }

  sectionWithButton(
    text: string,
    button: { text: string; actionId: string; value: string; style?: 'primary' | 'danger' }
  ): this {
    this.blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: button.text, emoji: true },
        action_id: button.actionId,
        value: button.value,
        ...(button.style && { style: button.style }),
      },
    });
    return this;
  }

  divider(): this {
    this.blocks.push({ type: 'divider' });
    return this;
  }

  context(elements: string[]): this {
    this.blocks.push({
      type: 'context',
      elements: elements.map((text) => ({ type: 'mrkdwn', text })),
    });
    return this;
  }

  actions(
    buttons: Array<{
      text: string;
      actionId: string;
      value: string;
      style?: 'primary' | 'danger';
    }>
  ): this {
    this.blocks.push({
      type: 'actions',
      elements: buttons.map((btn) => ({
        type: 'button',
        text: { type: 'plain_text', text: btn.text, emoji: true },
        action_id: btn.actionId,
        value: btn.value,
        ...(btn.style && { style: btn.style }),
      })),
    });
    return this;
  }

  input(params: {
    blockId: string;
    actionId: string;
    label: string;
    placeholder?: string;
    multiline?: boolean;
    optional?: boolean;
  }): this {
    this.blocks.push({
      type: 'input',
      block_id: params.blockId,
      optional: params.optional ?? false,
      element: {
        type: 'plain_text_input',
        action_id: params.actionId,
        ...(params.placeholder && {
          placeholder: { type: 'plain_text', text: params.placeholder },
        }),
        ...(params.multiline && { multiline: true }),
      },
      label: { type: 'plain_text', text: params.label },
    });
    return this;
  }

  build(): Block[] {
    return this.blocks;
  }
}
```

---

## Static Factory Methods

```typescript
// Task card pattern
static taskCard(task: Task): Block[] {
  const builder = new SlackBlockBuilder();

  const statusEmoji = {
    pending: '⬜',
    in_progress: '🔄',
    completed: '✅'
  }[task.status];

  const priorityEmoji = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  }[task.priority];

  builder
    .section(`${statusEmoji} *${task.title}*`)
    .context([
      `${priorityEmoji} ${task.priority}`,
      `Created: <!date^${Math.floor(new Date(task.createdAt).getTime() / 1000)}^{date_short}|${task.createdAt}>`
    ]);

  if (task.status !== 'completed') {
    builder.actions([
      { text: 'Complete', actionId: 'complete_task', value: task.id, style: 'primary' },
      { text: 'Edit', actionId: 'edit_task', value: task.id },
      { text: 'Delete', actionId: 'delete_task', value: task.id, style: 'danger' }
    ]);
  }

  return builder.build();
}

// Task list pattern
static taskList(tasks: Task[], title = 'Tasks'): Block[] {
  const builder = new SlackBlockBuilder();

  builder.header(title).divider();

  if (tasks.length === 0) {
    builder.section("_No tasks found._");
  } else {
    for (const task of tasks) {
      builder.blocks.push(...SlackBlockBuilder.taskCard(task));
      builder.divider();
    }
  }

  return builder.build();
}
```

---

## Common Message Patterns

```typescript
// Notification message
function buildTaskNotification(task: Task, action: string, userId: string): Block[] {
  return new SlackBlockBuilder()
    .section(`<@${userId}> ${action} a task:`)
    .sectionWithButton(`*${task.title}*\n${task.description ?? '_No description_'}`, {
      text: 'View',
      actionId: 'view_task',
      value: task.id,
    })
    .context([`Priority: ${task.priority}`, `Status: ${task.status}`])
    .build();
}

// Error message
function buildErrorMessage(error: string): Block[] {
  return new SlackBlockBuilder().section(`❌ *Error*\n${error}`).build();
}

// Success message
function buildSuccessMessage(message: string): Block[] {
  return new SlackBlockBuilder().section(`✅ ${message}`).build();
}
```

---

## Modal Views

```typescript
function buildCreateTaskModal(): SlackView {
  return {
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
          action_id: 'title_input',
          placeholder: { type: 'plain_text', text: 'Enter task title' },
        },
        label: { type: 'plain_text', text: 'Title' },
      },
      {
        type: 'input',
        block_id: 'priority_block',
        element: {
          type: 'static_select',
          action_id: 'priority_select',
          options: [
            { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
            { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },
            { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' },
          ],
        },
        label: { type: 'plain_text', text: 'Priority' },
      },
    ],
  };
}
```

---

## Key Block Types

| Type      | Purpose                      |
| --------- | ---------------------------- |
| `header`  | Large bold title             |
| `section` | Text with optional accessory |
| `divider` | Horizontal line              |
| `context` | Small muted text             |
| `actions` | Button row                   |
| `input`   | Form field (modals only)     |
| `image`   | Image display                |

---

## Next Steps

- For testing strategies → Read `implementation/testing.md`
- For complete examples → Read `docs/slack-bot-integration-guide.md`
