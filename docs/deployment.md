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
    │  Cloudflare Workers   │       │  Workers Static Assets│
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

3. **Deploy Hugo to Cloudflare Workers** (if hugo/ exists)
   - Install Hugo dependencies
   - Build Hugo site with `npx hugo --minify`
   - Deploy to Cloudflare Workers using `wrangler deploy`

## Required GitHub Configuration

### GitHub Secrets

Configure these secrets in your GitHub repository settings:

### 1. CLOUDFLARE_API_TOKEN

**How to create:**

1. Go to [Cloudflare Dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Add permissions:
   - Account → Cloudflare Workers Scripts → Edit
   - Zone → Workers Scripts → Edit
5. Save the token

**What it's used for:**

- Deploying Workers via wrangler
- Deploying Workers via GitHub Action

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

### Repository Variables (Optional)

You can also configure these repository variables in your GitHub repository settings:

#### CLOUDFLARE_PAGES_PROJECT

**What it's used for:**

- Sets the Cloudflare Workers project name for deployment
- Defaults to `turtlebased-site` if not configured

**How to set:**

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click the **Variables** tab
4. Click **New repository variable**
5. Add variable:
   - Name: `CLOUDFLARE_PAGES_PROJECT`
   - Value: Your desired Cloudflare Workers project name
   - Click **Add variable**

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Your API token from Cloudflare
   - Click **Add secret**
5. Repeat for `CLOUDFLARE_ACCOUNT_ID`

## Cloudflare Workers Configuration

### Project Name

The CI workflow deploys to a Cloudflare Workers project. The project name is configurable:

**Option 1: Use Repository Variable (Recommended)**

1. Go to **Settings → Secrets and variables → Actions → Variables tab**
2. Add variable `CLOUDFLARE_PAGES_PROJECT` with your desired project name
3. The workflow will use this name automatically

**Option 2: Use Default Name**

- If no variable is set, the workflow uses `turtlebased-site` as the default
- No configuration needed if this name works for you

**Option 3: Edit Workflow File Directly**

1. Edit `.github/workflows/ci.yml`
2. Find the `Deploy Hugo to Cloudflare Workers` step
3. Change the default value in `projectName: ${{ vars.CLOUDFLARE_PAGES_PROJECT || 'turtlebased-site' }}`

### First-Time Setup

If the Cloudflare Workers project doesn't exist yet, `wrangler deploy` will create it automatically on first deployment.

Alternatively, you can pre-create the project:

1. Go to [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/workers-and-pages)
2. Click "Create"
3. Name it `turtlebased-site` (or match your CI config)

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

# Then deploy via wrangler:
npx wrangler deploy
```

## Deployment Verification

### Check Workers Deployment

1. View logs in GitHub Actions
2. Test your Workers endpoint
3. Check [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/workers-and-pages)

### Check Workers Deployment (Static Site)

1. View logs in GitHub Actions
2. Visit your Workers URL: `https://turtlebased-site.workers.dev`
3. Check [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/workers-and-pages)

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
- Verify token has Workers permissions

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
- Workers deploys if `hugo/` directory exists
- Both can run in the same deployment

## Environment URLs

### Production

- **Workers API**: `https://your-worker-name.your-subdomain.workers.dev`
- **Hugo Site**: `https://turtlebased-site.workers.dev`

### Custom Domains

Configure custom domains in Cloudflare Dashboard:

- Workers: Dashboard → Workers & Pages → Your Worker → Settings → Domains
- Workers: Dashboard → Workers & Pages → Your Worker → Settings → Domains

## Cost Considerations

**Workers**:

- Free tier: 100,000 requests/day
- Paid: $5/month for 10 million requests

**Workers Static Assets**:

- Included in Workers free tier
- No separate build limits

Both deployments use the free tier by default.
