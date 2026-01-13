# Phase 5: Set Up Error Tracking (Optional)

Error tracking is optional but highly recommended for production apps. It helps you:

- Get instant alerts when errors occur
- See full stack traces and debugging info
- Track error frequency and affected users
- Debug production issues without SSH access

We'll use Sentry because it's free (5,000 errors/month), integrates easily with JavaScript/TypeScript, and provides excellent error reporting.

**Skip this phase if you don't need error tracking yet**—you can always add it later.

---

## 5.1 Create a Sentry Account

Sentry offers 5,000 free errors per month, which is plenty for most applications.

### Steps

1. Go to [sentry.io/signup](https://sentry.io/signup)
2. Choose **Sign Up with GitHub** (recommended - same account you use for this repo)
   - Or sign up with email if you prefer
3. Complete the registration
4. You'll see the Sentry dashboard

**Note**: No credit card required for the free tier.

---

## 5.2 Create a Project

Sentry organizes errors by project.

### Steps

1. Click **Create Project** on the welcome screen
   - Or if already logged in: **Projects** → **Create Project**
2. Configure your project:
   - **Platform**: Select **Node.js** (Cloudflare Workers uses JavaScript/TypeScript)
   - **Alert me on every new issue**: Leave checked (recommended)
   - **Project name**: Use your Worker name (e.g., "my-worker-production")
   - **Team**: Select the default team
3. Click **Create Project**

---

## 5.3 Get Your DSN (Data Source Name)

The DSN is a URL that tells your Worker where to send error reports.

### Steps

1. After creating the project, you'll see installation instructions
2. Look for the **DSN** - it looks like:
   ```
   https://abc123def456@o789.ingest.sentry.io/123456
   ```
3. **Copy this value and save it** — you'll give this to Claude in Phase 6

### If you need to find your DSN later:

1. Go to **Settings** → **Projects** → [Your Project]
2. Click **Client Keys (DSN)** in the left sidebar
3. Copy the DSN value

---

## 5.4 Configure Your Secret

**SECURITY NOTE**: Do NOT paste your DSN in chat with Claude.

When you're ready to configure error tracking, you'll add this secret directly in the Cloudflare dashboard:

- **SENTRY_DSN**: The `https://...` string you saved

See `secrets-configuration.md` for step-by-step instructions on adding secrets via the Cloudflare dashboard.

---

## Understanding Sentry Pricing

| Tier                 | Cost | Errors/Month |
| -------------------- | ---- | ------------ |
| **Developer** (Free) | $0   | 5,000        |
| **Team**             | $26  | 50,000       |
| **Business**         | $80  | 150,000      |

**For most apps**: The free tier (5,000 errors/month) is sufficient. That's about 160 errors per day.

**What counts as an error?**

- Unhandled exceptions
- 500-level HTTP errors
- Promise rejections
- Custom error events

**What happens if you exceed the quota?**

- Sentry stops accepting new errors until next month
- Your Worker keeps running normally
- You'll get an email notification

---

## Checkpoint: What You Should Have

Before returning to Claude:

- [ ] Sentry account created
- [ ] Project created (Node.js platform)
- [ ] DSN copied and saved (starts with `https://`)

**Got everything?** Return to Claude and provide the DSN when asked.

---

## Troubleshooting

### "I can't find my DSN"

1. Go to [sentry.io](https://sentry.io) and log in
2. Click **Projects** in the left sidebar
3. Click your project name
4. Go to **Settings** → **Client Keys (DSN)**
5. Copy the DSN at the top of the page

### "Which platform should I choose?"

Choose **Node.js**. Cloudflare Workers run JavaScript/TypeScript, so Node.js is the correct platform.

**Don't choose**: Browser JavaScript (that's for frontend apps), Python, Django, etc.

### "Should I create multiple projects?"

For now, just create one project. Later, you can create separate projects for:

- Staging/development environment
- Different Workers (if you deploy multiple)
- Frontend tracking (if you add a web UI)

### "Can I test Sentry before deploying?"

Yes! You can test locally if you're running a development server:

1. Set `SENTRY_DSN` as an environment variable
2. Trigger an error in your code
3. Check Sentry dashboard to see the error

But since you're deploying to Cloudflare Workers, it's easier to just deploy and test in production (with Claude's help).

### "Do I need to configure sampling rates?"

Not initially. Sentry's defaults work well. If you start hitting the 5,000 errors/month limit, you can configure sampling to capture only a percentage of errors. Claude can help with this later if needed.

### "Can I integrate Sentry with other tools?"

Yes! Sentry integrates with:

- **Slack** — Get error notifications in Slack
- **GitHub** — Link errors to commits
- **Jira** — Create tickets from errors

Set these up from **Settings** → **Integrations** in Sentry.

---

## Next Steps

**If you're done with optional services**: Return to Claude to configure secrets (Phase 6) and verify deployment (Phase 7).

**You can always add Sentry later**—just create an account, get a DSN, and tell Claude to set it as a secret.
