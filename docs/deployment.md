# Deployment Guide

This project uses GitHub Actions to deploy both the Cloudflare Workers API and the Hugo static site to Cloudflare.

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│           GitHub Actions CI/CD              │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Quality    │──►   │    Deploy    │   │
│  │   Checks     │      │              │   │
│  └──────────────┘      └──────┬───────┘   │
│                               │            │
└───────────────────────────────┼────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │  Cloudflare Workers   │       │  Cloudflare Pages     │
    │  (TypeScript API)     │       │  (Hugo Static Site)   │
    └───────────────────────┘       └───────────────────────┘
```

## Deployment Flow

### Trigger
- **Automatic**: Every push to `main` or `master` branch
- **After**: All quality checks pass (type-check, lint, format, test)

### Deploy Job Steps

1. **Check for deployment targets**
   - Detects if `wrangler.toml` exists (Workers)
   - Detects if `hugo/` directory exists (Pages)

2. **Deploy Cloudflare Workers** (if wrangler.toml exists)
   - Install root dependencies
   - Build TypeScript API
   - Deploy via `wrangler deploy`

3. **Deploy Hugo to Cloudflare Pages** (if hugo/ exists)
   - Install Hugo dependencies
   - Build Hugo site with `npx hugo --minify`
   - Deploy to Cloudflare Pages using `cloudflare/pages-action`

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### 1. CLOUDFLARE_API_TOKEN

**How to create:**
1. Go to [Cloudflare Dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add permissions:
   - Account → Cloudflare Pages → Edit
   - Zone → Workers Scripts → Edit
5. Save the token

**What it's used for:**
- Deploying Workers via wrangler
- Deploying Pages via GitHub Action

### 2. CLOUDFLARE_ACCOUNT_ID

**How to find:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select any domain/site
3. Your Account ID is in the right sidebar under "API"
4. Or find it in the URL: `dash.cloudflare.com/[ACCOUNT_ID]/...`

**What it's used for:**
- Identifying which Cloudflare account to deploy to

### 3. GITHUB_TOKEN

**No action needed** - This is automatically provided by GitHub Actions.

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Your API token from Cloudflare
   - Click **Add secret**
5. Repeat for `CLOUDFLARE_ACCOUNT_ID`

## Cloudflare Pages Configuration

### Project Name
The CI workflow is configured to deploy to a Cloudflare Pages project named **`turtlebased-site`**.

**To change the project name:**
1. Edit `.github/workflows/ci.yml`
2. Find the `Deploy Hugo to Cloudflare Pages` step
3. Change `projectName: turtlebased-site` to your desired name

### First-Time Setup

If the Cloudflare Pages project doesn't exist yet, the `cloudflare/pages-action` will create it automatically on first deployment.

Alternatively, you can pre-create the project:
1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Choose "Direct Upload"
4. Name it `turtlebased-site` (or match your CI config)

## Manual Deployment

### Deploy Workers Locally
```bash
# Requires wrangler.toml to exist
npm run build
npx wrangler deploy
```

### Deploy Hugo Locally
```bash
cd hugo
npm install
npx hugo --minify

# Then manually upload hugo/public/ to Cloudflare Pages
# Or use wrangler pages publish:
npx wrangler pages deploy hugo/public --project-name=turtlebased-site
```

## Deployment Verification

### Check Workers Deployment
1. View logs in GitHub Actions
2. Test your Workers endpoint
3. Check [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/workers-and-pages)

### Check Pages Deployment
1. View logs in GitHub Actions
2. Visit your Pages URL: `https://turtlebased-site.pages.dev`
3. Check [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)

## Troubleshooting

### Workers Deployment Fails

**Error: "Unauthorized"**
- Check `CLOUDFLARE_API_TOKEN` is set correctly
- Verify token has Workers permissions

**Error: "wrangler.toml not found"**
- Workers deployment is optional
- Create `wrangler.toml` if you need Workers deployment

### Hugo Deployment Fails

**Error: "Unauthorized"**
- Check both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set
- Verify token has Pages permissions

**Error: "Hugo build failed"**
- Check Hugo dependencies installed: `cd hugo && npm ci`
- Test build locally: `cd hugo && npx hugo --minify`
- Review error logs in GitHub Actions

**Error: "Project not found"**
- The action will create the project automatically
- Or pre-create it in Cloudflare Dashboard

### Both Deployments Skip

- Deployments only run on push to `main`/`master` branch
- Check GitHub Actions logs for "Deploy" job status
- Verify quality checks passed first

## CI/CD Configuration Details

**File**: `.github/workflows/ci.yml`

**Jobs**:
- `quality` - Runs type-check, lint, format, test (required)
- `deploy` - Runs after quality passes (only on main branch)

**Conditional Deployments**:
- Workers deploys if `wrangler.toml` exists
- Pages deploys if `hugo/` directory exists
- Both can run in the same deployment

## Environment URLs

### Production
- **Workers API**: `https://your-worker-name.your-subdomain.workers.dev`
- **Hugo Site**: `https://turtlebased-site.pages.dev`

### Custom Domains
Configure custom domains in Cloudflare Dashboard:
- Workers: Dashboard → Workers & Pages → Your Worker → Settings → Domains
- Pages: Dashboard → Pages → Your Project → Custom domains

## Cost Considerations

**Workers**:
- Free tier: 100,000 requests/day
- Paid: $5/month for 10 million requests

**Pages**:
- Free tier: Unlimited sites, 500 builds/month
- Paid: $20/month for 5,000 builds/month

Both deployments use the free tier by default.
