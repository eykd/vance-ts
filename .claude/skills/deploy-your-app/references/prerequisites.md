# Phase 1: Verify Your Credentials

**Good news**: Your Sprites.dev development box comes with Cloudflare credentials pre-provisioned. You don't need to create a Cloudflare account or generate API tokens manually.

---

## 1.1 What's Already Set Up

Your Sprites.dev environment includes:

- **Cloudflare account** — Already created and linked
- **Wrangler authentication** — Pre-configured so Claude can deploy on your behalf
- **Network access** — Cloudflare APIs are already reachable

You don't need to set any environment variables or configure network access. Everything is ready to go.

---

## 1.2 Verifying Credentials

Claude will verify that authentication is working by running:

```bash
npx wrangler whoami
```

**What to expect**: You'll see output showing your Cloudflare account name and account ID. This confirms Claude can deploy to your account.

**Example output**:

```
 ⛅️ wrangler 3.x.x
-------------------
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email user@example.com!
┌─────────────────────────────┬──────────────────────────────────┐
│ Account Name                │ Account ID                       │
├─────────────────────────────┼──────────────────────────────────┤
│ Your Account                │ abc123def456...                  │
└─────────────────────────────┴──────────────────────────────────┘
```

---

## 1.3 If Authentication Fails

If `npx wrangler whoami` doesn't show your account (or shows an error), credentials may not have been provisioned yet. Claude will use the `wrangler-sprite-auth` skill to authenticate via OAuth:

1. Claude starts the Wrangler OAuth flow inside your Sprites.dev box
2. You run `sprite proxy 8976` on your host machine
3. Claude gives you an OAuth URL to open in your browser
4. You log in to Cloudflare and authorize access
5. Claude verifies the connection and creates a checkpoint

This only needs to happen once — credentials persist across sessions.

---

## Checkpoint: What You Should Have

Before moving to Phase 2, confirm:

- [x] Sprites.dev development box running
- [ ] `npx wrangler whoami` shows your Cloudflare account

**All set? Great!** Claude will move on to choosing your project name.

---

## Troubleshooting

### "Do I need a credit card?"

No! Cloudflare Workers free tier doesn't require a credit card. You get:

- 100,000 requests per day
- 5GB D1 database storage
- 10GB R2 file storage
- All completely free, no payment info needed

### "What if I have multiple Cloudflare accounts?"

If you have multiple accounts (personal and work, for example):

1. When authenticating via the OAuth flow, make sure you log in with the correct account
2. After authentication, run `npx wrangler whoami` to confirm you're using the right account
3. If you need to switch accounts, Claude can re-run the `wrangler-sprite-auth` flow

### "Can I revoke this token later?"

Yes! You can manage your OAuth access anytime:

1. Go to **My Profile** → **API Tokens** in the Cloudflare dashboard
2. Find the OAuth token in the list
3. Click **Revoke** to remove access
4. If you revoke it, Claude will need to re-authenticate using the `wrangler-sprite-auth` skill

### "wrangler whoami shows the wrong account"

If you're authenticated with the wrong Cloudflare account:

1. Run `npx wrangler logout` to clear existing credentials
2. Claude will re-run the `wrangler-sprite-auth` flow
3. Log in with the correct Cloudflare account when prompted
