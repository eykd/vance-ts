# Phase 3: Deploy Your Application

Now comes the exciting part—Claude will deploy your application to Cloudflare's global network!

## CRITICAL: This Boilerplate Uses Cloudflare Pages

This boilerplate is a **Hugo + Cloudflare Pages** hybrid:

- **Hugo** generates static HTML → served from Cloudflare's CDN
- **Pages Functions** (`functions/` directory) → handle dynamic endpoints like `/app/_/*`

**Always use `wrangler pages deploy`, NOT `wrangler deploy`!**

```bash
wrangler pages deploy dist --project-name=<project-name>
```

Using `wrangler deploy` will fail with: **"Missing entry-point to Worker script"**

## What Happens During Deployment

When Claude runs the appropriate deploy command, a lot happens automatically behind the scenes. Here's what you need to know:

### 3.1 Automatic Infrastructure Creation

Wrangler reads your `wrangler.toml` configuration file and automatically creates:

1. **D1 Database** — A SQL database for storing data (user accounts, application data, etc.)
2. **R2 Storage Bucket** — File storage for uploads, images, and documents
3. **KV Namespace** — Fast key-value storage for caching frequently accessed data
4. **Pages Functions** — Your dynamic endpoint code deployed globally (from `functions/` directory)

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

### Step 1: Configure Authentication

Claude sets up wrangler to use your API token:

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"
```

This tells wrangler to deploy to your Cloudflare account.

### Step 2: Build the Project

Claude builds your project:

```bash
npm run build
```

This builds Hugo and compiles CSS into the `dist/` directory.

### Step 3: Deploy to Cloudflare Pages

Claude reads the project name from wrangler.toml and runs:

```bash
wrangler pages deploy dist --project-name=your-project-name
```

You'll see output like:

```
⛅️ wrangler 3.x.x
-------------------
✨ Deployment complete! Take a peek over at https://abc123.your-project-name.pages.dev
```

**What this means:**

- Your static files and Pages Functions are uploaded
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
- Runs database migrations
- Deploys code globally
- Takes 2-5 seconds

### Subsequent Deployments

- Infrastructure already exists
- Just deploys updated code
- Takes 1-2 seconds

**Tip**: After the first deployment, changes deploy almost instantly when you push to GitHub or ask Claude to redeploy.

---

## Checkpoint: What You Should See

After deployment completes:

- [ ] Claude shows you the Pages URL (https://abc123.your-project-name.pages.dev)
- [ ] No error messages in the deployment output
- [ ] Cloudflare dashboard shows your Pages project under "Workers & Pages"
- [ ] D1, R2, and KV resources appear in the dashboard (if configured)

**Everything looks good?** Continue to Phase 4 (Email Setup) if you want email functionality, or skip to Phase 7 (Verify Deployment) to test your application.

---

## Troubleshooting

### "Missing entry-point to Worker script"

**This is the most common error!** It means you used `wrangler deploy` instead of `wrangler pages deploy`.

**The fix:**

Use the correct command for this Cloudflare Pages project:

```bash
wrangler pages deploy dist --project-name=<project-name>
```

**For GitHub Actions CI/CD:**

Make sure your workflow uses `pages deploy`:

```yaml
# WRONG:
- run: npx wrangler deploy

# CORRECT:
- uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy dist --project-name=your-project-name
```

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

Yes! Each deployment has an ID. In the Cloudflare dashboard:

1. Go to **Workers & Pages** → Your Worker
2. Click the **Deployments** tab
3. Find a previous deployment
4. Click **Rollback** to revert to that version

Or tell Claude which deployment ID to roll back to, and Claude will run:

```bash
wrangler rollback <deployment-id>
```

---

## 3.7 Preview Deployments vs. Production Deployments

Cloudflare Pages distinguishes between **production** and **preview** deployments based on the branch.

### How It Works

When you create a Pages project, you specify a **production branch** (typically `master` or `main`). This determines which branch serves the main URL.

| Deployment Source          | URL Type                | Example                                         |
| -------------------------- | ----------------------- | ----------------------------------------------- |
| Production branch (master) | Main production URL     | `https://myproject.pages.dev`                   |
| Any other branch           | Branch alias URL        | `https://my-feature-branch.myproject.pages.dev` |
| Any deployment             | Deployment-specific URL | `https://abc123def.myproject.pages.dev`         |

### Important Implications

1. **Main URL won't work until deployed from production branch**: If you deploy from a feature branch, the main URL (e.g., `myproject.pages.dev`) will show an error until you deploy from master.

2. **Preview deployments are fully functional**: Branch deployments include all Pages Functions, D1 bindings, KV, R2 — everything works. They're perfect for testing.

3. **Preview URLs persist indefinitely**: The hash-based deployment URLs continue working as long as the deployment exists. There's no auto-cleanup.

4. **TLS certificate provisioning takes a few minutes**: When a new preview URL is created, Cloudflare needs to provision a TLS certificate. During this time (typically 1-3 minutes), you may see TLS/SSL errors when visiting the URL. This is normal — wait a few minutes and try again.

### When Deploying from a Branch

Always inform the user:

- Which URL works NOW (the deployment-specific or branch alias URL)
- That the main URL won't work until merging to the production branch
- Offer to merge and deploy to production if they want the main URL active

---

## 3.8 Cleaning Up Preview Deployments

Preview deployments accumulate over time. While Cloudflare doesn't charge for storage, cleaning up old deployments is good hygiene.

### Listing Deployments

```bash
# List all deployments for a project
npx wrangler pages deployment list --project-name=<project-name>
```

### Deleting Old Deployments

```bash
# Delete a specific deployment by ID
npx wrangler pages deployment delete <deployment-id> --project-name=<project-name>
```

### When to Offer Cleanup

**Always offer to clean up preview deployments** in these situations:

1. **After merging a feature branch to production** — The preview deployment for that branch is no longer needed
2. **When listing deployments shows many old entries** — Suggest cleaning up deployments older than a certain date
3. **After deleting a feature branch** — The associated preview deployments can be removed
4. **Periodically during maintenance** — Offer to review and clean up stale deployments

### Example Cleanup Flow

```
Claude: "I see you have 12 preview deployments from old branches. Would you like me to clean up deployments older than 30 days? I'll keep the production deployment and any recent branch previews."

User: "Yes please"

Claude: [Lists deployments, identifies old ones, deletes them one by one]
Claude: "Done! I removed 8 old preview deployments. Your current production deployment and 3 recent previews are still active."
```

### Limits to Be Aware Of

| Resource                   | Limit                      |
| -------------------------- | -------------------------- |
| Builds per month (Free)    | 500 (account-wide)         |
| Active preview deployments | Unlimited                  |
| Deployment retention       | Indefinite (until deleted) |

The main constraint is the 500 builds/month limit, not storage of old deployments.

---

## Next Steps

**If you want email functionality**: Continue to `email-setup.md` to configure Resend.

**If you want error tracking**: Continue to `sentry-setup.md` to configure Sentry.

**If you want to test your Worker now**: Skip to `verify-deployment.md` to check that everything works.

**All optional services can be added later**—your Worker is already live and functional!
