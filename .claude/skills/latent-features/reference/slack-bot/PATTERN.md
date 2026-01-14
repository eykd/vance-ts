# Slack Bot Integration Pattern

**Purpose**: Token-efficient access to comprehensive Slack bot integration patterns for Cloudflare Workers

**Trigger keywords**: slack, bot, slack-bot, events, slash-commands, interactive, block-kit, oauth, webhook

---

## Pattern Overview

**What this pattern provides**:

- Complete Slack bot architecture for Cloudflare Workers
- Secure request verification with HMAC-SHA256 signature validation
- Event handling (messages, reactions, app mentions)
- Slash commands with immediate and delayed responses
- Interactive components (buttons, modals, select menus)
- Multi-workspace OAuth installation flow
- Block Kit message formatting
- D1 and KV data persistence patterns
- Domain-Driven Design patterns for Slack entities
- Comprehensive testing strategies

**Technologies**:

- Cloudflare Workers (edge runtime)
- D1 (SQLite for installations, user mappings)
- KV (caching, event deduplication)
- Slack Web API
- TypeScript with branded types

**Key security features**:

- HMAC-SHA256 request signature verification
- Timing-safe comparison for signatures
- Replay attack prevention (timestamp validation)
- Secure token storage
- Rate limiting for verification failures

---

## Progressive Disclosure Path

### Level 1: Architecture Overview (~140 lines)

**File**: `architecture/overview.md`

**When to read**: Specification phase, early planning

**What you get**:

- High-level architecture diagram
- Request flow for Slack events
- Integration points with web application
- Slack 3-second rule explanation
- Key architectural decisions

**Use this when**:

- Starting a new Slack integration
- Understanding overall architecture
- Writing feature specifications
- Planning project structure

---

### Level 2: Request Verification (~160 lines)

**File**: `implementation/request-verification.md`

**When to read**: Implementing security layer

**What you get**:

- Complete SlackRequestVerifier implementation
- HMAC-SHA256 signature computation
- Timing-safe comparison pattern
- Verification middleware
- URL verification challenge handling
- Rate limiting for failed verifications

**Use this when**:

- Setting up Slack webhook endpoints
- Implementing request verification
- Handling URL verification challenge

---

### Level 3: Event Handling (~200 lines)

**File**: `implementation/event-handling.md`

**When to read**: Implementing event subscriptions

**What you get**:

- Event payload DTOs
- Event handler architecture
- Message, app mention, reaction handlers
- Event deduplication with KV
- Async processing with ctx.waitUntil()

**Use this when**:

- Handling Slack events
- Processing messages and reactions
- Implementing bot mentions

---

### Level 4: Slash Commands (~180 lines)

**File**: `implementation/slash-commands.md`

**When to read**: Implementing slash commands

**What you get**:

- Command payload structure
- Command handler pattern
- Subcommand routing
- Modal integration
- Delayed responses via response_url

**Use this when**:

- Creating slash commands
- Opening modals from commands
- Handling long-running command operations

---

### Level 5: Interactive Components (~170 lines)

**File**: `implementation/interactive-components.md`

**When to read**: Implementing buttons, modals, selects

**What you get**:

- Interaction payload structure
- Block actions handler
- View submission handler
- Message update patterns
- Modal form validation

**Use this when**:

- Adding interactive buttons
- Creating and handling modals
- Updating messages after interactions

---

### Level 6: OAuth Installation (~150 lines)

**File**: `implementation/oauth-installation.md`

**When to read**: Implementing multi-workspace installation

**What you get**:

- OAuth flow implementation
- State parameter for CSRF protection
- Token exchange
- Installation storage in D1
- Installation caching in KV

**Use this when**:

- Supporting multiple workspaces
- Implementing "Add to Slack" button
- Storing and retrieving bot tokens

---

### Level 7: Block Kit Messaging (~140 lines)

**File**: `implementation/block-kit-messaging.md`

**When to read**: Building rich messages

**What you get**:

- SlackBlockBuilder fluent API
- Common block patterns
- Static factory methods for task cards
- Message composition patterns

**Use this when**:

- Creating rich formatted messages
- Building reusable message templates
- Composing complex layouts

---

### Level 8: Testing Strategies (~160 lines)

**File**: `implementation/testing.md`

**When to read**: Writing tests

**What you get**:

- Test fixture builders
- Unit test examples for handlers
- Integration test setup
- Test helper utilities
- Signature generation for tests

**Use this when**:

- Writing unit tests for handlers
- Setting up integration tests
- Creating test fixtures

---

## Usage by Phase

### Specification Phase (`/sp:02-specify`)

**Goal**: Define Slack integration requirements

**Steps**:

1. Load: `architecture/overview.md`
2. Extract: Architecture decisions, endpoint structure
3. Document: Required scopes, event types, commands

**Token cost**: ~140 lines

**Example output for spec**:

```markdown
## Slack Integration Requirements

### Events Subscribed

- `app_mention` - Bot mentions for commands
- `message.channels` - Message tracking
- `reaction_added` - Reaction-based triggers

### Slash Commands

- `/task create <title>` - Create new task
- `/task list` - List user's tasks

### Interactive Components

- Task completion buttons
- Task creation modal
```

---

### Planning Phase (`/sp:04-plan`)

**Goal**: Design implementation approach

**Steps**:

1. Load: `architecture/overview.md` (if not loaded)
2. Load: `implementation/request-verification.md`
3. Load: `implementation/event-handling.md`
4. Create: Implementation plan with file structure

**Token cost**: ~500 lines

**Example plan structure**:

```markdown
## Implementation Plan

### Phase 1: Infrastructure

1. Create SlackRequestVerifier
2. Set up verification middleware
3. Configure wrangler.jsonc secrets

### Phase 2: Event Handling

1. Create event DTOs
2. Implement EventsHandler
3. Add event deduplication

### Phase 3: Commands

1. Create CommandsHandler
2. Implement TaskCommandHandler
3. Add modal support
```

---

### Implementation Phase

**Goal**: Load specific patterns as needed

**Common workflows**:

| Task                    | Load These Files            |
| ----------------------- | --------------------------- |
| Set up endpoints        | `request-verification.md`   |
| Handle bot mentions     | `event-handling.md`         |
| Add slash commands      | `slash-commands.md`         |
| Add buttons/modals      | `interactive-components.md` |
| Multi-workspace support | `oauth-installation.md`     |
| Rich message formatting | `block-kit-messaging.md`    |
| Write tests             | `testing.md`                |

---

## Complete Reference

**File**: `docs/slack-bot-integration-guide.md` (~3,912 lines)

**When to use**: Rarely - only when focused reference files are insufficient

**Prefer**: Focused reference files above for ~70% token savings

---

## Token Efficiency Comparison

### Progressive Disclosure Approach

```
Specification: ~140 lines (architecture)
Planning: ~500 lines (architecture + verification + events)
Implementation: ~170 lines per component

Typical session: ~800 lines
```

### Monolithic Approach

```
Load entire guide: ~3,912 lines
```

**Token savings**: ~79% reduction for typical workflows

---

## Quick Reference

### Wrangler Configuration

```jsonc
{
  "d1_databases": [{ "binding": "DB" }],
  "kv_namespaces": [{ "binding": "CACHE" }],
  "vars": { "SLACK_CLIENT_ID": "..." },
}
```

**Secrets** (set via `wrangler secret put`):

- `SLACK_CLIENT_SECRET`
- `SLACK_SIGNING_SECRET`

### Required Scopes

```
app_mentions:read, channels:history, channels:read,
chat:write, commands, reactions:read, users:read
```

### Endpoint Structure

```
/slack/events        - Event subscriptions
/slack/commands      - Slash commands
/slack/interactions  - Interactive components
/slack/install       - OAuth install redirect
/slack/oauth/callback - OAuth callback
```

---

## Dependencies

```json
{
  "devDependencies": {
    "@cloudflare/workers-types": "^4.x",
    "wrangler": "^3.x"
  }
}
```

No additional runtime dependencies required - uses Web Crypto API and Fetch API.

---

## Notes

- Slack requires 3-second response for events/interactions
- Use `ctx.waitUntil()` for async processing after acknowledgment
- Always verify request signatures before processing
- Implement event deduplication (Slack may retry)
- Bot tokens are sensitive - never log them
- All patterns follow Slack API best practices (January 2026)
