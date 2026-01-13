# Phase 6: Configure Secrets

Now that your Worker is deployed, you'll configure any secrets you need (Resend API key, Sentry DSN, etc.).

**CRITICAL SECURITY NOTE**: You will configure secrets directly in the Cloudflare dashboard or your environment settings. **NEVER paste secret values in the chat with Claude**—this is a security risk.

## What Are Secrets?

**Secrets** are sensitive values (like API keys, passwords, tokens) that your Worker needs to function, but shouldn't be visible in your code or version control.

Think of secrets as:

- **Encrypted storage** for sensitive data
- **Environment variables** that only exist in production
- **Secure vaults** that your Worker can access at runtime

Examples of secrets:

- Resend API key (for sending emails)
- Sentry DSN (for error tracking)
- Database credentials (if using external databases)
- Third-party API tokens

---

## 6.1 How to Configure Secrets

You have two options for configuring secrets:

### Option A: Cloudflare Dashboard (Recommended)

This is the safest and easiest method:

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. Click on your Worker name
4. Click the **Settings** tab
5. Scroll to **Environment Variables**
6. Under **Production**, click **Add variable**
7. For each secret:
   - **Type**: Select "Secret" (not "Text")
   - **Variable name**: Enter the secret name (e.g., `RESEND_API_KEY`)
   - **Value**: Paste your secret value
   - Click **Add variable**
8. Click **Save and deploy**

### Option B: Claude Code Environment Settings

If you're using Claude Code for Web with environment support:

1. Configure secrets in your Claude Code environment settings
2. These will be available to wrangler commands
3. Claude can then run `wrangler secret put` using the environment configuration

**Never share secret values in the chat**

### Accessing Secrets in Your Worker

Your Worker code accesses secrets through the `env` object:

```typescript
// In your Worker code
export default {
  async fetch(request, env) {
    const resendKey = env.RESEND_API_KEY;
    const sentryDSN = env.SENTRY_DSN;

    // Use the secrets...
  },
};
```

The secrets are injected at runtime—they never appear in your source code.

---

## 6.2 What Secrets to Configure

Based on the optional services you set up, you'll need to configure these secrets:

### If you set up Resend (Email):

| Secret Name          | Value                    | Purpose                                  |
| -------------------- | ------------------------ | ---------------------------------------- |
| `RESEND_API_KEY`     | `re_...`                 | Your Resend API key for sending emails   |
| `DEFAULT_FROM_EMAIL` | `noreply@yourdomain.com` | The email address that appears as sender |

### If you set up Sentry (Error Tracking):

| Secret Name  | Value                                  | Purpose                     |
| ------------ | -------------------------------------- | --------------------------- |
| `SENTRY_DSN` | `https://...@o...ingest.sentry.io/...` | Where to send error reports |

### Other Common Secrets:

You might add more secrets later, such as:

- `DATABASE_URL` — Connection string for external databases
- `API_TOKEN` — Authentication tokens for third-party APIs
- `ENCRYPTION_KEY` — Keys for encrypting user data

---

## 6.3 Using the Dashboard vs. Command Line

### Why the Dashboard is Recommended

The Cloudflare dashboard is the safest method because:

- You paste secrets directly into Cloudflare's secure interface
- Secrets never pass through chat, logs, or temporary files
- You can see all configured secrets in one place
- Changes take effect immediately after saving

### If You Need Command Line (Advanced)

If you're comfortable with the command line and have wrangler configured locally:

```bash
# You run these commands in your terminal, not through Claude
wrangler secret put RESEND_API_KEY
# Wrangler will prompt you to paste the secret value securely
```

**Security Note**: Even when using command line, wrangler prompts you interactively for the secret value—it's never echoed in logs or terminal output.

---

## 6.4 Verifying Secrets Were Set

After Claude configures secrets, you can verify them in the Cloudflare dashboard:

### Steps to Verify

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. Click on your Worker name
4. Click the **Settings** tab
5. Scroll down to **Environment Variables**
6. Under **Secrets**, you'll see a list of configured secrets

**Important**: You'll see the secret _names_ (like `RESEND_API_KEY`) but not the _values_. This is by design—secret values are encrypted and never displayed.

---

## 6.5 Updating Secrets Later

If you need to change a secret value later (e.g., rotate an API key):

### Update Via Dashboard (Easiest)

1. Go to your Worker → **Settings** → **Environment Variables**
2. Find the secret under **Secrets**
3. Click **Edit** next to the secret name
4. Enter the new value
5. Click **Save**

---

## 6.6 Deleting Secrets

If you no longer need a secret:

### Delete Via Dashboard

1. Go to your Worker → **Settings** → **Environment Variables**
2. Find the secret under **Secrets**
3. Click **X** or **Delete** next to the secret name
4. Confirm the deletion
5. Click **Save and deploy**

### Delete Via Command Line

```bash
wrangler secret delete SECRET_NAME
```

This permanently deletes the secret from Cloudflare.

---

## Security Best Practices

### ✅ DO:

- **Rotate secrets regularly** — Change API keys every few months
- **Use specific permissions** — Give API keys minimal required permissions
- **Delete unused secrets** — Remove old secrets you're not using
- **Keep secrets private** — Never share secret values in screenshots, emails, or public places

### ❌ DON'T:

- **Don't commit secrets to git** — Never put secrets in code or config files
- **Don't share secrets in logs** — Make sure your code doesn't log secret values
- **Don't reuse secrets** — Use different secrets for development/staging/production
- **Don't use weak secrets** — Use long, random values for sensitive secrets

---

## Checkpoint: What You Should Have

After Claude configures secrets:

- [ ] Secrets successfully uploaded (Claude shows "✨ Success!" messages)
- [ ] Secrets visible in Cloudflare dashboard under Worker Settings → Environment Variables
- [ ] Secret names match what you expected (RESEND_API_KEY, SENTRY_DSN, etc.)

**All secrets configured?** Continue to `verify-deployment.md` to test your Worker.

---

## Troubleshooting

### "Failed to upload secret"

Claude's API token might lack permissions:

1. Verify the Cloudflare API token has "Workers Scripts → Edit" permission
2. If needed, create a new API token with correct permissions
3. Provide the new token to Claude
4. Claude will retry setting the secrets

### "Secret name is invalid"

Secret names must:

- Start with a letter
- Contain only letters, numbers, and underscores
- Be UPPERCASE by convention (e.g., `RESEND_API_KEY`)

Claude will automatically fix the name format if needed.

### "How do I know if my secret values are correct?"

The best way is to test your Worker:

1. Visit your Worker URL
2. Trigger functionality that uses the secret (e.g., send a test email)
3. Check for errors in the Cloudflare dashboard logs

If something's wrong, Claude can update the secret with the correct value.

### "Can I see my secret values?"

No—secret values are encrypted and never displayed anywhere (dashboard, logs, CLI output). This is a security feature.

If you lose a secret value:

1. Generate a new one from the service (Resend, Sentry, etc.)
2. Tell Claude to update the secret with the new value

### "My Worker can't access the secret"

Check that:

1. The secret name in your code matches exactly (case-sensitive)
2. The secret was successfully uploaded (check dashboard)
3. Your Worker was redeployed after setting the secret (Claude can redeploy)

In your code, access secrets via `env`:

```typescript
const apiKey = env.RESEND_API_KEY; // Matches secret name
```

### "Do secrets work in local development?"

For local development, use a `.dev.vars` file in your project root:

```
RESEND_API_KEY=re_your_dev_key_here
SENTRY_DSN=https://your_dev_dsn_here
```

This file is automatically gitignored and simulates secrets for `wrangler dev`.

**Important**: Use different secret values for local development vs. production.

---

## Next Steps

**All secrets configured?** Continue to `verify-deployment.md` to test that your Worker is functioning correctly with all secrets in place.
