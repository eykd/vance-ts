---
name: wrangler-sprite-auth
description: Authenticate Cloudflare Wrangler in Sprite environments using OAuth. Use when (1) npx wrangler login fails with callback errors, (2) setting up Wrangler for first time in Sprite, (3) OAuth redirects to localhost don't work, (4) user needs to authenticate with Cloudflare Workers/Pages.
---

# Wrangler Sprite Authentication

Authenticates Cloudflare Wrangler in Sprite using OAuth flow with sprite proxy.

## Problem

`npx wrangler login` OAuth callback redirects to `localhost:8976`, which doesn't work in remote/containerized Sprite environments.

## Solution

1. **Start Wrangler OAuth server** (binds to all interfaces):

```bash
npx wrangler login --callback-host 0.0.0.0 --callback-port 8976 > /tmp/wrangler-oauth.log 2>&1 &
sleep 3
```

2. **Instruct user** to run on their host machine:

```
sprite proxy 8976
```

3. **Extract OAuth URL** from log and provide to user:

```bash
grep "https://dash.cloudflare.com/oauth2/auth" /tmp/wrangler-oauth.log
```

4. **User completes OAuth** in browser. The callback to `localhost:8976` will be forwarded by `sprite proxy` to the Wrangler server inside Sprite.

5. **Verify authentication**:

```bash
npx wrangler whoami
```

6. **Clean up** background process:

```bash
pkill -f "wrangler login"
```

7. **Create checkpoint** to preserve auth state:

```bash
sprite-env checkpoints create "Authenticated with Cloudflare Wrangler"
```

## How It Works

- `sprite proxy 8976` forwards host's `localhost:8976` → Sprite container's port 8976
- Wrangler binds to `0.0.0.0:8976` inside container to accept external connections
- OAuth flow: browser → Cloudflare → `localhost:8976` → sprite proxy → container → wrangler
- Credentials stored in `~/.wrangler/config/` persist across Sprite sessions

## Troubleshooting

**Port already in use**:

```bash
ss -tlnp | grep 8976
kill -9 <PID>
```

**Check OAuth completion**:

```bash
cat /tmp/wrangler-oauth.log | tail -5
```
