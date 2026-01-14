# Slack Bot Architecture

**Purpose**: High-level architectural overview for Slack bot integration

**When to read**: Specification phase, early planning

**Source**: Full implementation in `docs/slack-bot-integration-guide.md`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Slack Platform                               │
│   Events API • Slash Commands • Interactive Components • Web API    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Cloudflare Worker                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                  Presentation Layer                            │  │
│  │    Request Verification • Routing • Slack Response Handlers   │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │                  Application Layer                             │  │
│  │    Use Cases • Event Processors • Command Handlers            │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │                    Domain Layer                                │  │
│  │    Entities • Value Objects • Domain Services • Interfaces    │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │                 Infrastructure Layer                           │  │
│  │    D1 Repository • KV Cache • Slack API Client                │  │
│  └───────────────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────────┬───────────────┘
                │                                     │
                ▼                                     ▼
        ┌──────────────┐                      ┌──────────────┐
        │      D1      │                      │      KV      │
        │  (SQLite)    │                      │   (Cache)    │
        └──────────────┘                      └──────────────┘
```

---

## Request Flow

```
┌──────────┐    ┌──────────┐    ┌────────────┐    ┌──────────────┐
│  Slack   │───>│  Worker  │───>│  Verify    │───>│   Route &    │
│ Platform │    │  Entry   │    │  Request   │    │   Dispatch   │
└──────────┘    └──────────┘    └────────────┘    └──────────────┘
                                      │                  │
                                      │ Invalid          │ Valid
                                      ▼                  ▼
                               ┌────────────┐    ┌──────────────┐
                               │   Reject   │    │   Process    │
                               │  (401)     │    │   Event      │
                               └────────────┘    └──────────────┘
```

---

## The 3-Second Rule

Slack requires acknowledgment within 3 seconds. For longer operations:

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Slack   │────────>│  Worker  │────────>│ Immediate│
│  Event   │         │  Entry   │         │  Ack     │
└──────────┘         └──────────┘         └────┬─────┘
                                               │
      ┌────────────────────────────────────────┘
      │ Return 200 immediately
      ▼
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Process  │────────>│  Slack   │<────────│ Response │
│ Async    │         │ Web API  │         │ Message  │
└──────────┘         └──────────┘         └──────────┘
```

Use `ctx.waitUntil()` for async processing after returning 200.

---

## Key Decisions

| Decision                     | Rationale                                    | Alternatives                |
| ---------------------------- | -------------------------------------------- | --------------------------- |
| HTTP-based (not Socket Mode) | Workers can't maintain WebSocket connections | Bolt SDK (requires Node.js) |
| D1 for installations         | Relational data, upsert support              | KV (no upsert)              |
| KV for caching               | Fast edge reads, TTL support                 | D1 (slower for lookups)     |
| Branded types for IDs        | Type safety, prevent mixing IDs              | Plain strings               |
| Verify before processing     | Security requirement                         | Trust (insecure)            |

---

## Endpoint Structure

| Endpoint                | Purpose                                   | Response Time |
| ----------------------- | ----------------------------------------- | ------------- |
| `/slack/events`         | Event subscriptions (messages, reactions) | 3 seconds     |
| `/slack/commands`       | Slash command execution                   | 3 seconds     |
| `/slack/interactions`   | Button clicks, modal submissions          | 3 seconds     |
| `/slack/install`        | OAuth install redirect                    | No limit      |
| `/slack/oauth/callback` | OAuth token exchange                      | No limit      |

---

## Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   └── SlackInstallation.ts
│   └── value-objects/
│       ├── SlackUserId.ts
│       ├── SlackTeamId.ts
│       └── SlackChannelId.ts
├── application/
│   ├── event-handlers/
│   │   ├── MessageEventHandler.ts
│   │   └── AppMentionHandler.ts
│   ├── command-handlers/
│   │   └── TaskCommandHandler.ts
│   └── dto/
│       ├── SlackEventPayload.ts
│       └── SlackCommandPayload.ts
├── infrastructure/
│   ├── slack/
│   │   ├── SlackApiClient.ts
│   │   ├── SlackRequestVerifier.ts
│   │   └── SlackBlockBuilder.ts
│   └── repositories/
│       └── D1SlackInstallationRepository.ts
└── presentation/
    └── handlers/slack/
        ├── EventsHandler.ts
        ├── CommandsHandler.ts
        └── InteractionsHandler.ts
```

---

## Next Steps

- For request verification → Read `implementation/request-verification.md`
- For event handling → Read `implementation/event-handling.md`
- For slash commands → Read `implementation/slash-commands.md`
- For OAuth flow → Read `implementation/oauth-installation.md`
