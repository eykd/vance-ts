---
name: deploy-your-app
description: 'Use when: (1) First-time production deployment from this boilerplate, (2) Setting up Cloudflare Workers, D1, R2, or KV, (3) Configuring Resend email or Sentry, (4) Troubleshooting deployment failures, (5) Non-technical user needs deployment guidance, (6) Questions about service costs or architecture.'
---

# Deploy Your Worker: A Friendly Guide for Non-Developers

This guide helps you launch your own Cloudflare Worker application based on this boilerplate. You don't need to be a programmer—just follow the steps, and Claude will handle the technical work.

## CRITICAL: Ask Only ONE Question at a Time

When using this skill to guide users, you MUST ask only one question per message. Never combine multiple questions together. Wait for the user's answer before asking the next question. This is essential for non-technical users who can easily feel overwhelmed.

## CRITICAL: NEVER Ask for Secrets in Chat

**SECURITY RULE**: You must NEVER ask users to paste secret values (API keys, tokens, passwords, DSNs) in the chat. This is a severe security risk.

**For the Cloudflare API token** (needed so Claude can run wrangler commands):

- **DO**: Guide users to set `CLOUDFLARE_API_TOKEN` as an environment variable
- **DO**: For Claude Code for the Web users, guide them to create a "cloudflare" environment
- **DO**: For local users, guide them to use a `.env` file or shell export
- See `references/prerequisites.md` for detailed environment setup instructions

**For application secrets** (Resend API key, Sentry DSN, etc.):

- **DO**: Guide users to add secrets directly in the Cloudflare dashboard
- **DO**: Or have them run `wrangler secret put SECRET_NAME` in their own terminal
- **DON'T**: Ask users to "provide your Resend API key" or paste any secret in chat

## What You're Building

You're deploying a professional application on Cloudflare's edge network with:

- **A Worker** that runs your application code globally (near every user)
- **A database** (D1) to store information (like user accounts)
- **File storage** (R2) for images and uploads
- **Fast caching** (KV) for frequently accessed data

Think of it like this: Cloudflare Workers is your application running at hundreds of data centers worldwide. When someone visits, they connect to the closest one automatically.

## Time Investment

- **First-time setup**: About 30-35 minutes
- **Most of that time** is creating accounts (Cloudflare, Resend, Sentry)
- **Choosing a Worker name**: 2 minutes (Claude updates wrangler.toml)
- **Initial deployment**: 2-3 minutes (Claude runs wrangler deploy)
- **Setting up email (Resend)**: 10 minutes (optional)
- **Setting up error tracking (Sentry)**: 5 minutes (optional)
- **Once set up**: Future changes deploy in under 30 seconds

## Cost Overview

| Service            | Free Tier                      | Paid Starts At            |
| ------------------ | ------------------------------ | ------------------------- |
| GitHub             | Free for public repos          | $4/month for private      |
| Cloudflare Workers | 100k requests/day              | $5/month for 10M requests |
| Cloudflare D1      | 5GB storage, 5M reads/day      | Included in Workers Paid  |
| Cloudflare R2      | 10GB storage, unlimited egress | $0.015/GB storage after   |
| Cloudflare KV      | 100k reads/day, 1k writes/day  | Included in Workers Paid  |
| Resend             | 3k emails/month free           | $20/month for 50k         |
| Sentry             | 5k errors/month free           | $26/month for 50k         |

**Bottom line**: You can start completely free (100k requests/day is plenty for testing). A small production app typically costs $0-5/month on Cloudflare.

## Before You Start

You'll need:

1. **An email address** for creating accounts
2. **About 30-35 minutes** of uninterrupted time
3. **No credit card required** — All services (Cloudflare, Resend, Sentry) offer free tiers without payment info
4. **Claude Code running** in a cloud environment where Claude can execute commands

**Note**: Since you're using Claude Code, Claude will handle all terminal commands. Your role is to create accounts and set up credentials as environment variables (never paste secrets in chat).

## The Journey

### Phase 1: Prerequisites (10 minutes)

You already have a GitHub account (since you're using this repository). You need:

1. **Cloudflare account** — Where your Worker runs
2. **Cloudflare API token** — Set as `CLOUDFLARE_API_TOKEN` environment variable so Claude can deploy on your behalf
3. **Cloudflare Account ID** — Set as `CLOUDFLARE_ACCOUNT_ID` environment variable (required for Cloudflare Pages deployment)

**Important**: Set both environment variables at the same time, then restart your session once. See `references/prerequisites.md` for detailed instructions.

### Phase 2: Choose Your Worker Name (2 minutes)

Claude will help you choose a unique Worker name and update `wrangler.toml` automatically.

**Why this matters**: Worker names must be unique within your Cloudflare account, and your subdomain (`yourname.account.workers.dev`) must be globally unique.

Claude handles this by editing wrangler.toml, committing, and pushing to GitHub.

### Phase 3: Deploy Your Worker (3 minutes)

Claude runs `wrangler deploy` which automatically:

- Creates your D1 database
- Creates your R2 storage bucket
- Creates your KV namespace
- Deploys your Worker code globally

See `references/wrangler-deploy.md` for what happens during deployment.

### Phase 4: Set Up Email (Optional, 10 minutes)

If you want email functionality (user signups, password resets, notifications):

1. Create a Resend account
2. Get an API key
3. Claude sets it as a Worker secret

See `references/email-setup.md` for detailed instructions.

### Phase 5: Set Up Error Tracking (Optional, 5 minutes)

If you want production error monitoring:

1. Create a Sentry account
2. Get a DSN
3. Claude sets it as a Worker secret

See `references/sentry-setup.md` for detailed instructions.

### Phase 6: Configure Secrets (2 minutes)

Claude runs `wrangler secret put` commands to securely store your API keys and tokens.

See `references/secrets-configuration.md` for how secrets work.

### Phase 7: Verify It Works (2 minutes)

Test your Worker endpoint and make sure everything is running.

See `references/verify-deployment.md` for verification steps.

## Common Questions

### "What if I get stuck?"

That's completely normal! Here's what to do:

1. **Read the error message carefully** — It often tells you what's wrong
2. **Ask Claude for help** — Claude can troubleshoot wrangler errors
3. **Check Cloudflare dashboard** — See your Worker's logs and metrics
4. **Try again** — Sometimes it's a temporary issue

### "Can I break something?"

Not really! The worst that can happen:

- Your Worker doesn't start → Claude redeploys
- You enter wrong secrets → Claude updates them
- You run out of free tier → Cloudflare will notify you (100k requests/day is plenty for testing)

### "What happens after I deploy?"

Once deployed:

- Your Worker is live at `https://yourname.your-account.workers.dev`
- It runs globally at hundreds of Cloudflare data centers
- Any changes you push to GitHub can be redeployed instantly
- Cloudflare handles all infrastructure, security, and scaling
- You can monitor everything from the Cloudflare dashboard

### "How do I make changes to my app?"

After deployment, you can:

1. **Ask Claude to help you** make changes via Claude Code
2. **Claude redeploys** by running `wrangler deploy` (takes <30 seconds)
3. **Edit code directly on GitHub** then tell Claude to redeploy

### "How do I add a custom domain?"

Once your Worker is running, you can add a custom domain like `myapp.com` through the Cloudflare dashboard:

1. Add your domain to Cloudflare (free)
2. Create a Route pointing your domain to your Worker
3. Configure DNS records

No code changes needed—it's all done through the Cloudflare interface.

## Glossary

| Term             | Plain English                                                        |
| ---------------- | -------------------------------------------------------------------- |
| **Worker**       | Your application code running on Cloudflare's edge network           |
| **Edge network** | Hundreds of data centers worldwide that run your code close to users |
| **D1**           | Cloudflare's SQL database (like a spreadsheet for storing data)      |
| **R2**           | Cloudflare's file storage (for images, uploads, etc.)                |
| **KV**           | Cloudflare's fast cache (for frequently accessed data)               |
| **wrangler**     | Command-line tool that deploys Workers and manages infrastructure    |
| **Secret**       | A secure setting (like API key or password) stored encrypted         |
| **API token**    | A password that lets Claude deploy on your behalf                    |
| **Deploy**       | Take your code and make it live globally on the internet             |

## Reference Files

- `references/prerequisites.md` — Creating Cloudflare account and API token
- `references/wrangler-deploy.md` — How Claude deploys your Worker
- `references/email-setup.md` — Setting up Resend (optional)
- `references/sentry-setup.md` — Setting up error tracking (optional)
- `references/secrets-configuration.md` — How secrets are configured
- `references/verify-deployment.md` — Checking that everything works
