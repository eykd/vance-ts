# Phase 7: Verify Your Deployment

Let's make sure your Worker is running correctly!

## 7.1 Find Your Worker URL

After deployment, you need to know where your Worker is live.

### In Claude's Deployment Output

When Claude ran `wrangler deploy`, the output showed:

```
Published your-worker-name (0.45 sec)
  https://your-worker-name.your-account.workers.dev
```

### In Cloudflare Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. Click on your Worker name
4. You'll see the URL at the top of the page

Copy this URL—you'll use it for testing.

---

## 7.2 Test the Worker Endpoint

Let's make sure your Worker responds to requests.

### Basic Test

1. Open your browser
2. Go to your Worker URL: `https://your-worker-name.your-account.workers.dev`
3. You should see a response

### What You Should See

- A response loads (not an error page)
- The page doesn't timeout
- No 502/503 errors

### What This Means

- Your Worker is deployed and active
- It's running on Cloudflare's edge network
- Basic request handling works

---

## 7.3 Check Worker Logs

Worker logs show you what's happening in real-time.

### View Logs in Dashboard

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages**
3. Click your Worker name
4. Click the **Logs** tab

### What to Look For

- Recent requests appearing in the log
- No error messages
- HTTP 200 status codes (success)

### Viewing Live Logs

Claude can also run:

```bash
wrangler tail
```

This streams live logs showing:

- Incoming requests
- Console.log outputs
- Errors and exceptions
- Performance metrics

---

## 7.4 Test Database Connectivity (D1)

If your Worker uses D1 database:

### Check Database Was Created

1. In Cloudflare dashboard, go to **Storage & Databases** → **D1 SQL Database**
2. You should see your database listed (e.g., `your-worker-name-db`)
3. Click it to see details

### Test Database Queries

If your Worker has a database endpoint, test it:

1. Visit an endpoint that reads from D1
2. Verify it returns data (or appropriate empty response)
3. Check logs for database queries

---

## 7.5 Test File Storage (R2)

If your Worker uses R2 for file storage:

### Check Bucket Was Created

1. In Cloudflare dashboard, go to **Storage & Databases** → **R2 Object Storage**
2. You should see your bucket (e.g., `your-worker-name-storage`)
3. Click it to browse files (starts empty)

### Test File Upload (if applicable)

If your Worker has file upload functionality:

1. Upload a test file through your app
2. Check the R2 bucket to see if the file appears
3. Try accessing the uploaded file

---

## 7.6 Test Secrets Configuration

If you configured secrets (Resend, Sentry):

### Test Email Functionality (if configured)

If you set up Resend:

1. Trigger an action that sends email (e.g., user signup)
2. Check that email was sent
3. Verify email arrives in inbox

### Test Error Tracking (if configured)

If you set up Sentry:

1. Trigger an error in your Worker (or visit a non-existent route)
2. Go to [sentry.io](https://sentry.io) and check your project
3. Verify the error appears in Sentry dashboard

---

## 7.7 Check Performance Metrics

Cloudflare provides detailed analytics.

### View Analytics

1. In Cloudflare dashboard, go to **Workers & Pages**
2. Click your Worker name
3. Click the **Metrics** tab

### What You'll See

- **Requests**: Total number of requests over time
- **Errors**: Error rate and types
- **Duration**: How long requests take (P50, P99)
- **CPU Time**: Worker execution time

### Good Performance Indicators

- P99 duration < 100ms (very fast)
- Error rate < 1%
- Requests handled without timeouts

---

## Success Checklist

Congratulations if you can check all of these!

- [ ] Worker URL loads in browser
- [ ] Logs show recent requests
- [ ] No 502/503 errors
- [ ] D1 database appears in dashboard
- [ ] R2 bucket appears in dashboard
- [ ] (Optional) Email sending works
- [ ] (Optional) Sentry error tracking works
- [ ] Metrics show requests being processed

---

## You Did It!

Your Worker is now live on Cloudflare's global edge network. Here's what you've accomplished:

1. **Created a Cloudflare account** and generated API credentials
2. **Deployed a Worker** to hundreds of data centers worldwide
3. **Configured infrastructure** automatically (D1, R2, KV)
4. **Set up optional services** (email, error tracking)
5. **Verified** everything works correctly

### What's Next?

Now that your Worker is running, you might want to:

1. **Add a custom domain** — Point `yourapp.com` to your Worker
2. **Monitor performance** — Check Cloudflare analytics regularly
3. **Add features** — Build new functionality with Claude's help
4. **Scale up** — Upgrade to Workers Paid plan if you exceed 100k requests/day
5. **Set up CI/CD** — Automate deployments on git push

### Your Worker's Capabilities

With Cloudflare Workers, you have:

- **Global deployment** — Runs at 300+ locations worldwide
- **Sub-50ms latency** — Users connect to nearest data center
- **Auto-scaling** — Handles traffic spikes automatically
- **No servers** — Cloudflare manages all infrastructure

---

## Troubleshooting

### "Worker URL shows 502 Bad Gateway"

Your Worker might have a runtime error:

1. Check logs in Cloudflare dashboard (**Logs** tab)
2. Look for JavaScript errors or exceptions
3. Common issues:
   - Syntax error in Worker code
   - Missing required environment variables
   - Database connection error

Claude can help debug the specific error message.

### "Worker URL shows 503 Service Unavailable"

Temporary issue or deployment problem:

1. Wait 1-2 minutes and try again
2. Check Cloudflare status: [cloudflarestatus.com](https://www.cloudflarestatus.com)
3. Verify deployment completed successfully
4. Claude can redeploy if needed

### "Database queries fail"

D1 database issue:

1. Verify D1 database was created (check dashboard)
2. Check wrangler.toml has correct D1 binding
3. Verify database migrations ran successfully
4. Look for SQL errors in logs

### "File uploads don't work"

R2 storage issue:

1. Verify R2 bucket was created (check dashboard)
2. Check wrangler.toml has correct R2 binding
3. Verify Worker has permission to write to R2
4. Look for R2 errors in logs

### "Secrets aren't working"

Environment variable issue:

1. Go to Worker → **Settings** → **Environment Variables**
2. Verify secrets are listed under **Secrets**
3. Secret names must match exactly (case-sensitive) in your code
4. Try updating the secret value in dashboard

### "Performance is slow"

Optimization needed:

1. Check **Metrics** tab for CPU time
2. Look for slow database queries
3. Consider caching frequently accessed data in KV
4. Review code for inefficient operations

Claude can help profile and optimize your Worker.

### "How do I redeploy after changes?"

If you make code changes:

1. Push changes to GitHub
2. Tell Claude: "Please redeploy my Worker"
3. Claude will run `wrangler deploy`
4. Changes deploy in under 30 seconds

### "Everything was working, now it's not"

1. Check for recent code changes (git history)
2. Review recent deploys in Cloudflare dashboard
3. Check if you've exceeded free tier limits
4. Look for new errors in logs
5. Verify secrets haven't expired (e.g., rotated API keys)

---

## Getting Help

If you need to make changes or troubleshoot:

1. **Ask Claude** — Claude can help debug errors, add features, and redeploy
2. **Check Cloudflare docs** — Excellent documentation at developers.cloudflare.com
3. **Review logs** — Most issues show clear error messages in logs
4. **Cloudflare Community** — Active forum for Workers questions

### Keeping It Running

Your Worker will keep running as long as:

- You stay within free tier limits (100k requests/day) or pay for Workers Paid
- The code doesn't have critical errors
- Your Cloudflare account is active

Cloudflare handles:

- SSL certificates automatically
- DDoS protection
- Global distribution
- Scaling and performance
- Infrastructure maintenance

---

## Congratulations!

You've successfully deployed a production application to Cloudflare's edge network. Your Worker is now serving requests from hundreds of data centers worldwide with sub-50ms latency.

**Need to make changes?** Just ask Claude—redeployments take less than 30 seconds!
