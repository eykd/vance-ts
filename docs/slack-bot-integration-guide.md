# Comprehensive Guide: Slack Bot Integration for Cloudflare Interactive Web Applications

**Building Secure, Scalable Slack Integrations with TypeScript Workers, D1, and KV**

_Using Domain-Driven Design, Clean Architecture, and Security Best Practices_

_January 2026_

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Slack Platform Concepts](#3-slack-platform-concepts)
4. [Project Structure](#4-project-structure)
5. [Setting Up Your Slack App](#5-setting-up-your-slack-app)
6. [Request Verification and Security](#6-request-verification-and-security)
7. [Handling Slack Events](#7-handling-slack-events)
8. [Slash Commands](#8-slash-commands)
9. [Interactive Components](#9-interactive-components)
10. [OAuth Installation Flow](#10-oauth-installation-flow)
11. [Message Formatting with Block Kit](#11-message-formatting-with-block-kit)
12. [Data Persistence with D1 and KV](#12-data-persistence-with-d1-and-kv)
13. [Domain-Driven Design Patterns](#13-domain-driven-design-patterns)
14. [Testing Strategies](#14-testing-strategies)
15. [Complete Implementation Example](#15-complete-implementation-example)
16. [Deployment and Operations](#16-deployment-and-operations)
17. [Best Practices and Patterns](#17-best-practices-and-patterns)
18. [Troubleshooting Guide](#18-troubleshooting-guide)

---

## 1. Introduction

This guide provides an in-depth approach to integrating Slack bots with interactive web applications built on Cloudflare's edge platform. Building on the architectural patterns from our companion guides—the Interactive Web Applications Guide and the Security Guide—we'll create a Slack integration that is secure, testable, and maintainable.

### Why Slack Integration on Cloudflare Workers?

Cloudflare Workers provide an ideal runtime for Slack bot integrations for several reasons:

**Performance at the Edge**: Slack requires fast responses to events and interactions. Workers execute globally at the edge, minimizing latency regardless of where your users are located. Slack's 3-second timeout for interactive responses becomes easy to meet.

**Scalability by Default**: Workers automatically scale to handle any volume of Slack events without infrastructure management. Whether your bot serves a small team or an enterprise with thousands of daily interactions, the infrastructure scales seamlessly.

**Cost Efficiency**: The Workers free tier includes 100,000 requests per day, and paid plans charge per request. For most Slack bots, this translates to minimal or zero infrastructure costs.

**Integrated Storage**: D1 provides relational storage for complex data relationships (users, teams, workflows), while KV offers high-performance caching for frequently accessed data (team configurations, user preferences).

### What You'll Build

By the end of this guide, you'll understand how to build a Slack integration that supports:

- Event subscriptions (messages, reactions, channel events)
- Slash commands with rich responses
- Interactive components (buttons, modals, select menus)
- OAuth-based multi-workspace installation
- Secure request verification
- Persistent data storage
- Comprehensive testing at all levels

### Prerequisites

This guide assumes familiarity with:

- TypeScript and Cloudflare Workers development
- The hypermedia architecture described in our companion guide
- Basic Slack concepts (workspaces, channels, users)
- Clean Architecture and Domain-Driven Design principles

---

## 2. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Slack Platform                               │
│   Events API • Slash Commands • Interactive Components • Web API    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                           │
│                        (Global CDN)                                  │
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

### Request Flow for Slack Events

Understanding how requests flow through the system is crucial for both implementation and debugging:

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
                                                       │
                                                       ▼
                                               ┌──────────────┐
                                               │  Respond to  │
                                               │    Slack     │
                                               └──────────────┘
```

### Integration Points with Your Web Application

The Slack integration connects with your HTMX/Alpine.js web application through shared infrastructure:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Cloudflare Worker                               │
│  ┌────────────────────────┐    ┌────────────────────────────────┐  │
│  │    Web Application     │    │      Slack Integration         │  │
│  │   (HTMX/Alpine.js)     │    │    (Events/Commands)           │  │
│  │                        │    │                                 │  │
│  │  /                     │    │  /slack/events                 │  │
│  │  /tasks                │    │  /slack/commands               │  │
│  │  /api/tasks            │    │  /slack/interactions           │  │
│  │                        │    │  /slack/oauth/callback         │  │
│  └───────────┬────────────┘    └──────────────┬─────────────────┘  │
│              │                                │                     │
│              └──────────────┬─────────────────┘                     │
│                             │                                       │
│                    ┌────────▼────────┐                             │
│                    │  Shared Domain  │                             │
│                    │    & Services   │                             │
│                    │  (Task, User,   │                             │
│                    │   Repository)   │                             │
│                    └────────┬────────┘                             │
│                             │                                       │
│              ┌──────────────┼──────────────┐                       │
│              │              │              │                        │
│        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐                 │
│        │    D1     │  │    KV     │  │  Slack    │                 │
│        │ Database  │  │  Cache    │  │  Web API  │                 │
│        └───────────┘  └───────────┘  └───────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

### The Slack 3-Second Rule

Slack imposes strict timing requirements on responses. For events and interactions, you must acknowledge receipt within 3 seconds. For computationally intensive operations, use this pattern:

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

---

## 3. Slack Platform Concepts

Before implementing the integration, understanding Slack's core concepts ensures correct architecture decisions.

### Slack App Types

**Bolt-Based Apps**: Traditional apps using Slack's SDK for server-side processing. Not directly compatible with Workers due to Node.js dependencies.

**HTTP-Based Apps**: Apps that receive webhook events and respond via HTTP. This is the model we'll use with Workers.

**Socket Mode Apps**: WebSocket-based apps that don't require public URLs. Not compatible with Workers (no persistent connections).

### Event Types and Endpoints

Slack communicates with your app through several distinct endpoints:

| Endpoint Type          | Purpose                                | Response Time | Response Type                          |
| ---------------------- | -------------------------------------- | ------------- | -------------------------------------- |
| Events API             | Real-time events (messages, reactions) | 3 seconds     | 200 OK (acknowledgment)                |
| Slash Commands         | User-initiated commands                | 3 seconds     | JSON (immediate) or webhook (deferred) |
| Interactive Components | Button clicks, form submissions        | 3 seconds     | JSON (update) or webhook (deferred)    |
| OAuth                  | Installation flow                      | No limit      | Redirect                               |

### Scopes and Permissions

Slack uses OAuth scopes to define what your app can access. Common scopes include:

**Bot Token Scopes** (for bot actions):

- `channels:read` - View basic channel info
- `channels:history` - View messages in public channels
- `chat:write` - Send messages as the bot
- `commands` - Add and execute slash commands
- `users:read` - View user information

**User Token Scopes** (for user actions):

- `identify` - View user identity
- `channels:write` - Manage channels on user's behalf

### Token Types

**Bot Token** (`xoxb-...`): Used for bot actions. One per workspace installation.

**User Token** (`xoxp-...`): Used for user-specific actions. One per user who installs.

**App-Level Token** (`xapp-...`): Used for Socket Mode (not applicable to Workers).

### Workspace vs. Organization

Slack Enterprise Grid introduces organization-level concepts:

```
Organization (Enterprise Grid)
├── Workspace A
│   ├── Channels
│   └── Users
├── Workspace B
│   ├── Channels
│   └── Users
└── Shared Channels (cross-workspace)
```

For most integrations, workspace-level installation is sufficient.

---

## 4. Project Structure

Building on the structure from our main guide, here's how Slack integration fits into the architecture:

```
project-root/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Task.ts
│   │   │   └── SlackInstallation.ts          # Slack-specific entity
│   │   ├── value-objects/
│   │   │   ├── SlackUserId.ts                # Branded type for Slack IDs
│   │   │   ├── SlackTeamId.ts
│   │   │   ├── SlackChannelId.ts
│   │   │   └── SlackTimestamp.ts
│   │   ├── services/
│   │   │   └── TaskNotificationService.ts    # Domain service
│   │   └── interfaces/
│   │       ├── TaskRepository.ts
│   │       └── SlackInstallationRepository.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── CreateTaskFromSlack.ts
│   │   │   ├── ListTasksForUser.ts
│   │   │   └── CompleteTaskFromSlack.ts
│   │   ├── event-handlers/
│   │   │   ├── MessageEventHandler.ts
│   │   │   ├── ReactionEventHandler.ts
│   │   │   └── AppMentionHandler.ts
│   │   ├── command-handlers/
│   │   │   ├── TaskCommandHandler.ts
│   │   │   └── HelpCommandHandler.ts
│   │   └── dto/
│   │       ├── SlackEventPayload.ts
│   │       ├── SlackCommandPayload.ts
│   │       └── SlackInteractionPayload.ts
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── D1TaskRepository.ts
│   │   │   └── D1SlackInstallationRepository.ts
│   │   ├── cache/
│   │   │   └── KVInstallationCache.ts
│   │   ├── slack/
│   │   │   ├── SlackApiClient.ts             # API wrapper
│   │   │   ├── SlackRequestVerifier.ts       # Signature verification
│   │   │   ├── SlackBlockBuilder.ts          # Block Kit helpers
│   │   │   └── SlackOAuthClient.ts           # OAuth flow
│   │   └── services/
│   │       └── SlackNotificationService.ts
│   │
│   ├── presentation/
│   │   ├── handlers/
│   │   │   ├── TaskHandlers.ts               # Web handlers
│   │   │   └── slack/
│   │   │       ├── EventsHandler.ts          # /slack/events
│   │   │       ├── CommandsHandler.ts        # /slack/commands
│   │   │       ├── InteractionsHandler.ts    # /slack/interactions
│   │   │       └── OAuthHandler.ts           # /slack/oauth/*
│   │   ├── templates/                        # HTMX templates
│   │   │   └── ...
│   │   └── middleware/
│   │       ├── auth.ts
│   │       ├── slackVerification.ts          # Slack request verification
│   │       └── errorHandler.ts
│   │
│   ├── index.ts
│   └── router.ts
│
├── migrations/
│   ├── 0001_initial.sql
│   └── 0002_slack_installations.sql
│
├── tests/
│   ├── fixtures/
│   │   ├── SlackEventBuilder.ts
│   │   ├── SlackCommandBuilder.ts
│   │   └── SlackInstallationBuilder.ts
│   ├── helpers/
│   │   └── slackTestHelpers.ts
│   └── integration/
│       └── slack/
│           ├── events.integration.test.ts
│           └── commands.integration.test.ts
│
├── wrangler.jsonc
└── package.json
```

### Key Architectural Decisions

**1. Slack-Specific Domain Objects**: `SlackInstallation` is a first-class entity representing a workspace installation, with its own repository and lifecycle.

**2. Branded Types for Slack IDs**: Using TypeScript branded types prevents mixing up different ID types:

```typescript
// src/domain/value-objects/SlackUserId.ts
export type SlackUserId = string & { readonly __brand: 'SlackUserId' };

export function createSlackUserId(id: string): SlackUserId {
  if (!id.startsWith('U') && !id.startsWith('W')) {
    throw new Error('Invalid Slack user ID format');
  }
  return id as SlackUserId;
}
```

**3. Separated Handlers**: Each Slack endpoint type has its own handler, following the single responsibility principle.

**4. Infrastructure Separation**: The Slack API client, verifier, and OAuth client are infrastructure concerns, isolated from business logic.

---

## 5. Setting Up Your Slack App

### Creating the App

1. Navigate to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter your app name and select a development workspace

### Configuring OAuth & Permissions

Under "OAuth & Permissions", configure:

**Bot Token Scopes**:

```
app_mentions:read    - Receive @mentions
channels:history     - Read message history
channels:read        - View channel info
chat:write          - Send messages
commands            - Use slash commands
reactions:read      - View reactions
reactions:write     - Add reactions
users:read          - View user info
```

**Redirect URLs**:

```
https://your-app.workers.dev/auth/slack/callback
```

### Setting Up Event Subscriptions

Under "Event Subscriptions":

1. Enable Events
2. Set Request URL: `https://your-app.workers.dev/webhooks/slack/events`
3. Subscribe to bot events:
   - `app_mention` - When someone mentions your bot
   - `message.channels` - Messages in public channels
   - `message.im` - Direct messages
   - `reaction_added` - Emoji reactions

### Creating Slash Commands

Under "Slash Commands", create commands:

| Command | Request URL                                            | Description             |
| ------- | ------------------------------------------------------ | ----------------------- |
| `/task` | `https://your-app.workers.dev/webhooks/slack/commands` | Create and manage tasks |
| `/help` | `https://your-app.workers.dev/webhooks/slack/commands` | Show help information   |

### Enabling Interactive Components

Under "Interactivity & Shortcuts":

1. Enable Interactivity
2. Set Request URL: `https://your-app.workers.dev/webhooks/slack/interactions`

### Collecting Credentials

You'll need these values for your Worker configuration:

- **Client ID**: Under "Basic Information"
- **Client Secret**: Under "Basic Information"
- **Signing Secret**: Under "Basic Information"
- **Bot Token** (for development): Under "OAuth & Permissions" after installing to workspace

### Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "name": "your-app",
  "main": "src/index.ts",
  "compatibility_date": "2026-01-01",

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-app-db",
      "database_id": "your-database-id",
    },
  ],

  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "your-kv-id",
    },
  ],

  "vars": {
    "ENVIRONMENT": "development",
    "SLACK_CLIENT_ID": "your-client-id",
  },

  // Secrets (set via `wrangler secret put`):
  // SLACK_CLIENT_SECRET
  // SLACK_SIGNING_SECRET
}
```

Set secrets via CLI:

```bash
wrangler secret put SLACK_CLIENT_SECRET
wrangler secret put SLACK_SIGNING_SECRET
```

---

## 6. Request Verification and Security

Slack request verification is critical for security. Every request must be verified before processing.

### How Slack Signing Works

Slack signs each request using HMAC-SHA256:

1. Slack creates a signature base string: `v0:timestamp:body`
2. Slack computes HMAC-SHA256 using your signing secret
3. Slack sends the signature in `X-Slack-Signature` header
4. Your app recomputes and compares signatures

### Implementing the Verifier

```typescript
// src/infrastructure/slack/SlackRequestVerifier.ts

import { timingSafeEqual } from 'crypto';

export interface SlackRequestVerifierConfig {
  signingSecret: string;
  timestampToleranceSeconds?: number;
}

export class SlackRequestVerifier {
  private readonly signingSecret: string;
  private readonly timestampTolerance: number;

  constructor(config: SlackRequestVerifierConfig) {
    this.signingSecret = config.signingSecret;
    this.timestampTolerance = config.timestampToleranceSeconds ?? 300; // 5 minutes
  }

  /**
   * Verifies a Slack request signature.
   *
   * Security considerations:
   * - Uses constant-time comparison to prevent timing attacks
   * - Validates timestamp to prevent replay attacks
   * - Returns detailed error for debugging but logs generically
   */
  async verify(request: Request): Promise<VerificationResult> {
    const timestamp = request.headers.get('X-Slack-Request-Timestamp');
    const signature = request.headers.get('X-Slack-Signature');

    // Validate headers exist
    if (!timestamp || !signature) {
      return {
        valid: false,
        error: 'Missing required Slack headers',
      };
    }

    // Validate timestamp (prevent replay attacks)
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestampNum) > this.timestampTolerance) {
      return {
        valid: false,
        error: 'Request timestamp too old or in future',
      };
    }

    // Get request body
    const body = await request.text();

    // Compute expected signature
    const sigBasestring = `v0:${timestamp}:${body}`;
    const expectedSignature = await this.computeSignature(sigBasestring);

    // Constant-time comparison
    const signatureBuffer = new TextEncoder().encode(signature);
    const expectedBuffer = new TextEncoder().encode(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }

    // Use subtle crypto for timing-safe comparison
    const isValid = await this.timingSafeCompare(signatureBuffer, expectedBuffer);

    if (!isValid) {
      return {
        valid: false,
        error: 'Invalid signature',
      };
    }

    return {
      valid: true,
      body, // Return parsed body for handler use
    };
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

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return `v0=${hashHex}`;
  }

  private async timingSafeCompare(a: Uint8Array, b: Uint8Array): Promise<boolean> {
    // Use subtle crypto to perform constant-time comparison
    const key = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(32), // Dummy key
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

    if (bufA.length !== bufB.length) return false;

    let result = 0;
    for (let i = 0; i < bufA.length; i++) {
      result |= bufA[i] ^ bufB[i];
    }

    return result === 0;
  }
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  body?: string;
}
```

### Verification Middleware

```typescript
// src/presentation/middleware/slackVerification.ts

import { SlackRequestVerifier } from '../../infrastructure/slack/SlackRequestVerifier';

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

    return {
      verified: true,
      body: result.body,
    };
  };
}
```

### URL Verification Challenge

When you first configure your Events URL, Slack sends a challenge request:

```typescript
// src/presentation/handlers/slack/EventsHandler.ts

export async function handleSlackEvents(request: Request, env: Env): Promise<Response> {
  // Verify request signature
  const verification = await createSlackVerificationMiddleware(env)(request);

  if (!verification.verified) {
    return verification.response!;
  }

  const payload = JSON.parse(verification.body!);

  // Handle URL verification challenge
  if (payload.type === 'url_verification') {
    return new Response(payload.challenge, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Process event (see next section)
  // ...
}
```

### Security Best Practices

Following our security guide's principles:

**1. Never Log Sensitive Data**:

```typescript
// ❌ Bad
console.log('Request body:', body);

// ✅ Good
console.log('Processing event type:', payload.type);
```

**2. Fail Secure**:

```typescript
// Always return 401 for any verification failure
if (!result.valid) {
  return new Response('Unauthorized', { status: 401 });
}
```

**3. Rate Limit Verification Failures**:

```typescript
// Track failed verifications in KV
const failureKey = `slack_verify_fail:${clientIp}`;
const failures = parseInt((await env.CACHE.get(failureKey)) ?? '0');

if (failures > 10) {
  return new Response('Too Many Requests', { status: 429 });
}

if (!result.valid) {
  await env.CACHE.put(failureKey, String(failures + 1), {
    expirationTtl: 3600, // Reset after 1 hour
  });
}
```

---

## 7. Handling Slack Events

### Event Payload Structure

Slack events follow this structure:

```typescript
// src/application/dto/SlackEventPayload.ts

export interface SlackEventEnvelope {
  token: string; // Deprecated verification token
  team_id: string; // Workspace ID
  api_app_id: string; // Your app ID
  event: SlackEvent; // The actual event
  type: 'event_callback'; // Always 'event_callback' for events
  event_id: string; // Unique event ID
  event_time: number; // Unix timestamp
  authorizations: Authorization[];
}

export interface SlackEvent {
  type: string; // Event type (message, reaction_added, etc.)
  user?: string; // User who triggered event
  channel?: string; // Channel where event occurred
  ts?: string; // Event timestamp
  text?: string; // Message text (for message events)
  // Additional fields vary by event type
}

export interface MessageEvent extends SlackEvent {
  type: 'message';
  channel_type: 'channel' | 'im' | 'mpim' | 'group';
  subtype?: string; // Message subtype (if any)
  thread_ts?: string; // Thread parent timestamp
}

export interface AppMentionEvent extends SlackEvent {
  type: 'app_mention';
  text: string;
  channel: string;
  user: string;
}

export interface ReactionAddedEvent extends SlackEvent {
  type: 'reaction_added';
  reaction: string; // Emoji name without colons
  item: {
    type: string;
    channel: string;
    ts: string;
  };
  item_user: string; // User whose item received reaction
}
```

### Event Handler Architecture

```typescript
// src/presentation/handlers/slack/EventsHandler.ts

import { SlackRequestVerifier } from '../../infrastructure/slack/SlackRequestVerifier';
import { MessageEventHandler } from '../../application/event-handlers/MessageEventHandler';
import { AppMentionHandler } from '../../application/event-handlers/AppMentionHandler';
import { ReactionEventHandler } from '../../application/event-handlers/ReactionEventHandler';

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

  // 3. Acknowledge immediately (Slack requires response within 3 seconds)
  // Process the event asynchronously
  ctx.waitUntil(processEvent(payload, env));

  return new Response('', { status: 200 });
}

async function processEvent(envelope: SlackEventEnvelope, env: Env): Promise<void> {
  const event = envelope.event;

  // Skip bot messages to prevent loops
  if ('bot_id' in event) {
    return;
  }

  // Deduplicate events (Slack may retry)
  const eventKey = `slack_event:${envelope.event_id}`;
  const processed = await env.CACHE.get(eventKey);

  if (processed) {
    console.log('Duplicate event, skipping:', envelope.event_id);
    return;
  }

  // Mark as processing
  await env.CACHE.put(eventKey, 'processing', {
    expirationTtl: 3600, // 1 hour
  });

  try {
    // Route to appropriate handler
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

    // Mark as completed
    await env.CACHE.put(eventKey, 'completed', {
      expirationTtl: 3600,
    });
  } catch (error) {
    console.error('Event processing error:', error);
    // Don't mark as completed - allow retry
    await env.CACHE.delete(eventKey);
  }
}
```

### Implementing Event Handlers

```typescript
// src/application/event-handlers/AppMentionHandler.ts

import { SlackApiClient } from '../../infrastructure/slack/SlackApiClient';
import { D1TaskRepository } from '../../infrastructure/repositories/D1TaskRepository';
import { createSlackUserId } from '../../domain/value-objects/SlackUserId';

interface EventHandlerContext {
  event: AppMentionEvent;
  envelope: SlackEventEnvelope;
}

export class AppMentionHandler {
  private readonly slackApi: SlackApiClient;
  private readonly taskRepository: D1TaskRepository;

  constructor(private readonly env: Env) {
    this.slackApi = new SlackApiClient(env);
    this.taskRepository = new D1TaskRepository(env.DB);
  }

  async handle(event: AppMentionEvent, envelope: SlackEventEnvelope): Promise<void> {
    // Parse the mention to extract command
    const text = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    // Get bot token for this workspace
    const installation = await this.getInstallation(envelope.team_id);

    if (!installation) {
      console.error('No installation found for team:', envelope.team_id);
      return;
    }

    // Route to command
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
    const userId = createSlackUserId(event.user);
    const tasks = await this.taskRepository.findBySlackUser(userId);

    const blocks = this.buildTaskListBlocks(tasks);

    await this.slackApi.postMessage({
      token: installation.botToken,
      channel: event.channel,
      thread_ts: event.ts, // Reply in thread
      blocks,
    });
  }

  private async handleCreateTask(
    event: AppMentionEvent,
    text: string,
    installation: SlackInstallation
  ): Promise<void> {
    // Extract task title from text
    const titleMatch = text.match(/create task[:\s]+(.+)/i);

    if (!titleMatch) {
      await this.slackApi.postMessage({
        token: installation.botToken,
        channel: event.channel,
        thread_ts: event.ts,
        text: 'Please provide a task title. Example: `@bot create task: Review PR #123`',
      });
      return;
    }

    const title = titleMatch[1].trim();
    const userId = createSlackUserId(event.user);

    // Create the task
    const task = await this.taskRepository.create({
      title,
      slackUserId: userId,
      slackChannelId: event.channel,
      status: 'pending',
    });

    await this.slackApi.postMessage({
      token: installation.botToken,
      channel: event.channel,
      thread_ts: event.ts,
      text: `✅ Task created: *${task.title}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ Task created: *${task.title}*`,
          },
          accessory: {
            type: 'button',
            text: { type: 'plain_text', text: 'Complete' },
            action_id: 'complete_task',
            value: task.id,
          },
        },
      ],
    });
  }

  private async handleHelp(event: AppMentionEvent, installation: SlackInstallation): Promise<void> {
    await this.slackApi.postMessage({
      token: installation.botToken,
      channel: event.channel,
      thread_ts: event.ts,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Available Commands*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              '• `@bot list tasks` - Show your tasks',
              '• `@bot create task: <title>` - Create a new task',
              '• `/task create <title>` - Create via slash command',
            ].join('\n'),
          },
        },
      ],
    });
  }

  private buildTaskListBlocks(tasks: Task[]): Block[] {
    if (tasks.length === 0) {
      return [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: "You don't have any tasks yet. Create one with `@bot create task: <title>`",
          },
        },
      ];
    }

    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Your Tasks (${tasks.length})*`,
        },
      },
      { type: 'divider' },
      ...tasks.map((task) => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${task.status === 'completed' ? '✅' : '⬜'} ${task.title}`,
        },
        accessory:
          task.status !== 'completed'
            ? {
                type: 'button',
                text: { type: 'plain_text', text: 'Complete' },
                action_id: 'complete_task',
                value: task.id,
              }
            : undefined,
      })),
    ];
  }

  private async getInstallation(teamId: string): Promise<SlackInstallation | null> {
    // Check cache first
    const cached = await this.env.CACHE.get(`installation:${teamId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const repo = new D1SlackInstallationRepository(this.env.DB);
    const installation = await repo.findByTeamId(teamId);

    if (installation) {
      // Cache for 5 minutes
      await this.env.CACHE.put(`installation:${teamId}`, JSON.stringify(installation), {
        expirationTtl: 300,
      });
    }

    return installation;
  }
}
```

### Event Deduplication

Slack may send events multiple times. Implement proper deduplication:

```typescript
// src/infrastructure/cache/EventDeduplicator.ts

export class EventDeduplicator {
  constructor(private readonly kv: KVNamespace) {}

  /**
   * Check if event was already processed.
   * Uses a two-phase approach: mark as processing, then mark as completed.
   */
  async checkAndMark(eventId: string): Promise<DeduplicationResult> {
    const key = `event:${eventId}`;
    const existing = await this.kv.get(key);

    if (existing === 'completed') {
      return { shouldProcess: false, reason: 'already_completed' };
    }

    if (existing === 'processing') {
      // Another worker is handling this
      // Could be a retry - wait briefly and check again
      await this.sleep(100);
      const recheck = await this.kv.get(key);

      if (recheck) {
        return { shouldProcess: false, reason: 'in_progress' };
      }
    }

    // Mark as processing with short TTL (in case we crash)
    await this.kv.put(key, 'processing', { expirationTtl: 60 });

    return { shouldProcess: true };
  }

  async markCompleted(eventId: string): Promise<void> {
    const key = `event:${eventId}`;
    await this.kv.put(key, 'completed', {
      expirationTtl: 86400, // Keep for 24 hours
    });
  }

  async markFailed(eventId: string): Promise<void> {
    const key = `event:${eventId}`;
    await this.kv.delete(key); // Allow retry
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

interface DeduplicationResult {
  shouldProcess: boolean;
  reason?: string;
}
```

---

## 8. Slash Commands

### Command Payload Structure

```typescript
// src/application/dto/SlackCommandPayload.ts

export interface SlackCommandPayload {
  token: string; // Deprecated verification token
  team_id: string; // Workspace ID
  team_domain: string; // Workspace domain
  channel_id: string; // Channel where command was issued
  channel_name: string; // Channel name
  user_id: string; // User who issued command
  user_name: string; // User's display name
  command: string; // The command (e.g., /task)
  text: string; // Text after the command
  response_url: string; // URL for delayed responses
  trigger_id: string; // For opening modals
  api_app_id: string; // Your app ID
}
```

### Command Handler Implementation

```typescript
// src/presentation/handlers/slack/CommandsHandler.ts

import { SlackRequestVerifier } from '../../infrastructure/slack/SlackRequestVerifier';
import { TaskCommandHandler } from '../../application/command-handlers/TaskCommandHandler';
import { HelpCommandHandler } from '../../application/command-handlers/HelpCommandHandler';

export async function handleSlackCommands(
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

  // 2. Parse form-encoded body
  const formData = new URLSearchParams(verification.body!);
  const payload = parseCommandPayload(formData);

  // 3. Route to command handler
  const handler = getCommandHandler(payload.command, env);

  if (!handler) {
    return jsonResponse({
      response_type: 'ephemeral',
      text: `Unknown command: ${payload.command}`,
    });
  }

  // 4. Execute command
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

function getCommandHandler(command: string, env: Env): CommandHandler | null {
  const handlers: Record<string, CommandHandler> = {
    '/task': new TaskCommandHandler(env),
    '/help': new HelpCommandHandler(env),
  };

  return handlers[command] ?? null;
}

function jsonResponse(data: SlackCommandResponse): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Task Command Handler

```typescript
// src/application/command-handlers/TaskCommandHandler.ts

import { SlackApiClient } from '../../infrastructure/slack/SlackApiClient';
import { CreateTaskFromSlack } from '../use-cases/CreateTaskFromSlack';
import { ListTasksForUser } from '../use-cases/ListTasksForUser';

export class TaskCommandHandler implements CommandHandler {
  private readonly slackApi: SlackApiClient;
  private readonly createTask: CreateTaskFromSlack;
  private readonly listTasks: ListTasksForUser;

  constructor(private readonly env: Env) {
    this.slackApi = new SlackApiClient(env);
    this.createTask = new CreateTaskFromSlack(env.DB);
    this.listTasks = new ListTasksForUser(env.DB);
  }

  async handle(payload: SlackCommandPayload, ctx: ExecutionContext): Promise<SlackCommandResponse> {
    const subcommand = payload.text.split(' ')[0].toLowerCase();

    switch (subcommand) {
      case 'create':
        return this.handleCreate(payload, ctx);

      case 'list':
        return this.handleList(payload);

      case 'complete':
        return this.handleComplete(payload);

      case 'modal':
        return this.handleOpenModal(payload);

      default:
        return this.handleHelp();
    }
  }

  private async handleCreate(
    payload: SlackCommandPayload,
    ctx: ExecutionContext
  ): Promise<SlackCommandResponse> {
    // Extract title (everything after "create ")
    const title = payload.text.replace(/^create\s+/i, '').trim();

    if (!title) {
      return {
        response_type: 'ephemeral',
        text: 'Please provide a task title. Usage: `/task create <title>`',
      };
    }

    // Create task
    const task = await this.createTask.execute({
      title,
      slackUserId: payload.user_id,
      slackChannelId: payload.channel_id,
      slackTeamId: payload.team_id,
    });

    // Send confirmation to channel (visible to everyone)
    return {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<@${payload.user_id}> created a new task:`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${task.title}*`,
          },
          accessory: {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Complete' },
            style: 'primary',
            action_id: 'complete_task',
            value: task.id,
          },
        },
      ],
    };
  }

  private async handleList(payload: SlackCommandPayload): Promise<SlackCommandResponse> {
    const tasks = await this.listTasks.execute({
      slackUserId: payload.user_id,
    });

    if (tasks.length === 0) {
      return {
        response_type: 'ephemeral',
        text: "You don't have any tasks. Create one with `/task create <title>`",
      };
    }

    const taskBlocks = tasks.map((task, index) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${index + 1}. ${task.status === 'completed' ? '~' : ''}${task.title}${task.status === 'completed' ? '~' : ''}`,
      },
      accessory:
        task.status !== 'completed'
          ? {
              type: 'button',
              text: { type: 'plain_text', text: 'Complete' },
              action_id: 'complete_task',
              value: task.id,
            }
          : undefined,
    }));

    return {
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Your Tasks' },
        },
        { type: 'divider' },
        ...taskBlocks,
      ],
    };
  }

  private async handleOpenModal(payload: SlackCommandPayload): Promise<SlackCommandResponse> {
    // Get installation for bot token
    const installation = await this.getInstallation(payload.team_id);

    if (!installation) {
      return {
        response_type: 'ephemeral',
        text: 'App not properly installed. Please reinstall.',
      };
    }

    // Open modal using trigger_id
    await this.slackApi.openView({
      token: installation.botToken,
      trigger_id: payload.trigger_id,
      view: this.buildCreateTaskModal(),
    });

    // Return empty response (modal will handle interaction)
    return {
      response_type: 'ephemeral',
      text: '',
    };
  }

  private buildCreateTaskModal(): SlackModalView {
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
          block_id: 'description_block',
          optional: true,
          element: {
            type: 'plain_text_input',
            action_id: 'description_input',
            multiline: true,
            placeholder: { type: 'plain_text', text: 'Enter description (optional)' },
          },
          label: { type: 'plain_text', text: 'Description' },
        },
        {
          type: 'input',
          block_id: 'priority_block',
          element: {
            type: 'static_select',
            action_id: 'priority_select',
            placeholder: { type: 'plain_text', text: 'Select priority' },
            options: [
              { text: { type: 'plain_text', text: '🔴 High' }, value: 'high' },
              { text: { type: 'plain_text', text: '🟡 Medium' }, value: 'medium' },
              { text: { type: 'plain_text', text: '🟢 Low' }, value: 'low' },
            ],
            initial_option: {
              text: { type: 'plain_text', text: '🟡 Medium' },
              value: 'medium',
            },
          },
          label: { type: 'plain_text', text: 'Priority' },
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
              '*Available subcommands:*',
              '',
              '`/task create <title>` - Create a new task',
              '`/task list` - List your tasks',
              '`/task complete <id>` - Mark a task as complete',
              '`/task modal` - Open task creation modal',
            ].join('\n'),
          },
        },
      ],
    };
  }

  private async getInstallation(teamId: string): Promise<SlackInstallation | null> {
    // Implementation as shown earlier
  }
}

interface SlackCommandResponse {
  response_type: 'ephemeral' | 'in_channel';
  text?: string;
  blocks?: Block[];
  attachments?: Attachment[];
}
```

### Delayed Responses

For operations that take longer than 3 seconds, use the `response_url`:

```typescript
// Immediate acknowledgment
return {
  response_type: 'ephemeral',
  text: 'Processing your request...',
};

// Then in ctx.waitUntil:
ctx.waitUntil(async () => {
  const result = await performLongOperation();

  // Send delayed response
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
```

---

## 9. Interactive Components

### Interaction Payload Structure

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
  | 'shortcut' // Global/message shortcuts
  | 'message_action'; // Message shortcuts (deprecated)

export interface BlockAction {
  type: string; // button, static_select, etc.
  action_id: string; // Your identifier
  block_id: string; // Block containing the action
  value?: string; // For buttons
  selected_option?: {
    // For selects
    value: string;
    text: { type: string; text: string };
  };
  action_ts: string;
}

export interface ViewSubmission {
  id: string;
  team_id: string;
  type: 'modal';
  callback_id: string;
  private_metadata?: string;
  state: {
    values: Record<string, Record<string, InputValue>>;
  };
}
```

### Interactions Handler

```typescript
// src/presentation/handlers/slack/InteractionsHandler.ts

import { SlackRequestVerifier } from '../../infrastructure/slack/SlackRequestVerifier';
import { CompleteTaskFromSlack } from '../../application/use-cases/CompleteTaskFromSlack';

export async function handleSlackInteractions(
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

  // 2. Parse payload (form-encoded with JSON in 'payload' field)
  const formData = new URLSearchParams(verification.body!);
  const payloadJson = formData.get('payload');

  if (!payloadJson) {
    return new Response('Bad Request', { status: 400 });
  }

  const payload: SlackInteractionPayload = JSON.parse(payloadJson);

  // 3. Route by interaction type
  switch (payload.type) {
    case 'block_actions':
      return handleBlockActions(payload, env, ctx);

    case 'view_submission':
      return handleViewSubmission(payload, env);

    case 'shortcut':
      return handleShortcut(payload, env);

    default:
      console.log('Unhandled interaction type:', payload.type);
      return new Response('', { status: 200 });
  }
}

async function handleBlockActions(
  payload: SlackInteractionPayload,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Process each action (usually just one)
  for (const action of payload.actions ?? []) {
    switch (action.action_id) {
      case 'complete_task':
        ctx.waitUntil(processCompleteTask(action, payload, env));
        break;

      case 'delete_task':
        ctx.waitUntil(processDeleteTask(action, payload, env));
        break;

      case 'priority_select':
        ctx.waitUntil(processChangePriority(action, payload, env));
        break;

      default:
        console.log('Unhandled action:', action.action_id);
    }
  }

  // Acknowledge immediately
  return new Response('', { status: 200 });
}

async function processCompleteTask(
  action: BlockAction,
  payload: SlackInteractionPayload,
  env: Env
): Promise<void> {
  const taskId = action.value!;

  const completeTask = new CompleteTaskFromSlack(env.DB);

  try {
    const task = await completeTask.execute({
      taskId,
      completedBy: payload.user.id,
    });

    // Update the message to show completed state
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
    console.error('Failed to complete task:', error);

    await fetch(payload.response_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'ephemeral',
        replace_original: false,
        text: 'Failed to complete task. Please try again.',
      }),
    });
  }
}

async function handleViewSubmission(payload: SlackInteractionPayload, env: Env): Promise<Response> {
  const view = payload.view!;

  switch (view.callback_id) {
    case 'create_task_modal':
      return processCreateTaskModal(view, payload, env);

    default:
      return new Response('', { status: 200 });
  }
}

async function processCreateTaskModal(
  view: ViewSubmission,
  payload: SlackInteractionPayload,
  env: Env
): Promise<Response> {
  // Extract values from view state
  const values = view.state.values;

  const title = values.title_block?.title_input?.value;
  const description = values.description_block?.description_input?.value;
  const priority = values.priority_block?.priority_select?.selected_option?.value;

  // Validate
  if (!title || title.length < 1) {
    return new Response(
      JSON.stringify({
        response_action: 'errors',
        errors: {
          title_block: 'Title is required',
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create task
  const createTask = new CreateTaskFromSlack(env.DB);

  try {
    const task = await createTask.execute({
      title,
      description,
      priority: priority ?? 'medium',
      slackUserId: payload.user.id,
      slackTeamId: payload.team.id,
    });

    // Parse private_metadata for channel info
    const metadata = view.private_metadata ? JSON.parse(view.private_metadata) : {};

    // Post success message if we have a channel
    if (metadata.channelId) {
      const installation = await getInstallation(payload.team.id, env);

      if (installation) {
        await postMessage({
          token: installation.botToken,
          channel: metadata.channelId,
          text: `<@${payload.user.id}> created task: ${task.title}`,
        });
      }
    }

    // Close modal with success
    return new Response(
      JSON.stringify({
        response_action: 'clear',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to create task from modal:', error);

    return new Response(
      JSON.stringify({
        response_action: 'errors',
        errors: {
          title_block: 'Failed to create task. Please try again.',
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleShortcut(payload: SlackInteractionPayload, env: Env): Promise<Response> {
  // Open a modal for the shortcut
  const installation = await getInstallation(payload.team.id, env);

  if (!installation) {
    return new Response('', { status: 200 });
  }

  await openView({
    token: installation.botToken,
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'quick_task_modal',
      title: { type: 'plain_text', text: 'Quick Task' },
      submit: { type: 'plain_text', text: 'Create' },
      blocks: [
        {
          type: 'input',
          block_id: 'title_block',
          element: {
            type: 'plain_text_input',
            action_id: 'title_input',
          },
          label: { type: 'plain_text', text: 'Task Title' },
        },
      ],
    },
  });

  return new Response('', { status: 200 });
}
```

### Updating Messages After Interactions

```typescript
// Patterns for updating messages

// 1. Replace original message
await fetch(response_url, {
  method: 'POST',
  body: JSON.stringify({
    replace_original: true,
    blocks: [
      /* new blocks */
    ],
  }),
});

// 2. Delete original message
await fetch(response_url, {
  method: 'POST',
  body: JSON.stringify({
    delete_original: true,
  }),
});

// 3. Add ephemeral message (only visible to user who clicked)
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

## 10. OAuth Installation Flow

### Multi-Workspace Installation Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    User     │─────>│   /slack/   │─────>│    Slack    │
│  Clicks     │      │   install   │      │   OAuth     │
│  "Install"  │      │             │      │   Page      │
└─────────────┘      └─────────────┘      └──────┬──────┘
                                                  │
                                                  │ User Authorizes
                                                  ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Store     │<─────│   /slack/   │<─────│   Slack     │
│   Tokens    │      │  callback   │      │  Redirects  │
│   in D1     │      │             │      │  with Code  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### OAuth Handler Implementation

```typescript
// src/presentation/handlers/slack/OAuthHandler.ts

import { SlackOAuthClient } from '../../infrastructure/slack/SlackOAuthClient';
import { D1SlackInstallationRepository } from '../../infrastructure/repositories/D1SlackInstallationRepository';

const OAUTH_SCOPES = [
  'app_mentions:read',
  'channels:history',
  'channels:read',
  'chat:write',
  'commands',
  'reactions:read',
  'reactions:write',
  'users:read',
].join(',');

export async function handleSlackInstall(request: Request, env: Env): Promise<Response> {
  // Generate state for CSRF protection
  const state = generateSecureState();

  // Store state in KV with short TTL
  await env.CACHE.put(`oauth_state:${state}`, 'pending', {
    expirationTtl: 600, // 10 minutes
  });

  // Build OAuth URL
  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    scope: OAUTH_SCOPES,
    state,
    redirect_uri: `${getBaseUrl(request)}/slack/oauth/callback`,
  });

  const oauthUrl = `https://slack.com/oauth/v2/authorize?${params}`;

  return Response.redirect(oauthUrl, 302);
}

export async function handleSlackCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Check for OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return renderError('Installation was cancelled or failed.');
  }

  // Validate state (CSRF protection)
  if (!state) {
    return renderError('Invalid request: missing state.');
  }

  const storedState = await env.CACHE.get(`oauth_state:${state}`);

  if (!storedState) {
    return renderError('Invalid or expired state. Please try again.');
  }

  // Clear used state
  await env.CACHE.delete(`oauth_state:${state}`);

  // Validate code
  if (!code) {
    return renderError('Invalid request: missing code.');
  }

  // Exchange code for tokens
  const oauthClient = new SlackOAuthClient(env);

  try {
    const tokenResponse = await oauthClient.exchangeCode({
      code,
      redirect_uri: `${getBaseUrl(request)}/slack/oauth/callback`,
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenResponse.error);
      return renderError('Failed to complete installation.');
    }

    // Store installation
    const repository = new D1SlackInstallationRepository(env.DB);

    await repository.upsert({
      teamId: tokenResponse.team.id,
      teamName: tokenResponse.team.name,
      botUserId: tokenResponse.bot_user_id,
      botToken: tokenResponse.access_token,
      scope: tokenResponse.scope,
      installedBy: tokenResponse.authed_user.id,
      installedAt: new Date().toISOString(),
    });

    // Cache installation for quick access
    await env.CACHE.put(
      `installation:${tokenResponse.team.id}`,
      JSON.stringify({
        teamId: tokenResponse.team.id,
        botToken: tokenResponse.access_token,
      }),
      { expirationTtl: 300 }
    );

    return renderSuccess(tokenResponse.team.name);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return renderError('An unexpected error occurred.');
  }
}

function generateSecureState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function renderSuccess(teamName: string): Response {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Installation Complete</title>
      <style>
        body { font-family: system-ui; max-width: 600px; margin: 100px auto; text-align: center; }
        .success { color: #2e7d32; }
        a { color: #1976d2; }
      </style>
    </head>
    <body>
      <h1 class="success">✅ Installation Complete!</h1>
      <p>Your app has been installed to <strong>${escapeHtml(teamName)}</strong>.</p>
      <p>You can now use slash commands and mentions in your workspace.</p>
      <p><a href="slack://open">Open Slack</a></p>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function renderError(message: string): Response {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Installation Failed</title>
      <style>
        body { font-family: system-ui; max-width: 600px; margin: 100px auto; text-align: center; }
        .error { color: #c62828; }
        a { color: #1976d2; }
      </style>
    </head>
    <body>
      <h1 class="error">❌ Installation Failed</h1>
      <p>${escapeHtml(message)}</p>
      <p><a href="/slack/install">Try Again</a></p>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html' },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### OAuth Client Infrastructure

```typescript
// src/infrastructure/slack/SlackOAuthClient.ts

export interface OAuthTokenResponse {
  ok: boolean;
  error?: string;
  access_token: string;
  token_type: 'bot';
  scope: string;
  bot_user_id: string;
  app_id: string;
  team: {
    id: string;
    name: string;
  };
  authed_user: {
    id: string;
  };
}

export class SlackOAuthClient {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(env: Env) {
    this.clientId = env.SLACK_CLIENT_ID;
    this.clientSecret = env.SLACK_CLIENT_SECRET;
  }

  async exchangeCode(params: { code: string; redirect_uri: string }): Promise<OAuthTokenResponse> {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: params.code,
        redirect_uri: params.redirect_uri,
      }),
    });

    return response.json();
  }
}
```

### Database Schema for Installations

```sql
-- migrations/0002_slack_installations.sql

CREATE TABLE slack_installations (
  id TEXT PRIMARY KEY,
  team_id TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  bot_user_id TEXT NOT NULL,
  bot_token TEXT NOT NULL,
  scope TEXT NOT NULL,
  installed_by TEXT NOT NULL,
  installed_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  -- Index for quick lookups
  CONSTRAINT idx_team_id UNIQUE (team_id)
);

-- Link users to Slack identities
CREATE TABLE slack_user_mappings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  slack_team_id TEXT NOT NULL,
  slack_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,

  UNIQUE (slack_team_id, slack_user_id)
);

CREATE INDEX idx_slack_user_mapping_user ON slack_user_mappings(user_id);
CREATE INDEX idx_slack_user_mapping_slack ON slack_user_mappings(slack_team_id, slack_user_id);
```

---

## 11. Message Formatting with Block Kit

### Block Kit Builder

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
      elements: elements.map((text) => ({
        type: 'mrkdwn',
        text,
      })),
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

  image(url: string, altText: string, title?: string): this {
    this.blocks.push({
      type: 'image',
      image_url: url,
      alt_text: altText,
      ...(title && { title: { type: 'plain_text', text: title } }),
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
    initialValue?: string;
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
        ...(params.initialValue && { initial_value: params.initialValue }),
      },
      label: { type: 'plain_text', text: params.label },
    });
    return this;
  }

  select(params: {
    blockId: string;
    actionId: string;
    label: string;
    placeholder?: string;
    options: Array<{ text: string; value: string }>;
    initialOption?: { text: string; value: string };
  }): this {
    this.blocks.push({
      type: 'input',
      block_id: params.blockId,
      element: {
        type: 'static_select',
        action_id: params.actionId,
        ...(params.placeholder && {
          placeholder: { type: 'plain_text', text: params.placeholder },
        }),
        options: params.options.map((opt) => ({
          text: { type: 'plain_text', text: opt.text },
          value: opt.value,
        })),
        ...(params.initialOption && {
          initial_option: {
            text: { type: 'plain_text', text: params.initialOption.text },
            value: params.initialOption.value,
          },
        }),
      },
      label: { type: 'plain_text', text: params.label },
    });
    return this;
  }

  build(): Block[] {
    return this.blocks;
  }

  // Static factory methods for common patterns
  static taskCard(task: Task): Block[] {
    const builder = new SlackBlockBuilder();

    const statusEmoji = {
      pending: '⬜',
      in_progress: '🔄',
      completed: '✅',
    }[task.status];

    const priorityEmoji = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    }[task.priority];

    builder
      .section(`${statusEmoji} *${task.title}*`)
      .context([
        `${priorityEmoji} ${task.priority}`,
        `Created: <!date^${Math.floor(new Date(task.createdAt).getTime() / 1000)}^{date_short}|${task.createdAt}>`,
      ]);

    if (task.status !== 'completed') {
      builder.actions([
        { text: 'Complete', actionId: 'complete_task', value: task.id, style: 'primary' },
        { text: 'Edit', actionId: 'edit_task', value: task.id },
        { text: 'Delete', actionId: 'delete_task', value: task.id, style: 'danger' },
      ]);
    }

    return builder.build();
  }

  static taskList(tasks: Task[], title: string = 'Tasks'): Block[] {
    const builder = new SlackBlockBuilder();

    builder.header(title).divider();

    if (tasks.length === 0) {
      builder.section('_No tasks found._');
    } else {
      for (const task of tasks) {
        builder.blocks.push(...SlackBlockBuilder.taskCard(task));
        builder.divider();
      }
    }

    return builder.build();
  }
}
```

### Common Message Patterns

```typescript
// Notification message
function buildTaskNotification(task: Task, action: string, userId: string): Block[] {
  return new SlackBlockBuilder()
    .section(`<@${userId}> ${action} a task:`)
    .sectionWithButton(`*${task.title}*\n${task.description ?? '_No description_'}`, {
      text: 'View Details',
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

// Success confirmation
function buildSuccessMessage(message: string, action?: { text: string; url: string }): Block[] {
  const builder = new SlackBlockBuilder().section(`✅ ${message}`);

  if (action) {
    builder.actions([
      {
        text: action.text,
        actionId: 'open_link',
        value: action.url,
      },
    ]);
  }

  return builder.build();
}
```

---

## 12. Data Persistence with D1 and KV

### Installation Repository

```typescript
// src/infrastructure/repositories/D1SlackInstallationRepository.ts

import { SlackInstallation } from '../../domain/entities/SlackInstallation';

export interface SlackInstallationRecord {
  id: string;
  team_id: string;
  team_name: string;
  bot_user_id: string;
  bot_token: string;
  scope: string;
  installed_by: string;
  installed_at: string;
  updated_at: string;
}

export class D1SlackInstallationRepository {
  constructor(private readonly db: D1Database) {}

  async findByTeamId(teamId: string): Promise<SlackInstallation | null> {
    const result = await this.db
      .prepare('SELECT * FROM slack_installations WHERE team_id = ?')
      .bind(teamId)
      .first<SlackInstallationRecord>();

    if (!result) return null;

    return this.toDomain(result);
  }

  async upsert(
    installation: Omit<SlackInstallation, 'id' | 'updatedAt'>
  ): Promise<SlackInstallation> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `
        INSERT INTO slack_installations (
          id, team_id, team_name, bot_user_id, bot_token,
          scope, installed_by, installed_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (team_id) DO UPDATE SET
          team_name = excluded.team_name,
          bot_user_id = excluded.bot_user_id,
          bot_token = excluded.bot_token,
          scope = excluded.scope,
          updated_at = excluded.updated_at
      `
      )
      .bind(
        id,
        installation.teamId,
        installation.teamName,
        installation.botUserId,
        installation.botToken,
        installation.scope,
        installation.installedBy,
        installation.installedAt,
        now
      )
      .run();

    return this.findByTeamId(installation.teamId) as Promise<SlackInstallation>;
  }

  async delete(teamId: string): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM slack_installations WHERE team_id = ?')
      .bind(teamId)
      .run();

    return result.meta.changes > 0;
  }

  async findAll(): Promise<SlackInstallation[]> {
    const results = await this.db
      .prepare('SELECT * FROM slack_installations ORDER BY installed_at DESC')
      .all<SlackInstallationRecord>();

    return results.results.map((r) => this.toDomain(r));
  }

  private toDomain(record: SlackInstallationRecord): SlackInstallation {
    return {
      id: record.id,
      teamId: record.team_id,
      teamName: record.team_name,
      botUserId: record.bot_user_id,
      botToken: record.bot_token,
      scope: record.scope,
      installedBy: record.installed_by,
      installedAt: record.installed_at,
      updatedAt: record.updated_at,
    };
  }
}
```

### Caching Strategy

```typescript
// src/infrastructure/cache/SlackInstallationCache.ts

export class SlackInstallationCache {
  private readonly TTL_SECONDS = 300; // 5 minutes

  constructor(
    private readonly kv: KVNamespace,
    private readonly repository: D1SlackInstallationRepository
  ) {}

  async get(teamId: string): Promise<SlackInstallation | null> {
    // Try cache first
    const cached = await this.kv.get(`installation:${teamId}`);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const installation = await this.repository.findByTeamId(teamId);

    if (installation) {
      // Cache for future requests
      await this.kv.put(`installation:${teamId}`, JSON.stringify(installation), {
        expirationTtl: this.TTL_SECONDS,
      });
    }

    return installation;
  }

  async invalidate(teamId: string): Promise<void> {
    await this.kv.delete(`installation:${teamId}`);
  }

  async refresh(teamId: string): Promise<SlackInstallation | null> {
    await this.invalidate(teamId);
    return this.get(teamId);
  }
}
```

### Token Security

Bot tokens are sensitive and should be handled carefully:

```typescript
// Never log tokens
console.log('Installation:', { teamId: inst.teamId, hasToken: !!inst.botToken });

// Consider encryption at rest for highly sensitive deployments
// (D1 already encrypts at rest, but you can add application-level encryption)

async function encryptToken(token: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(token);

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decryptToken(encrypted: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(
    atob(encrypted)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

  return new TextDecoder().decode(decrypted);
}
```

---

## 13. Domain-Driven Design Patterns

### Slack-Specific Value Objects

```typescript
// src/domain/value-objects/SlackUserId.ts

declare const __brand: unique symbol;

export type SlackUserId = string & { readonly [__brand]: 'SlackUserId' };

export function createSlackUserId(id: string): SlackUserId {
  if (!isValidSlackUserId(id)) {
    throw new Error(`Invalid Slack user ID: ${id}`);
  }
  return id as SlackUserId;
}

export function isValidSlackUserId(id: string): boolean {
  // Slack user IDs start with U or W (for enterprise)
  return /^[UW][A-Z0-9]{8,}$/.test(id);
}

// src/domain/value-objects/SlackTeamId.ts

export type SlackTeamId = string & { readonly [__brand]: 'SlackTeamId' };

export function createSlackTeamId(id: string): SlackTeamId {
  if (!isValidSlackTeamId(id)) {
    throw new Error(`Invalid Slack team ID: ${id}`);
  }
  return id as SlackTeamId;
}

export function isValidSlackTeamId(id: string): boolean {
  // Team IDs start with T
  return /^T[A-Z0-9]{8,}$/.test(id);
}

// src/domain/value-objects/SlackChannelId.ts

export type SlackChannelId = string & { readonly [__brand]: 'SlackChannelId' };

export function createSlackChannelId(id: string): SlackChannelId {
  if (!isValidSlackChannelId(id)) {
    throw new Error(`Invalid Slack channel ID: ${id}`);
  }
  return id as SlackChannelId;
}

export function isValidSlackChannelId(id: string): boolean {
  // Channel IDs start with C (public), G (private/group), or D (DM)
  return /^[CGD][A-Z0-9]{8,}$/.test(id);
}

// src/domain/value-objects/SlackTimestamp.ts

export type SlackTimestamp = string & { readonly [__brand]: 'SlackTimestamp' };

export function createSlackTimestamp(ts: string): SlackTimestamp {
  if (!isValidSlackTimestamp(ts)) {
    throw new Error(`Invalid Slack timestamp: ${ts}`);
  }
  return ts as SlackTimestamp;
}

export function isValidSlackTimestamp(ts: string): boolean {
  // Timestamps are Unix time with microseconds: "1234567890.123456"
  return /^\d{10}\.\d{6}$/.test(ts);
}

export function slackTimestampToDate(ts: SlackTimestamp): Date {
  const seconds = parseFloat(ts);
  return new Date(seconds * 1000);
}
```

### Slack Installation Entity

```typescript
// src/domain/entities/SlackInstallation.ts

import { SlackTeamId, createSlackTeamId } from '../value-objects/SlackTeamId';
import { SlackUserId, createSlackUserId } from '../value-objects/SlackUserId';

export interface SlackInstallationProps {
  id: string;
  teamId: SlackTeamId;
  teamName: string;
  botUserId: SlackUserId;
  botToken: string;
  scope: string;
  installedBy: SlackUserId;
  installedAt: Date;
  updatedAt: Date;
}

export class SlackInstallation {
  private constructor(private readonly props: SlackInstallationProps) {}

  static create(props: {
    teamId: string;
    teamName: string;
    botUserId: string;
    botToken: string;
    scope: string;
    installedBy: string;
  }): SlackInstallation {
    return new SlackInstallation({
      id: crypto.randomUUID(),
      teamId: createSlackTeamId(props.teamId),
      teamName: props.teamName,
      botUserId: createSlackUserId(props.botUserId),
      botToken: props.botToken,
      scope: props.scope,
      installedBy: createSlackUserId(props.installedBy),
      installedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: SlackInstallationProps): SlackInstallation {
    return new SlackInstallation(props);
  }

  get id(): string {
    return this.props.id;
  }
  get teamId(): SlackTeamId {
    return this.props.teamId;
  }
  get teamName(): string {
    return this.props.teamName;
  }
  get botUserId(): SlackUserId {
    return this.props.botUserId;
  }
  get botToken(): string {
    return this.props.botToken;
  }
  get scope(): string {
    return this.props.scope;
  }
  get installedBy(): SlackUserId {
    return this.props.installedBy;
  }
  get installedAt(): Date {
    return this.props.installedAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  hasScope(scope: string): boolean {
    return this.props.scope.split(',').includes(scope);
  }

  updateToken(newToken: string): SlackInstallation {
    return new SlackInstallation({
      ...this.props,
      botToken: newToken,
      updatedAt: new Date(),
    });
  }
}
```

### Domain Service for Slack Notifications

```typescript
// src/domain/services/TaskNotificationService.ts

import { Task } from '../entities/Task';
import { SlackTeamId } from '../value-objects/SlackTeamId';
import { SlackChannelId } from '../value-objects/SlackChannelId';

// Define the interface in the domain (port)
export interface SlackNotifier {
  sendTaskCreated(teamId: SlackTeamId, channelId: SlackChannelId, task: Task): Promise<void>;

  sendTaskCompleted(
    teamId: SlackTeamId,
    channelId: SlackChannelId,
    task: Task,
    completedBy: string
  ): Promise<void>;
}

// Domain service orchestrates the logic
export class TaskNotificationService {
  constructor(private readonly notifier: SlackNotifier) {}

  async notifyTaskCreated(task: Task): Promise<void> {
    if (!task.slackTeamId || !task.slackChannelId) {
      return; // Not a Slack-originated task
    }

    await this.notifier.sendTaskCreated(task.slackTeamId, task.slackChannelId, task);
  }

  async notifyTaskCompleted(task: Task, completedBy: string): Promise<void> {
    if (!task.slackTeamId || !task.slackChannelId) {
      return;
    }

    await this.notifier.sendTaskCompleted(task.slackTeamId, task.slackChannelId, task, completedBy);
  }
}
```

### Infrastructure Adapter

```typescript
// src/infrastructure/services/SlackNotificationAdapter.ts

import { SlackNotifier } from '../../domain/services/TaskNotificationService';
import { SlackApiClient } from '../slack/SlackApiClient';
import { SlackInstallationCache } from '../cache/SlackInstallationCache';
import { SlackBlockBuilder } from '../slack/SlackBlockBuilder';
import { Task } from '../../domain/entities/Task';
import { SlackTeamId } from '../../domain/value-objects/SlackTeamId';
import { SlackChannelId } from '../../domain/value-objects/SlackChannelId';

export class SlackNotificationAdapter implements SlackNotifier {
  constructor(
    private readonly apiClient: SlackApiClient,
    private readonly installationCache: SlackInstallationCache
  ) {}

  async sendTaskCreated(teamId: SlackTeamId, channelId: SlackChannelId, task: Task): Promise<void> {
    const installation = await this.installationCache.get(teamId);

    if (!installation) {
      console.warn('No installation found for team:', teamId);
      return;
    }

    await this.apiClient.postMessage({
      token: installation.botToken,
      channel: channelId,
      blocks: SlackBlockBuilder.taskCard(task),
      text: `New task: ${task.title}`, // Fallback for notifications
    });
  }

  async sendTaskCompleted(
    teamId: SlackTeamId,
    channelId: SlackChannelId,
    task: Task,
    completedBy: string
  ): Promise<void> {
    const installation = await this.installationCache.get(teamId);

    if (!installation) {
      return;
    }

    await this.apiClient.postMessage({
      token: installation.botToken,
      channel: channelId,
      text: `✅ Task completed: ${task.title} (by <@${completedBy}>)`,
    });
  }
}
```

---

## 14. Testing Strategies

### Test Fixtures

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
      item: {
        type: 'message',
        channel: 'C12345678',
        ts: '1234567890.123456',
      },
      item_user: 'U87654321',
    };
    return this;
  }

  build(): SlackEventEnvelope {
    return { ...this.envelope };
  }
}

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

  withTeamId(teamId: string): this {
    this.payload.team_id = teamId;
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

### Unit Tests for Event Handlers

```typescript
// src/application/event-handlers/AppMentionHandler.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppMentionHandler } from './AppMentionHandler';
import { SlackEventBuilder } from '../../../tests/fixtures/SlackEventBuilder';

describe('AppMentionHandler', () => {
  let handler: AppMentionHandler;
  let mockEnv: Env;
  let mockSlackApi: {
    postMessage: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSlackApi = {
      postMessage: vi.fn().mockResolvedValue({ ok: true }),
    };

    mockEnv = {
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
    // Inject mock API client
    (handler as any).slackApi = mockSlackApi;
  });

  describe('handle', () => {
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

    it('should respond to create task command', async () => {
      const event = new SlackEventBuilder()
        .withAppMention('<@U_BOT> create task: Review PR')
        .build();

      await handler.handle(event.event as AppMentionEvent, event);

      expect(mockSlackApi.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'C12345678',
          blocks: expect.arrayContaining([
            expect.objectContaining({
              type: 'section',
            }),
          ]),
        })
      );
    });

    it('should respond with help for unknown commands', async () => {
      const event = new SlackEventBuilder().withAppMention('<@U_BOT> unknown command').build();

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
});
```

### Integration Tests

```typescript
// tests/integration/slack/events.integration.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { unstable_dev } from 'wrangler';
import type { UnstableDevWorker } from 'wrangler';
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
      challenge: 'test-challenge-string',
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
    expect(await response.text()).toBe('test-challenge-string');
  });

  it('should reject requests with invalid signatures', async () => {
    const body = JSON.stringify(new SlackEventBuilder().withMessageEvent('test').build());

    const response = await worker.fetch('/slack/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Slack-Signature': 'v0=invalid',
        'X-Slack-Request-Timestamp': String(Math.floor(Date.now() / 1000)),
      },
      body,
    });

    expect(response.status).toBe(401);
  });

  it('should acknowledge valid events', async () => {
    const event = new SlackEventBuilder()
      .withTeamId('T12345678')
      .withAppMention('<@U_BOT> hello')
      .build();

    const body = JSON.stringify(event);
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
  });
});
```

### Test Helpers

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

## 15. Complete Implementation Example

### Router Integration

```typescript
// src/router.ts

import { handleSlackEvents } from './presentation/handlers/slack/EventsHandler';
import { handleSlackCommands } from './presentation/handlers/slack/CommandsHandler';
import { handleSlackInteractions } from './presentation/handlers/slack/InteractionsHandler';
import {
  handleSlackInstall,
  handleSlackCallback,
} from './presentation/handlers/slack/OAuthHandler';

export interface Route {
  pattern: RegExp;
  method: string;
  handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
}

export const routes: Route[] = [
  // Web application routes
  { pattern: /^\/$/, method: 'GET', handler: handleHome },
  { pattern: /^\/tasks$/, method: 'GET', handler: handleTasksPage },
  { pattern: /^\/api\/tasks$/, method: 'POST', handler: handleCreateTask },

  // Slack integration routes
  { pattern: /^\/slack\/events$/, method: 'POST', handler: handleSlackEvents },
  { pattern: /^\/slack\/commands$/, method: 'POST', handler: handleSlackCommands },
  { pattern: /^\/slack\/interactions$/, method: 'POST', handler: handleSlackInteractions },
  { pattern: /^\/slack\/install$/, method: 'GET', handler: handleSlackInstall },
  { pattern: /^\/slack\/oauth\/callback$/, method: 'GET', handler: handleSlackCallback },
];

export function matchRoute(request: Request): Route | null {
  const url = new URL(request.url);
  const path = url.pathname;

  for (const route of routes) {
    if (route.method === request.method && route.pattern.test(path)) {
      return route;
    }
  }

  return null;
}
```

### Worker Entry Point

```typescript
// src/index.ts

import { matchRoute } from './router';
import { addSecurityHeaders } from './presentation/middleware/securityHeaders';

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_SIGNING_SECRET: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const route = matchRoute(request);

      if (!route) {
        return new Response('Not Found', { status: 404 });
      }

      const response = await route.handler(request, env, ctx);

      // Add security headers to all responses
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('Unhandled error:', error);

      const message = env.ENVIRONMENT === 'production' ? 'An error occurred' : String(error);

      return new Response(message, { status: 500 });
    }
  },
};
```

### Slack API Client

```typescript
// src/infrastructure/slack/SlackApiClient.ts

export interface PostMessageParams {
  token: string;
  channel: string;
  text?: string;
  blocks?: Block[];
  thread_ts?: string;
  reply_broadcast?: boolean;
}

export interface OpenViewParams {
  token: string;
  trigger_id: string;
  view: SlackView;
}

export interface UpdateMessageParams {
  token: string;
  channel: string;
  ts: string;
  text?: string;
  blocks?: Block[];
}

export class SlackApiClient {
  private readonly baseUrl = 'https://slack.com/api';

  constructor(private readonly env: Env) {}

  async postMessage(params: PostMessageParams): Promise<SlackApiResponse> {
    return this.apiCall('chat.postMessage', params.token, {
      channel: params.channel,
      text: params.text,
      blocks: params.blocks,
      thread_ts: params.thread_ts,
      reply_broadcast: params.reply_broadcast,
    });
  }

  async openView(params: OpenViewParams): Promise<SlackApiResponse> {
    return this.apiCall('views.open', params.token, {
      trigger_id: params.trigger_id,
      view: params.view,
    });
  }

  async updateView(params: {
    token: string;
    view_id: string;
    view: SlackView;
  }): Promise<SlackApiResponse> {
    return this.apiCall('views.update', params.token, {
      view_id: params.view_id,
      view: params.view,
    });
  }

  async updateMessage(params: UpdateMessageParams): Promise<SlackApiResponse> {
    return this.apiCall('chat.update', params.token, {
      channel: params.channel,
      ts: params.ts,
      text: params.text,
      blocks: params.blocks,
    });
  }

  async addReaction(params: {
    token: string;
    channel: string;
    timestamp: string;
    name: string;
  }): Promise<SlackApiResponse> {
    return this.apiCall('reactions.add', params.token, {
      channel: params.channel,
      timestamp: params.timestamp,
      name: params.name,
    });
  }

  async getUserInfo(params: { token: string; user: string }): Promise<SlackApiResponse> {
    return this.apiCall('users.info', params.token, {
      user: params.user,
    });
  }

  private async apiCall(
    method: string,
    token: string,
    body: Record<string, unknown>
  ): Promise<SlackApiResponse> {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    const result = (await response.json()) as SlackApiResponse;

    if (!result.ok) {
      console.error(`Slack API error (${method}):`, result.error);
    }

    return result;
  }
}

export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  warning?: string;
  response_metadata?: {
    warnings?: string[];
    messages?: string[];
  };
  [key: string]: unknown;
}
```

---

## 16. Deployment and Operations

### Wrangler Configuration

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-app",
  "main": "src/index.ts",
  "compatibility_date": "2026-01-01",
  "compatibility_flags": ["nodejs_compat"],

  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-app-db",
      "database_id": "your-database-id",
      "migrations_dir": "migrations",
    },
  ],

  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "your-kv-id",
    },
  ],

  "vars": {
    "ENVIRONMENT": "production",
    "SLACK_CLIENT_ID": "your-client-id",
  },

  // Development overrides
  "env": {
    "staging": {
      "vars": {
        "ENVIRONMENT": "staging",
      },
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "your-app-db-staging",
          "database_id": "staging-db-id",
        },
      ],
    },
  },
}
```

### Deployment Commands

```bash
# Set secrets (do this first, only needed once per environment)
wrangler secret put SLACK_CLIENT_SECRET
wrangler secret put SLACK_SIGNING_SECRET

# Run migrations
wrangler d1 migrations apply your-app-db

# Deploy to production
wrangler deploy

# Deploy to staging
wrangler deploy --env staging

# View logs
wrangler tail

# Local development
wrangler dev
```

### Monitoring and Logging

```typescript
// src/infrastructure/logging/SlackEventLogger.ts

export class SlackEventLogger {
  log(event: string, data: Record<string, unknown>): void {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        ...this.sanitize(data),
      })
    );
  }

  error(event: string, error: unknown, data?: Record<string, unknown>): void {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...this.sanitize(data ?? {}),
      })
    );
  }

  private sanitize(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveKeys = ['token', 'botToken', 'access_token', 'client_secret'];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

// Usage
const logger = new SlackEventLogger();

logger.log('slack_event_received', {
  type: event.type,
  teamId: envelope.team_id,
  eventId: envelope.event_id,
});

logger.error('slack_event_processing_failed', error, {
  eventId: envelope.event_id,
});
```

### Health Check Endpoint

```typescript
// Add to router
{ pattern: /^\/health$/, method: 'GET', handler: handleHealthCheck },

async function handleHealthCheck(
  request: Request,
  env: Env
): Promise<Response> {
  const checks: Record<string, boolean> = {};

  // Check D1
  try {
    await env.DB.prepare('SELECT 1').first();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  // Check KV
  try {
    await env.CACHE.put('health-check', 'ok', { expirationTtl: 60 });
    checks.cache = true;
  } catch {
    checks.cache = false;
  }

  const healthy = Object.values(checks).every(v => v);

  return new Response(JSON.stringify({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }), {
    status: healthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## 17. Best Practices and Patterns

### Error Handling

```typescript
// Always acknowledge first, then process
export async function handleSlackEvents(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  // Verify request first
  const verification = await verifySlackRequest(request, env);

  if (!verification.valid) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Acknowledge immediately
  const response = new Response('', { status: 200 });

  // Process asynchronously with error handling
  ctx.waitUntil(
    processEvent(verification.body!, env).catch((error) => {
      console.error('Event processing failed:', error);
      // Consider alerting, retry queue, etc.
    })
  );

  return response;
}
```

### Rate Limiting Slack API Calls

```typescript
// Implement exponential backoff for rate limits
async function callSlackApiWithRetry(
  fn: () => Promise<SlackApiResponse>,
  maxRetries = 3
): Promise<SlackApiResponse> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();

      if (result.ok) {
        return result;
      }

      if (result.error === 'ratelimited') {
        const retryAfter = result.response_metadata?.retry_after ?? Math.pow(2, attempt) * 1000;
        await sleep(retryAfter);
        continue;
      }

      // Non-retryable error
      return result;
    } catch (error) {
      lastError = error as Error;
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  throw lastError ?? new Error('Max retries exceeded');
}
```

### Idempotency

```typescript
// Ensure operations are idempotent
async function processTaskCreation(payload: CreateTaskRequest, env: Env): Promise<Task> {
  // Generate idempotency key from request
  const idempotencyKey = `task:${payload.slackTeamId}:${payload.slackUserId}:${payload.title}`;

  // Check if already processed
  const existing = await env.CACHE.get(idempotencyKey);

  if (existing) {
    return JSON.parse(existing);
  }

  // Create task
  const task = await createTask(payload, env);

  // Cache result with TTL
  await env.CACHE.put(idempotencyKey, JSON.stringify(task), {
    expirationTtl: 300, // 5 minutes
  });

  return task;
}
```

### Graceful Degradation

```typescript
// Handle missing installations gracefully
async function sendSlackNotification(
  teamId: string,
  channelId: string,
  message: string,
  env: Env
): Promise<boolean> {
  try {
    const installation = await getInstallation(teamId, env);

    if (!installation) {
      console.warn('No installation for team:', teamId);
      return false;
    }

    const result = await postMessage({
      token: installation.botToken,
      channel: channelId,
      text: message,
    });

    if (!result.ok) {
      console.warn('Failed to send message:', result.error);

      // Handle specific errors
      if (result.error === 'channel_not_found') {
        // Channel deleted, update our records
        await markChannelInactive(channelId, env);
      }

      return false;
    }

    return true;
  } catch (error) {
    console.error('Notification failed:', error);
    return false;
  }
}
```

---

## 18. Troubleshooting Guide

### Common Issues and Solutions

| Issue                  | Cause                  | Solution                                                 |
| ---------------------- | ---------------------- | -------------------------------------------------------- |
| 401 on all requests    | Invalid signing secret | Verify `SLACK_SIGNING_SECRET` matches app settings       |
| URL verification fails | Challenge not returned | Ensure handler returns `payload.challenge` as plain text |
| Events not received    | Wrong URL configured   | Check Event Subscriptions URL in Slack app settings      |
| 3-second timeout       | Slow processing        | Acknowledge immediately, process with `ctx.waitUntil()`  |
| Duplicate events       | No deduplication       | Implement `event_id` tracking in KV                      |
| Bot not responding     | Missing scopes         | Check OAuth scopes include `chat:write`                  |
| Modal not opening      | Invalid trigger_id     | trigger_id expires quickly; use immediately              |
| Message not updating   | Wrong timestamp        | Use exact `ts` from original message                     |

### Debugging Checklist

**For Events:**

1. Check Cloudflare Worker logs for request details
2. Verify signature calculation
3. Confirm event type is subscribed
4. Check bot user is in channel

**For Commands:**

1. Verify command is registered in Slack app
2. Check Request URL matches deployment
3. Test with simple response first
4. Check response format matches Slack spec

**For Interactive Components:**

1. Verify Interactivity URL is set
2. Check action_id matches handler
3. Ensure response_url is used for delayed responses
4. Validate modal view structure

### Logging for Debugging

```typescript
// Detailed request logging (development only)
if (env.ENVIRONMENT !== 'production') {
  console.log('Slack request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.clone().text(),
  });
}
```

---

## Conclusion

This guide has covered the complete implementation of a Slack bot integration for Cloudflare-based interactive web applications. Key takeaways:

1. **Security First**: Always verify Slack request signatures and use secure token storage.

2. **Acknowledge Fast**: Meet Slack's 3-second timeout by acknowledging immediately and processing asynchronously.

3. **Design for Scale**: Use KV caching for installations and implement event deduplication.

4. **Test Thoroughly**: Write unit tests for handlers and integration tests for the complete flow.

5. **Follow Clean Architecture**: Keep domain logic separate from Slack-specific infrastructure.

6. **Handle Errors Gracefully**: Implement retry logic, idempotency, and graceful degradation.

The patterns in this guide build on the architectural foundations from our companion guides, ensuring your Slack integration maintains the same quality standards as your web application.

---

_This guide reflects Slack API best practices as of January 2026. For the latest Slack API documentation, visit [api.slack.com](https://api.slack.com)._
