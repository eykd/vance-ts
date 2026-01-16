# Phase 1: Create Your Cloudflare Account

**Good news**: You already have a GitHub account (since you're working with this repository)!

Before deploying, you need a Cloudflare account and an API token so Claude can deploy on your behalf.

---

## 1.1 Create a Cloudflare Account

**What it does**: Cloudflare Workers runs your application globally on their edge network.

**Time needed**: 5 minutes

### Steps

1. Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Enter your email and create a password
3. Check your email and click the verification link
4. You'll see the Cloudflare dashboard

**Important**: You don't need a credit card for the free tier. Cloudflare Workers includes 100,000 requests per day completely free.

---

## 1.2 Create an API Token

Claude needs an API token to deploy your Worker and manage infrastructure on your behalf.

**What is an API token?** Think of it as a special password that lets Claude access your Cloudflare account to deploy code, but nothing else (it can't change your billing, delete your account, etc.).

### Steps

1. In the Cloudflare dashboard, click your profile icon (top-right)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Find the **Edit Cloudflare Workers** template and click **Use template**
5. Review the permissions:
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **Workers KV Storage** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **Workers R2 Storage** → **Edit**
6. Under **Account Resources**, select **All accounts** (or choose your specific account)
7. Click **Continue to summary**
8. Click **Create Token**
9. **IMPORTANT**: Copy the token immediately and save it somewhere safe
   - It looks like a long string of letters and numbers
   - **You won't be able to see it again!**
   - If you lose it, you'll need to create a new one

### Save credentials as environment variables

**IMPORTANT**: Never paste your API token directly into the chat. Instead, add it as an environment variable so Claude can access it securely.

**Before setting up environment variables**, you'll also need your Account ID. Find it now:

1. In the Cloudflare dashboard, look at the right sidebar
2. Find **Account ID** under your account name
3. It looks like: `abc123def456789...`
4. Copy this — you'll add it as an environment variable along with your API token

**Need help finding it?** See Cloudflare's official guide: https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/

#### For Claude Code for the Web users:

**Step 1: Set up environment variables**

1. In the left sidebar, click the **gear icon** (Settings) or look for **Environments**
2. Click **Create environment** and name it `cloudflare`
3. Add **two** variables:
   - **Name**: `CLOUDFLARE_API_TOKEN` / **Value**: Paste your API token here
   - **Name**: `CLOUDFLARE_ACCOUNT_ID` / **Value**: Paste your Account ID here
4. Click **Save**

**Step 2: Enable network access to Cloudflare APIs**

Claude Code for the Web runs in a sandboxed environment that blocks network access by default. You need to allow access to Cloudflare's APIs so the wrangler tool can deploy your application.

1. In the left sidebar, click the **gear icon** (Settings)
2. Find **Network access** (or similar setting)
3. Select **Custom** network access
4. Add these domains to the allowlist:
   - `api.cloudflare.com`
   - `cloudflare.com`
   - `github.com` (required for downloading Hugo binary during npm install)
   - `release-assets.githubusercontent.com` (GitHub redirects binary downloads here)
5. Click **Save**

**Step 3: Start a new session**

Environment variables and network settings are loaded at session start, so you need a fresh session to pick up the new values:

1. Start a new session in the `cloudflare` environment
2. Return to this guide and let Claude know you're ready

#### For local Claude Code users:

Create a `.env` file in your project root (if you don't have one), and add:

```
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
```

Or set them in your shell before running Claude:

```bash
export CLOUDFLARE_API_TOKEN=your-token-here
export CLOUDFLARE_ACCOUNT_ID=your-account-id-here
```

**Note**: If Claude is already running, restart the session to pick up the new environment variables.

**Security tip**: Don't share these values in screenshots, emails, chat, or public places. Treat them like passwords. Environment variables keep secrets out of conversation logs.

---

## Checkpoint: What You Should Have

Before moving to Phase 2, confirm you have:

- [x] Cloudflare account (logged in)
- [ ] API token created and saved as environment variable (`CLOUDFLARE_API_TOKEN`)
- [ ] Account ID saved as environment variable (`CLOUDFLARE_ACCOUNT_ID`)

**All set? Great!** Return to Claude and let them know your environment is configured. Claude will verify the token works by running a test command.

---

## Troubleshooting

### "I didn't receive the verification email"

1. Check your spam/junk folder
2. Wait 5 minutes and check again
3. Go back to Cloudflare and click "Resend verification email"
4. Try a different email address if it still doesn't arrive

### "I can't find the Workers template when creating a token"

If you don't see "Edit Cloudflare Workers" template:

1. Click **Create Custom Token** instead
2. Add these permissions manually:
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit
   - Account → D1 → Edit
   - Account → Workers R2 Storage → Edit
3. Set Account Resources to "All accounts"
4. Click Continue and Create Token

### "I accidentally closed the API token page"

The token is gone forever, but that's okay:

1. Go back to **My Profile** → **API Tokens**
2. Find the token you created and click the **X** or **Roll** button to delete it
3. Create a new token following the steps above

### "Do I need a credit card?"

No! Cloudflare Workers free tier doesn't require a credit card. You get:

- 100,000 requests per day
- 5GB D1 database storage
- 10GB R2 file storage
- All completely free, no payment info needed

### "What if I have multiple Cloudflare accounts?"

If you have multiple accounts (personal and work, for example):

1. Make sure you're logged into the correct account when creating the API token
2. When creating the token, under "Account Resources", select the specific account you want to use
3. Note the Account ID for that specific account

### "Can I revoke this token later?"

Yes! You can delete or regenerate your API token anytime:

1. Go to **My Profile** → **API Tokens**
2. Find your token in the list
3. Click **Roll** to regenerate it or **Delete** to remove it
4. If you regenerate/delete it, update your environment variable with the new token

### "Claude says it can't find my API token or Account ID"

This means the environment variables aren't set up correctly:

1. **Claude Code for the Web**: Check that your `cloudflare` environment is enabled for this workspace
2. **Local users**: Make sure your `.env` file is in the project root, or export the variables in your shell
3. Verify the variable names are exactly `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (case-sensitive)
4. **Did you restart the session?** Environment variables are only loaded at session start — you need a fresh session after adding them

### "Wrangler can't connect to Cloudflare" or "Network error" (Claude Code for the Web)

This means network access to Cloudflare's APIs is blocked. Claude Code for the Web runs in a sandbox that restricts network access by default.

1. Go to **Settings** (gear icon in the left sidebar)
2. Find **Network access** settings
3. Select **Custom** network access
4. Add these domains to the allowlist:
   - `api.cloudflare.com`
   - `cloudflare.com`
   - `github.com` (required for downloading Hugo binary during npm install)
   - `release-assets.githubusercontent.com` (GitHub redirects binary downloads here)
5. Click **Save**
6. **Start a new session** — network settings are loaded at session start

**Note**: This only affects Claude Code for the Web users. Local Claude Code users don't need this step.

### "Hugo installation failed" during npm install (Claude Code for the Web)

If `npm ci` fails with a network error when downloading Hugo (even with domains allowlisted), this is a known sandbox limitation where Node.js fetch doesn't work but curl does.

**Workaround**: Skip the automatic download and install Hugo manually with curl:

1. Add `HUGO_SKIP_DOWNLOAD=1` to your environment variables (same place as your Cloudflare credentials)
2. Start a new session to pick up the environment variable
3. Run `npm ci` in the hugo directory — it will skip the Hugo download
4. Ask Claude to manually install Hugo using curl

Claude will run commands similar to:

```bash
# Get Hugo version from package.json
HUGO_VERSION=$(node -p "require('./hugo/node_modules/hugo-extended/package.json').version")

# Download with curl (which works in the sandbox)
curl -L "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" -o /tmp/hugo.tar.gz

# Extract to the expected location
mkdir -p hugo/node_modules/hugo-extended/bin
tar -xzf /tmp/hugo.tar.gz -C hugo/node_modules/hugo-extended/bin hugo
rm /tmp/hugo.tar.gz

# Verify it works
hugo/node_modules/hugo-extended/bin/hugo version
```

**Note**: You can keep `HUGO_SKIP_DOWNLOAD=1` set permanently — it just means Claude will need to run the curl commands after each `npm ci`.
