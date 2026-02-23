# Phase 3: Deploy Your Application

Now comes the exciting part—Claude will deploy your application to Cloudflare's global network!

## This Boilerplate Uses Cloudflare Workers with Static Assets

This boilerplate is a **Hugo + Cloudflare Worker** hybrid:

- **Hugo** generates static HTML into `./hugo/public/` — served via Workers Static Assets
- **A Worker** (Hono handler) handles dynamic endpoints like `/app/_/*`

The `wrangler.toml` file includes an `[assets]` section that points to `./hugo/public/`, so `wrangler deploy` uploads both the static site and the Worker together.

```bash
wrangler deploy
```

## What Happens During Deployment

When Claude runs the deploy command, a lot happens automatically behind the scenes. Here's what you need to know:

### 3.1 Automatic Infrastructure Creation

Wrangler reads your `wrangler.toml` configuration file and automatically creates:

1. **D1 Database** — A SQL database for storing data (user accounts, application data, etc.)
2. **R2 Storage Bucket** — File storage for uploads, images, and documents
3. **KV Namespace** — Fast key-value storage for caching frequently accessed data
4. **Worker** — Your dynamic endpoint code deployed globally (Hono handler)
5. **Static Assets** — Your Hugo-generated HTML, CSS, and JS served from Cloudflare's network

**The magic**: You don't create these manually. Wrangler sees the configuration and provisions everything for you.

### 3.2 Global Deployment

Your application is deployed to **hundreds of Cloudflare data centers** simultaneously:

- North America: 100+ locations
- Europe: 80+ locations
- Asia Pacific: 70+ locations
- Latin America: 30+ locations
- Middle East & Africa: 40+ locations

When a user visits your app, they automatically connect to the nearest data center. This means:

- **Fast loading times** (typically <50ms response time)
- **High reliability** (if one data center has issues, traffic routes to another)
- **No servers to manage** (Cloudflare handles everything)

---

## 3.3 Claude Runs the Deployment

Here's what Claude does for you:

### Step 1: Verify Authentication

Authentication is handled by the Sprites.dev environment. Claude verifies credentials are working by running:

```bash
npx wrangler whoami
```

If this fails, Claude uses the `wrangler-sprite-auth` skill to authenticate via OAuth.

### Step 2: Build the Project

Claude builds your project:

```bash
npm run build
```

This builds Hugo into `./hugo/public/` and compiles CSS.

### Step 3: Deploy to Cloudflare Workers

Claude runs:

```bash
wrangler deploy
```

Wrangler reads `wrangler.toml`, which specifies the Worker entry point and the `[assets]` directory (`./hugo/public/`), and deploys everything together.

You'll see output like:

```
⛅️ wrangler 3.x.x
-------------------
Total Upload: xx KiB / gzip: xx KiB
Uploaded your-worker-name (x.xx sec)
Published your-worker-name (x.xx sec)
  https://your-worker-name.your-account.workers.dev
```

**What this means:**

- Your static assets and Worker are uploaded together
- It's published globally (takes ~2 seconds)
- You get a URL where your application is live
- A deployment ID lets you track this specific version

---

## 3.4 What Gets Created

After deployment, check your Cloudflare dashboard to see:

### Workers & Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. You'll see your Worker listed with:
   - Name (e.g., "your-worker-name")
   - Status (Active)
   - URL (https://your-worker-name.your-account.workers.dev)
   - Last deployment time

### D1 Database

1. In the dashboard, click **Storage & Databases** → **D1 SQL Database**
2. You'll see your database (e.g., "your-worker-name-db")
3. Click it to see:
   - Size (starts at 0 MB)
   - Number of queries
   - Recent activity

### R2 Storage

1. In the dashboard, click **Storage & Databases** → **R2 Object Storage**
2. You'll see your bucket (e.g., "your-worker-name-storage")
3. Click it to browse files (starts empty)

### KV Namespace

1. In the dashboard, click **Storage & Databases** → **KV**
2. You'll see your namespace (e.g., "your-worker-name-cache")
3. Click it to view cached data (starts empty)

---

## 3.5 Understanding the Deployment Output

When Claude runs `wrangler deploy`, here's what each part means:

| Output            | Meaning                                          |
| ----------------- | ------------------------------------------------ |
| **Total Upload**  | Size of your compiled code                       |
| **gzip**          | Compressed size (what actually gets transferred) |
| **Uploaded**      | Code uploaded to Cloudflare (takes 1-2 seconds)  |
| **Published**     | Code deployed globally (takes <1 second)         |
| **URL**           | Where your Worker is live                        |
| **Deployment ID** | Unique identifier for this version               |

**Performance note**: Most deployments complete in under 3 seconds. Future deployments are even faster because infrastructure already exists.

---

## 3.6 First Deployment vs. Subsequent Deployments

### First Deployment (this one)

- Creates D1 database, R2 bucket, KV namespace
- Creates the Worker (auto-created on first deploy)
- Runs database migrations
- Deploys code and static assets globally
- Takes 2-5 seconds

### Subsequent Deployments

- Infrastructure already exists
- Just deploys updated code and static assets
- Takes 1-2 seconds

**Tip**: After the first deployment, changes deploy almost instantly when you push to GitHub or ask Claude to redeploy.

---

## Checkpoint: What You Should See

After deployment completes:

- [ ] Claude shows you the Worker URL (https://your-worker-name.your-account.workers.dev)
- [ ] No error messages in the deployment output
- [ ] Cloudflare dashboard shows your Worker under "Workers & Pages"
- [ ] D1, R2, and KV resources appear in the dashboard (if configured)

**Everything looks good?** Continue to Phase 4 (Email Setup) if you want email functionality, or skip to Phase 7 (Verify Deployment) to test your application.

---

## Troubleshooting

### "Authentication failed"

Claude's API token might be incorrect or expired:

1. Verify the token you provided to Claude
2. Check that the token has the correct permissions:
   - Workers Scripts → Edit
   - Workers KV Storage → Edit
   - D1 → Edit
   - Workers R2 Storage → Edit
3. If needed, create a new API token and provide it to Claude

### "Worker name already exists"

The Worker name in `wrangler.toml` is already taken in your account:

1. Tell Claude to choose a different Worker name
2. Claude will update `wrangler.toml` with a new name
3. Claude will commit and redeploy

### "Build failed"

There might be TypeScript compilation errors:

1. Claude will show you the error messages
2. Common issues:
   - Missing dependencies (`npm install`)
   - Type errors (Claude can fix these)
   - Syntax errors (Claude can fix these)
3. Claude will fix the errors and redeploy

### "Deployment succeeded but I can't access the URL"

Give it a minute—sometimes DNS propagation takes 30-60 seconds. Try:

1. Wait 1 minute and try again
2. Try in an incognito/private browser window
3. Check the URL is exactly as shown in the deployment output
4. Visit the Cloudflare dashboard to verify the Worker shows as "Active"

### "D1 database wasn't created"

Check your `wrangler.toml` file has the D1 database configuration:

```toml
[[d1_databases]]
binding = "DB"
database_name = "your-worker-name-db"
database_id = "..." # May be empty on first deploy
```

If this section is missing, Claude will add it and redeploy.

### "I see '502 Bad Gateway' or '503 Service Unavailable'"

Your Worker might have a runtime error:

1. Claude will check the Worker logs
2. Look for JavaScript/TypeScript errors
3. Common issues:
   - Missing environment variables (secrets)
   - Database connection errors
   - Uncaught exceptions in code
4. Claude can help debug using the Cloudflare dashboard logs

### "How do I see logs?"

Logs are in the Cloudflare dashboard:

1. Go to **Workers & Pages**
2. Click your Worker name
3. Click the **Logs** tab
4. You'll see real-time logs of requests and errors

Or Claude can run:

```bash
wrangler tail
```

This streams live logs to the terminal.

### "Can I roll back a deployment?"

Yes! Each deployment has a version. In the Cloudflare dashboard:

1. Go to **Workers & Pages** → Your Worker
2. Click the **Deployments** tab
3. Find a previous version
4. Click **Rollback** to revert to that version

Or tell Claude to roll back, and Claude will run:

```bash
wrangler versions rollback <version-id>
```

---

## 3.7 Preview Deployments vs. Production Deployments

For testing changes before they go live, you can deploy branch-specific Workers with a suffixed name.

### How It Works

The production Worker is deployed from the `master` branch. For feature branches, Claude deploys a separate Worker with a branch-suffixed name.

| Deployment Source          | Worker Name                   | URL                                                            |
| -------------------------- | ----------------------------- | -------------------------------------------------------------- |
| Production branch (master) | `myproject`                   | `https://myproject.your-account.workers.dev`                   |
| Any other branch           | `myproject-my-feature-branch` | `https://myproject-my-feature-branch.your-account.workers.dev` |

### Important Implications

1. **Branch Workers are separate Workers**: They are independent deployments with their own bindings (D1, KV, R2). This means preview testing uses isolated infrastructure.

2. **Preview Workers are fully functional**: Branch deployments include all bindings — D1, KV, R2 — everything works. They're perfect for testing.

3. **Preview Workers persist until deleted**: They continue running until explicitly deleted. There's no auto-cleanup.

4. **TLS certificate provisioning takes a few minutes**: When a new Worker URL is created, Cloudflare needs to provision a TLS certificate. During this time (typically 1-3 minutes), you may see TLS/SSL errors when visiting the URL. This is normal — wait a few minutes and try again.

### When Deploying from a Branch

Always inform the user:

- Which URL works NOW (the branch-suffixed Worker URL)
- That the main production URL is served by a separate Worker deployed from master
- Offer to merge and deploy to production if they want the main URL updated

---

## 3.8 Cleaning Up Preview Workers

Preview Workers accumulate over time. While Cloudflare's free tier is generous, cleaning up old preview Workers is good hygiene.

### Listing Worker Versions

```bash
# List versions of a Worker
npx wrangler versions list
```

### Deleting a Preview Worker

```bash
# Delete a branch-specific preview Worker entirely
npx wrangler delete --name myproject-my-feature-branch
```

### Rolling Back a Version

```bash
# Roll back to a previous version
npx wrangler versions rollback <version-id>
```

### When to Offer Cleanup

**Always offer to clean up preview Workers** in these situations:

1. **After merging a feature branch to production** — The preview Worker for that branch is no longer needed
2. **When there are many branch-specific Workers** — Suggest cleaning up Workers for branches that have been merged or deleted
3. **After deleting a feature branch** — The associated preview Worker can be removed
4. **Periodically during maintenance** — Offer to review and clean up stale Workers

### Example Cleanup Flow

```
Claude: "I see you have 4 preview Workers from old branches. Would you like me to delete the ones for branches that have been merged? I'll keep the production Worker and any active branch previews."

User: "Yes please"

Claude: [Lists preview Workers, identifies old ones, deletes them]
Claude: "Done! I removed 3 old preview Workers. Your production Worker and 1 active preview are still running."
```

---

## 3.9 Deploying Scheduled Workers (Optional)

If your project includes scheduled tasks (cron triggers), these are configured directly in `wrangler.toml` using the `[triggers]` section:

```toml
[triggers]
crons = ["0 0 * * *"]  # Example: daily at midnight UTC
```

Workers with Static Assets fully supports `[triggers]`, so there's no need for a separate Worker deployment. Just run:

```bash
wrangler deploy
```

**When to use scheduled triggers:**

- Periodic reports (daily, weekly)
- Scheduled cleanup tasks
- Time-based notifications
- Regular data synchronization

---

## Next Steps

**If you want email functionality**: Continue to `email-setup.md` to configure Resend.

**If you want error tracking**: Continue to `sentry-setup.md` to configure Sentry.

**If you want to test your Worker now**: Skip to `verify-deployment.md` to check that everything works.

**All optional services can be added later**—your Worker is already live and functional!
