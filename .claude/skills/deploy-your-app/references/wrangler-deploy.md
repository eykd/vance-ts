# Phase 3: Deploy Your Worker

Now comes the exciting part—Claude will deploy your Worker to Cloudflare's global network!

## What Happens During Deployment

When Claude runs `wrangler deploy`, a lot happens automatically behind the scenes. Here's what you need to know:

### 3.1 Automatic Infrastructure Creation

Wrangler reads your `wrangler.toml` configuration file and automatically creates:

1. **D1 Database** — A SQL database for storing data (user accounts, application data, etc.)
2. **R2 Storage Bucket** — File storage for uploads, images, and documents
3. **KV Namespace** — Fast key-value storage for caching frequently accessed data
4. **Worker Script** — Your application code deployed globally

**The magic**: You don't create these manually. Wrangler sees the configuration and provisions everything for you.

### 3.2 Global Deployment

Your Worker code is deployed to **hundreds of Cloudflare data centers** simultaneously:

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
```

This tells wrangler to deploy to your Cloudflare account.

### Step 2: Build the Project

Claude builds your TypeScript code:

```bash
npm run build
```

This compiles your TypeScript into JavaScript that Workers can run.

### Step 3: Deploy to Cloudflare

Claude runs the deployment:

```bash
wrangler deploy
```

You'll see output like:

```
⛅️ wrangler 3.x.x
-------------------
Total Upload: 45.2 KiB / gzip: 12.3 KiB
Uploaded your-worker-name (1.23 sec)
Published your-worker-name (0.45 sec)
  https://your-worker-name.your-account.workers.dev
Current Deployment ID: abc123def-456-789

Note: Deployment ID has been logged to ".wrangler/tmp/bundle-id.txt"
```

**What this means:**

- Your code is uploaded (45.2 KB in this example)
- It's published globally (takes ~2 seconds)
- You get a URL where your Worker is live
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

- [ ] Claude shows you the Worker URL (https://your-name.account.workers.dev)
- [ ] No error messages in the deployment output
- [ ] Cloudflare dashboard shows your Worker as "Active"
- [ ] D1, R2, and KV resources appear in the dashboard

**Everything looks good?** Continue to Phase 4 (Email Setup) if you want email functionality, or skip to Phase 7 (Verify Deployment) to test your Worker.

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

## Next Steps

**If you want email functionality**: Continue to `email-setup.md` to configure Resend.

**If you want error tracking**: Continue to `sentry-setup.md` to configure Sentry.

**If you want to test your Worker now**: Skip to `verify-deployment.md` to check that everything works.

**All optional services can be added later**—your Worker is already live and functional!
