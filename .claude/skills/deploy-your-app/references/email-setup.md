# Phase 4: Set Up Email (Optional)

Email functionality is optional but recommended if you want:

- User signup and login
- Password reset emails
- Transactional notifications
- Welcome emails

We'll use Resend because it's free (3,000 emails/month), reliable, and has excellent deliverability.

**Skip this phase if you don't need email functionality yet**—you can always add it later.

---

## 4.1 Create a Resend Account

Resend offers 3,000 free emails per month, which is perfect for most applications.

### Steps

1. Go to [resend.com/signup](https://resend.com/signup)
2. Click **Get Started**
3. Fill out the registration form:
   - Use your real email address
   - Choose a strong password
4. Click **Create Account**
5. Check your email and click the verification link
6. You'll see the Resend dashboard

**Note**: No credit card required for the free tier.

---

## 4.2 Create an API Key

### Steps

1. In the Resend Dashboard, go to **API Keys** (left sidebar)
2. Click **Create API Key**
3. Configure the API key:
   - **Name**: `your-worker-name-email` (or any descriptive name)
   - **Permission**: Select **Sending access**
   - **Domain**: Select "All domains"
4. Click **Add**
5. **IMPORTANT**: Copy the API key immediately
   - It looks like: `re_...` (long string starting with "re\_")
   - **You won't see it again!**
   - Save it securely—you'll give this to Claude in Phase 6

---

## 4.3 Verify a Sender Email Address

Resend requires you to verify the email address you'll send from.

### Option A: Verify a Single Email (Easiest)

Best for testing or if you don't have a custom domain:

1. In Resend Dashboard, go to **Domains** (left sidebar)
2. Under **Single Sender Verification**, enter your email address
   - Use an email you control (e.g., `yourname@gmail.com`)
3. Click **Send Verification Email**
4. Check your email and click the verification link
5. You should see "Email verified!" in the dashboard

### Option B: Verify Your Domain (Recommended for Production)

If you have a custom domain:

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain name (e.g., `yourdomain.com`)
4. Click **Add**
5. Resend will show you DNS records to add
6. Add the DNS records at your domain registrar (Cloudflare, Namecheap, etc.)
7. Wait 5-15 minutes for DNS propagation
8. Click **Verify** in Resend
9. Once verified, you can send from any email at your domain

**Tip**: If you're using Cloudflare for your domain, adding DNS records is quick and easy.

---

## 4.4 Configure Your Secrets

**SECURITY NOTE**: Do NOT paste your API key in chat with Claude.

When you're ready to configure email, you'll add these secrets directly in the Cloudflare dashboard:

1. **RESEND_API_KEY**: The `re_...` string you saved
2. **DEFAULT_FROM_EMAIL**: The email address you verified (e.g., `noreply@yourdomain.com` or `yourname@gmail.com`)

See `secrets-configuration.md` for step-by-step instructions on adding secrets via the Cloudflare dashboard.

---

## Understanding Resend Pricing

| Tier           | Cost   | Emails/Month |
| -------------- | ------ | ------------ |
| **Free**       | $0     | 3,000        |
| **Pro**        | $20    | 50,000       |
| **Enterprise** | Custom | Custom       |

**For most apps**: The free tier (3,000 emails/month) is plenty for:

- User signups and verifications
- Password resets
- Occasional notifications

That's about 100 emails per day—sufficient unless you're sending bulk marketing emails.

---

## Checkpoint: What You Should Have

Before returning to Claude:

- [ ] Resend account created and verified
- [ ] API key created and saved (starts with `re_`)
- [ ] Sender email address verified (or domain verified)

**Got everything?** Return to Claude and provide the API key and sender email when asked.

---

## Troubleshooting

### "I lost my API key"

No problem:

1. Go to **API Keys** in Resend Dashboard
2. Delete the old key (click the trash icon)
3. Create a new one following step 4.2

### "Email verification link didn't arrive"

Check:

1. **Spam folder** first
2. **Correct email address** — make sure you typed it correctly
3. Click "Resend Verification Email" in the dashboard

### "I don't have a domain name"

Use your personal email (like `yourname@gmail.com`) for now. When you add a custom domain:

1. Verify the domain in Resend
2. Update the sender email secret in your Worker (Claude can do this)

Common sender email patterns:

- `noreply@yourapp.com` — For automated emails (no replies)
- `hello@yourapp.com` — If you want to receive replies
- `support@yourapp.com` — For support emails

### "Domain verification is taking too long"

DNS propagation usually takes 5-15 minutes but can take up to 24 hours:

1. Double-check you added the DNS records exactly as shown
2. Use whatsmydns.net to check if the records are propagating
3. Try the Resend verification again after 15 minutes

---

## Next Steps

**If you want error tracking**: Continue to `sentry-setup.md`.

**If you're done with optional services**: Return to Claude to configure secrets (Phase 6) and verify deployment (Phase 7).

**You can always add email later**—just create a Resend account, get an API key, and tell Claude to set it as a secret.
