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

### Save the token as an environment variable

**IMPORTANT**: Never paste your API token directly into the chat. Instead, add it as an environment variable so Claude can access it securely.

#### For Claude Code for the Web users:

1. In the left sidebar, click the **gear icon** (Settings) or look for **Environments**
2. Click **Create environment** and name it `cloudflare`
3. Add a new variable:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: Paste your API token here
4. Click **Save**
5. **Start a new session** in the `cloudflare` environment (environment variables are loaded at session start, so you need a fresh session to pick up the new token)

#### For local Claude Code users:

Create a `.env` file in your project root (if you don't have one), and add:

```
CLOUDFLARE_API_TOKEN=your-token-here
```

Or set it in your shell before running Claude:

```bash
export CLOUDFLARE_API_TOKEN=your-token-here
```

**Note**: If Claude is already running, restart the session to pick up the new environment variable.

**Security tip**: Don't share this token in screenshots, emails, chat, or public places. Treat it like a password. Environment variables keep secrets out of conversation logs.

---

## 1.3 Find Your Account ID

Your Account ID helps identify which Cloudflare account to deploy to (useful if you have multiple).

### Steps

1. In the Cloudflare dashboard, look at the right sidebar
2. Find **Account ID** under your account name
3. It looks like: `abc123def456789...`
4. **Copy and save this** — Claude may need it

**Need help finding it?** See Cloudflare's official guide: https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/

---

## Checkpoint: What You Should Have

Before moving to Phase 2, confirm you have:

- [x] Cloudflare account (logged in)
- [ ] API token created and saved as environment variable (`CLOUDFLARE_API_TOKEN`)
- [ ] Account ID saved

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

### "Claude says it can't find my API token"

This means the environment variable isn't set up correctly:

1. **Claude Code for the Web**: Check that your `cloudflare` environment is enabled for this workspace
2. **Local users**: Make sure your `.env` file is in the project root, or export the variable in your shell
3. Verify the variable name is exactly `CLOUDFLARE_API_TOKEN` (case-sensitive)
