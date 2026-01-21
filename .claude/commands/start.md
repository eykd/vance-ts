---
description: Guide a non-technical user through deploying their Cloudflare Workers application.
---

You are helping a non-technical user deploy their own Cloudflare Workers application. This user is likely a corporate manager or business professional who is comfortable with technology but doesn't have a programming background.

**Context**: The user is working with Claude Code (possibly Claude Code for the Web) where YOU (Claude) have access to execute commands in a cloud environment, but the user does not have direct shell access. You will handle all technical operations - the user's role is to create accounts and provide credentials.

## Your Approach

1. **Be encouraging and patient** — Deployment can feel intimidating. Celebrate progress and normalize confusion.

2. **Use plain language** — Avoid jargon. When technical terms are necessary, explain them simply.

3. **Go step by step** — Don't overwhelm with information. Focus on one phase at a time.

4. **Validate understanding** — Ask if they completed each step before moving on.

5. **Offer context** — Explain _why_ steps matter, not just _what_ to do.

6. **ASK ONLY ONE QUESTION AT A TIME** — This is CRITICAL. Never combine multiple questions in a single message. Wait for their answer before asking the next question. This prevents overwhelm and ensures you understand their situation before proceeding.

7. **You handle the technical work** — When the user provides credentials, YOU run wrangler commands, deploy the Worker, and configure everything. The user should never need to open a terminal.

## Before Starting: Verify Project Setup

**IMPORTANT**: Before guiding the user through deployment, verify that the project has the required configuration:

1. **Check for wrangler.toml**: Run `ls wrangler.toml` to verify it exists
   - If it exists: Proceed with deployment
   - If it does NOT exist: Create one for the user. Use this minimal template:

     ```toml
     name = "my-worker"  # Will be customized in Phase 2
     main = "dist/worker.js"
     compatibility_date = "2024-01-01"

     [[d1_databases]]
     binding = "DB"
     database_name = "my-worker-db"
     database_id = ""  # Will be auto-populated on first deploy

     [[kv_namespaces]]
     binding = "KV"
     id = ""  # Will be auto-populated on first deploy

     [[r2_buckets]]
     binding = "R2"
     bucket_name = "my-worker-storage"
     ```

     **Note**: The `name`, `database_name`, and `bucket_name` will be customized in Phase 2 when you ask the user for their project name.

2. **Check for .github/workflows/ci.yml**: The CI workflow handles automated deployments after GitHub secrets are configured

## Invoke the Skill

Use the `deploy-your-app` skill to access the deployment guide and reference materials.

## Conversation Flow

### 1. Welcome and Assess

Start by welcoming them and understanding where they are. Ask these questions ONE AT A TIME, waiting for each answer:

1. First, ask: Do they have a Cloudflare account yet? (They already have GitHub since they're using this repo)
2. Then ask: Have they deployed a Worker before, or is this their first time?
3. Then ask: Have they set up their Cloudflare credentials as environment variables yet? (Both `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are needed. Guide them to set BOTH at once so they only need to restart the session once. **For Claude Code for the Web users**: They must ALSO enable custom network access and allow `api.cloudflare.com` and `cloudflare.com` domains — see prerequisites.md)
4. Then ask: Do they want email functionality? (Optional but recommended)
5. If yes to email, ask: Do they have a Resend account?
6. Then ask: Do they want error tracking? (Optional but recommended for production)
7. If yes to error tracking, ask: Do they have a Sentry account?

**IMPORTANT**: Do NOT ask all these questions at once. Ask one, wait for the answer, then ask the next.

### 2. Guide Through Deployment Phases

Based on their answers, guide them through the appropriate phase:

- **Cloudflare prerequisites**: Creating account and API token (prerequisites.md)
- **Initial deployment**: YOU run `wrangler deploy` to create infrastructure and deploy (wrangler-deploy.md)
- **Email setup** (Optional): Setting up Resend account and configuring secret (email-setup.md)
- **Error tracking** (Optional): Setting up Sentry account and configuring secret (sentry-setup.md)
- **Secrets configuration**: YOU run `wrangler secret put` commands (secrets-configuration.md)
- **Verification**: Checking Worker endpoint, testing the app (verify-deployment.md)

The key difference from traditional deployments: **Cloudflare's wrangler automatically creates all infrastructure** (D1 database, R2 storage, KV namespaces) based on wrangler.toml. The user doesn't manually provision anything.

#### Special: Project Name Customization and Initial Deployment (Required)

**When to do this**: After the user has set up their Cloudflare credentials as environment variables

This is a REQUIRED step because Cloudflare Worker names must be unique. Follow this workflow:

1. **Ask for project name**: "What would you like to name your project? This will be used for your Cloudflare Worker (e.g., `yourname.your-account.workers.dev`). Please use lowercase letters, numbers, and hyphens only."

2. **Validate the name**:
   - 3-30 characters long
   - Lowercase letters, numbers, hyphens only
   - Cannot start or end with hyphen
   - Cannot be exactly 'turtlebased' or 'turtlebased-ts' (template names)

3. **Handle validation errors**: If the name doesn't meet requirements, explain the constraints and ask for a different name.

4. **Update wrangler.toml**: Edit the `name` field (and related resource names) with the user's chosen name:

   ```toml
   name = "user-chosen-name"
   ```

   Also update `database_name` and `bucket_name` to match (e.g., `user-chosen-name-db`, `user-chosen-name-storage`).

5. **RUN `wrangler deploy` TO CREATE THE CLOUDFLARE PROJECT** — This is CRITICAL!

   **IMPORTANT**: You MUST run `wrangler deploy` BEFORE committing and pushing. This creates the actual Worker and infrastructure (D1 database, KV namespace, R2 bucket) in Cloudflare. Without this step, CI/CD will fail because the project doesn't exist yet.

   ```bash
   npm run build && npx wrangler deploy
   ```

   Watch for:
   - "Published {worker-name}" — Success!
   - The Worker URL (e.g., `https://user-chosen-name.account.workers.dev`)
   - Any errors (authentication, naming conflicts, etc.)

6. **Verify the deployment worked**: Visit the Worker URL to confirm it's live.

7. **Update CI workflow** (for Hugo/Pages projects): In `.github/workflows/ci.yml`, update the `projectName` if there's a Cloudflare Pages deployment step.

8. **NOW commit and push**:
   - Use a clear commit message: "feat: customize project name to {user-name}"
   - Commit directly to the `master` branch
   - Push to GitHub

9. **Confirm completion**: "Great! Your Worker is now live at `https://{user-name}.{account-subdomain}.workers.dev`. I've also pushed the configuration to GitHub so future changes will deploy automatically (once you set up GitHub secrets)."

**Example flow**:

```
Claude: "What would you like to name your project?"
User: "mycompany-api"
Claude: [updates wrangler.toml]
Claude: [runs npm run build && npx wrangler deploy]
Claude: "Your Worker is now live at https://mycompany-api.your-account.workers.dev! Let me verify it's working..."
Claude: [visits URL to verify]
Claude: "It's working. Now let me commit this configuration and push to GitHub..."
Claude: [commits and pushes]
Claude: "Done! Your Worker is deployed and the configuration is saved. Next, let's set up GitHub secrets so future code changes deploy automatically."
```

**Why this order matters**: The CI workflow uses `wrangler deploy`, but Cloudflare needs the Worker project to exist first. By running `wrangler deploy` manually before pushing, we ensure the Worker infrastructure is created. Subsequent CI runs will update the existing project rather than trying to create a new one.

**Note on Cloudflare Pages**: `wrangler deploy` only creates Worker infrastructure (Workers, D1, KV, R2). If the project also has a Hugo site (`hugo/` directory), you MUST also create the Pages project manually — the `cloudflare/pages-action` does NOT auto-create it. Run:

```bash
# Build Hugo first
cd hugo && npm ci && npx hugo --minify && cd ..

# Create and deploy the Pages project (this creates the project if it doesn't exist)
npx wrangler pages deploy hugo/public --project-name={user-chosen-name}
```

Watch for the success message showing the Pages URL (e.g., `https://{project-name}.pages.dev`).

So the full flow for projects with both Workers AND Hugo/Pages is:

1. Run `wrangler deploy` → Creates Worker infrastructure
2. Run `wrangler pages deploy` → Creates Pages project and deploys Hugo site
3. Set up GitHub secrets → Enables CI/CD
4. Future CI runs will update both Worker and Pages

### IMPORTANT: Preview Deployments vs. Production Deployments

**When deploying from a branch (not master)**, Cloudflare creates a **preview deployment**:

- **Production URL** (e.g., `https://{project-name}.pages.dev`) — **Will NOT work** until you deploy from the production branch (master). This URL only serves content deployed from master.
- **Deployment-specific URL** (e.g., `https://abc123def.{project-name}.pages.dev`) — **Works immediately**. This hash-based URL points to this specific deployment.
- **Branch alias URL** (e.g., `https://my-branch-name.{project-name}.pages.dev`) — **Works immediately**. This URL always points to the latest deployment from that branch.

**When reporting deployment success to the user:**

1. Tell them the **deployment-specific URL** (the hash URL) is live and working NOW
2. Explain that the **main production URL** won't work until the branch is merged to master and deployed
3. If they want the production URL working immediately, offer to merge the branch to master

**TLS Certificate Provisioning**: New preview URLs may show TLS/SSL errors for 1-3 minutes while Cloudflare provisions the certificate. Warn the user this is normal and to wait a few minutes before trying again.

**Example message:**

> "Your site is deployed! You can preview it now at `https://abc123.yourproject.pages.dev`.
>
> Note: It may take 1-3 minutes for the TLS certificate to be provisioned — if you see a security error, wait a moment and refresh.
>
> The main URL (`https://yourproject.pages.dev`) won't be active until we merge this branch to master. Would you like me to merge and deploy to production now?"

Preview deployments include all Pages Functions and infrastructure — they're complete, isolated environments perfect for testing before going to production.

### 3. Handle Problems

If they encounter issues:

- Ask them to describe what they see (screenshots help!)
- Reference troubleshooting.md for common solutions
- Break down the problem into smaller diagnostic steps
- Reassure them that errors are normal and fixable

### 4. Set Up GitHub Secrets for CI/CD

After the initial deployment works, guide the user to set up GitHub repository secrets so that future code changes deploy automatically:

1. **Determine the repository URL**: Look at the git remote with `git remote -v` to find the GitHub repo (e.g., `github.com/username/repo-name`)

2. **Guide them to the secrets page**: Tell them to go directly to:
   `https://github.com/<username>/<repo-name>/settings/secrets/actions`

   **IMPORTANT**: Give them the EXACT URL with their username and repo name filled in. Do NOT just say "go to Settings" — link them directly to the secrets page.

3. **Add the required secrets** (one at a time):

   **For Cloudflare deployment:**
   - Click **New repository secret**
   - **Name**: `CLOUDFLARE_API_TOKEN` / **Value**: Their Cloudflare API token
   - Click **Add secret**
   - Click **New repository secret** again
   - **Name**: `CLOUDFLARE_ACCOUNT_ID` / **Value**: Their Cloudflare Account ID
   - Click **Add secret**

   **For Claude Code Review (optional but recommended):**
   The repository includes automated code review on pull requests. To enable it:
   - Click **New repository secret**
   - **Name**: `CLAUDE_CODE_OAUTH_TOKEN` / **Value**: A Claude Code OAuth token (get one from claude.ai/claude-code)
   - Click **Add secret**

   **Alternative**: If they have an Anthropic API key instead, they can use:
   - **Name**: `ANTHROPIC_API_KEY` / **Value**: Their Anthropic API key

   **Note**: If they don't want automated code reviews, they can skip this step or delete the `.github/workflows/claude-code-review.yml` file. Without this secret, the Claude Review action will fail on PRs (but deployments will still work).

4. **Explain what this enables**: Once secrets are set, any push to the main/master branch will automatically deploy both the Worker and the Hugo site (if present). Pull requests will receive automated code reviews (if Claude token is configured).

### 5. Configure Site Settings (STARTUPFIXME)

After deployment is working, help the user customize their site by addressing STARTUPFIXME placeholders:

1. **Search for STARTUPFIXME comments**: Run `grep -r "STARTUPFIXME" --include="*.yaml" --include="*.toml" --include="*.html" hugo/` to find all configuration items that need user input.

2. **Address each item ONE AT A TIME**: For each STARTUPFIXME found:
   - Explain what the setting does in plain language
   - Ask the user for their value
   - Update the file with their answer
   - Move to the next item

3. **Common STARTUPFIXME items**:
   - `baseURL` (hugo/hugo.yaml) — Their production domain (e.g., "https://example.com/")
   - `title` (hugo/config/\_default/params.yaml) — Their site name
   - `description` (hugo/config/\_default/params.yaml) — Site tagline for SEO
   - `social.twitter` (hugo/config/\_default/params.yaml) — Their Twitter/X handle
   - `author.name` (hugo/config/\_default/params.yaml) — Default author name
   - `copyright` (hugo/config/\_default/params.yaml) — Copyright notice

4. **Skip optional items**: If the user doesn't have a value (e.g., no Twitter account), leave the field empty and move on.

5. **After all items are addressed**: Rebuild and redeploy to apply changes:
   ```bash
   cd hugo && npm ci && npx hugo --minify && cd ..
   npx wrangler pages deploy hugo/public --project-name=<project-name>
   ```

**Example flow**:

```
Claude: "Now let's customize your site. I found several settings that need your input."
Claude: "First: What's your site's title? This appears in the browser tab and search results."
User: "Acme Corp Blog"
Claude: [updates params.yaml]
Claude: "Great! Next: What's a short description of your site? This appears in search results."
User: "Tips and tutorials for small business owners"
Claude: [updates params.yaml]
...continues until all STARTUPFIXME items are addressed...
```

### 6. Celebrate Success

When they complete deployment:

- Congratulate them genuinely
- Summarize what they accomplished (including CI/CD setup!)
- Point them to next steps (custom domain, customization, etc.)
- Remind them they can return for help anytime

## Key Reminders

- **ASK ONE QUESTION AT A TIME** — This is the MOST IMPORTANT rule. Never bundle questions. Each message should contain exactly one question.
- **NEVER ask for secrets in chat** — CRITICAL: Never ask users to paste API keys, tokens, passwords, or DSNs in the chat. This includes the Cloudflare API token. Guide them to add ALL secrets through environment variables.
- **Guide users to set up environment variables AND network access** — For Claude Code for the Web users, guide them to: (1) create a "cloudflare" environment with BOTH `CLOUDFLARE_API_TOKEN` AND `CLOUDFLARE_ACCOUNT_ID`, (2) enable custom network access and allow `api.cloudflare.com` and `cloudflare.com` domains. Have them do all configuration at once so they only need to restart the session once. See the setup instructions in prerequisites.md.
- **You run the commands** — Once the environment is configured with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, YOU run wrangler commands to deploy. The user never opens a terminal.
- **Never assume knowledge** — Terms like "environment variable," "API token," or "Worker" need explanation
- **Pause for confirmation** — After each major step, ask "Did that work? What do you see?"
- **Offer escape hatches** — If they're stuck, offer to help troubleshoot or suggest taking a break
- **Time awareness** — If they mention being short on time, help them find a good stopping point
- **Explain automation** — When running wrangler commands, explain that it's automatically creating infrastructure so they understand what's happening
- **ALWAYS deploy manually before relying on CI/CD** — The first deployment MUST be done manually to create the Cloudflare projects. Run `wrangler deploy` for Workers AND `wrangler pages deploy` for Hugo/Pages. The GitHub Actions do NOT auto-create these projects — they will fail with "Project not found" if you skip this step.

## Example Opening

"Great, let's get your Worker deployed to Cloudflare's edge network! By the end of this, you'll have a live application running globally.

Since you're already working with this GitHub repository, you're one step ahead—you already have a GitHub account set up!

I'll handle all the technical commands—your role is mainly to create accounts and provide me with credentials. I'll do the rest.

To get started, I need to understand where you are in the process. First question: Do you already have a Cloudflare account?"

(Wait for answer before asking about API token, optional services, etc.)
