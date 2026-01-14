# OAuth Installation

**Purpose**: Multi-workspace OAuth installation flow

**When to read**: Supporting multiple Slack workspaces

**Source**: Full implementation in `docs/slack-bot-integration-guide.md` (Section 10)

---

## OAuth Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    User     │─────>│   /slack/   │─────>│    Slack    │
│  Clicks     │      │   install   │      │   OAuth     │
│  "Install"  │      │             │      │   Page      │
└─────────────┘      └─────────────┘      └──────┬──────┘
                                                  │ User Authorizes
                                                  ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Store     │<─────│   /slack/   │<─────│   Slack     │
│   Tokens    │      │  callback   │      │  Redirects  │
│   in D1     │      │             │      │  with Code  │
└─────────────┘      └─────────────┘      └─────────────┘
```

---

## Install Handler

```typescript
// src/presentation/handlers/slack/OAuthHandler.ts

const OAUTH_SCOPES = [
  'app_mentions:read',
  'channels:history',
  'channels:read',
  'chat:write',
  'commands',
  'reactions:read',
  'users:read',
].join(',');

export async function handleSlackInstall(request: Request, env: Env): Promise<Response> {
  // Generate state for CSRF protection
  const state = generateSecureState();

  await env.CACHE.put(`oauth_state:${state}`, 'pending', {
    expirationTtl: 600, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    scope: OAUTH_SCOPES,
    state,
    redirect_uri: `${getBaseUrl(request)}/slack/oauth/callback`,
  });

  const oauthUrl = `https://slack.com/oauth/v2/authorize?${params}`;

  return Response.redirect(oauthUrl, 302);
}

function generateSecureState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
```

---

## Callback Handler

```typescript
export async function handleSlackCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return renderError('Installation was cancelled or failed.');
  }

  // Validate state (CSRF protection)
  if (!state) {
    return renderError('Invalid request: missing state.');
  }

  const storedState = await env.CACHE.get(`oauth_state:${state}`);

  if (!storedState) {
    return renderError('Invalid or expired state.');
  }

  await env.CACHE.delete(`oauth_state:${state}`);

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

    // Cache for quick access
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
    return renderError('An unexpected error occurred.');
  }
}
```

---

## OAuth Client

```typescript
// src/infrastructure/slack/SlackOAuthClient.ts

export class SlackOAuthClient {
  constructor(private readonly env: Env) {}

  async exchangeCode(params: { code: string; redirect_uri: string }): Promise<OAuthTokenResponse> {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.env.SLACK_CLIENT_ID,
        client_secret: this.env.SLACK_CLIENT_SECRET,
        code: params.code,
        redirect_uri: params.redirect_uri,
      }),
    });

    return response.json();
  }
}

export interface OAuthTokenResponse {
  ok: boolean;
  error?: string;
  access_token: string;
  bot_user_id: string;
  scope: string;
  team: { id: string; name: string };
  authed_user: { id: string };
}
```

---

## Database Schema

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
  updated_at TEXT NOT NULL
);

CREATE TABLE slack_user_mappings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  slack_team_id TEXT NOT NULL,
  slack_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (slack_team_id, slack_user_id)
);
```

---

## Security Considerations

1. **Use state parameter** - CSRF protection
2. **Short TTL for state** - 10 minutes max
3. **Never log tokens** - Sensitive credentials
4. **Store tokens in D1** - Not in KV (no encryption)

---

## Next Steps

- For data persistence patterns → Read `implementation/block-kit-messaging.md`
- For testing → Read `implementation/testing.md`
