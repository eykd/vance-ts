# Security & Testing

**Purpose**: Security best practices and testing strategies for Stripe integration

**When to read**: Reviewing security, setting up tests, preparing for production

**Source**: Full implementation in `docs/stripe-cloudflare-integration-guide.md`

---

## API Key Security

### Key Types

| Key Type        | Prefix                  | Usage                       |
| --------------- | ----------------------- | --------------------------- |
| Publishable Key | `pk_test_` / `pk_live_` | Client-side, safe to expose |
| Secret Key      | `sk_test_` / `sk_live_` | Server-side only            |

### Best Practices

1. **Never expose secret keys**: Only use publishable keys on the client side
2. **Use environment secrets**: Store keys with `wrangler secret put`
3. **Rotate keys regularly**: Especially after any suspected compromise
4. **Restrict API keys**: Use Dashboard to limit key permissions

```typescript
// WRONG: Hardcoded secret key
const stripe = new Stripe('sk_live_...');

// CORRECT: Use environment variable
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
```

### Wrangler Configuration

```bash
# Add your Stripe secret key as a secret
wrangler secret put STRIPE_SECRET_KEY
# Enter: sk_test_your_secret_key

# Add webhook signing secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_your_webhook_secret
```

---

## Webhook Security

### Always Verify Signatures

```typescript
try {
  event = await stripe.webhooks.constructEventAsync(body, signature, env.STRIPE_WEBHOOK_SECRET);
} catch (err) {
  return new Response('Invalid signature', { status: 400 });
}
```

### Security Principles

1. **Always verify signatures**: Never process unverified webhooks
2. **Use HTTPS**: Stripe only sends webhooks to HTTPS endpoints
3. **Respond quickly**: Return 2xx within 5 seconds to prevent retries
4. **Handle duplicates**: Implement idempotency for webhook handlers

---

## Idempotency

Use idempotency keys for all mutating operations:

```typescript
// Create payment with idempotency key
const paymentIntent = await stripe.paymentIntents.create(
  {
    amount: 1000,
    currency: 'usd',
  },
  {
    idempotencyKey: `payment_${orderId}`, // Unique per operation
  }
);
```

**Best practices**:

- Use meaningful keys (order ID, user ID + action)
- Store keys with operations to track retries
- Handle `IdempotencyError` for duplicate requests

---

## PCI Compliance

Using Stripe Checkout or Elements keeps your integration PCI compliant:

1. **Never handle raw card data**: Let Stripe.js tokenize cards
2. **Use Stripe's hosted fields**: Payment Element handles card input
3. **Redirect to Stripe Checkout**: Simplest path to compliance

### Compliance Levels

| Integration       | PCI Level | Effort    |
| ----------------- | --------- | --------- |
| Stripe Checkout   | SAQ A     | Minimal   |
| Stripe Elements   | SAQ A-EP  | Low       |
| Direct API (rare) | SAQ D     | Extensive |

---

## Input Validation

Always validate inputs before passing to Stripe:

```typescript
// src/presentation/middleware/validation.ts
export function validateCheckoutRequest(formData: FormData): {
  valid: boolean;
  errors: string[];
  data?: { priceId: string; email: string };
} {
  const errors: string[] = [];
  const priceId = formData.get('priceId') as string;
  const email = formData.get('email') as string;

  // Validate price ID format
  if (!priceId || !priceId.startsWith('price_')) {
    errors.push('Invalid price ID');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Invalid email address');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [], data: { priceId, email } };
}
```

---

## Test Mode vs Live Mode

| Environment | Key Prefix             | Purpose                 |
| ----------- | ---------------------- | ----------------------- |
| Test        | `pk_test_`, `sk_test_` | Development and testing |
| Live        | `pk_live_`, `sk_live_` | Production transactions |

---

## Test Card Numbers

Use these test card numbers in test mode:

| Scenario                | Card Number           |
| ----------------------- | --------------------- |
| Successful payment      | `4242 4242 4242 4242` |
| Requires authentication | `4000 0025 0000 3155` |
| Declined                | `4000 0000 0000 9995` |
| Insufficient funds      | `4000 0000 0000 9995` |

Use any future expiration date and any 3-digit CVC.

---

## Testing Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8787/webhooks/stripe

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

## Test Clocks for Subscriptions

Test time-based subscription behavior:

```typescript
// Create a test clock
const testClock = await stripe.testHelpers.testClocks.create({
  frozen_time: Math.floor(Date.now() / 1000),
  name: 'Subscription test',
});

// Create customer attached to test clock
const customer = await stripe.customers.create({
  email: 'test@example.com',
  test_clock: testClock.id,
});

// Advance time to test renewals
await stripe.testHelpers.testClocks.advance(testClock.id, {
  frozen_time: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // +30 days
});
```

---

## Integration Tests

```typescript
// tests/integration/payment.integration.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import Stripe from 'stripe';

describe('Payment Integration', () => {
  let stripe: Stripe;

  beforeAll(() => {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  });

  it('should create a checkout session', async () => {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 2000,
            product_data: {
              name: 'Test Product',
            },
          },
          quantity: 1,
        },
      ],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    expect(session.id).toBeDefined();
    expect(session.url).toBeDefined();
  });

  it('should create a payment intent', async () => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: 'usd',
    });

    expect(paymentIntent.id).toBeDefined();
    expect(paymentIntent.client_secret).toBeDefined();
    expect(paymentIntent.status).toBe('requires_payment_method');
  });
});
```

---

## Unit Tests with Mocks

```typescript
// tests/unit/CreateCheckoutSession.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { CreateCheckoutSession } from '@application/use-cases/payments/CreateCheckoutSession';

describe('CreateCheckoutSession', () => {
  it('should create checkout session with correct parameters', async () => {
    const mockStripe = {
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
          }),
        },
      },
    };

    const useCase = new CreateCheckoutSession(mockStripe as unknown as Stripe);

    const result = await useCase.execute({
      priceId: 'price_123',
      customerEmail: 'test@example.com',
      mode: 'payment',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.sessionId).toBe('cs_test_123');
    expect(result.url).toContain('checkout.stripe.com');
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        customer_email: 'test@example.com',
        line_items: expect.arrayContaining([expect.objectContaining({ price: 'price_123' })]),
      })
    );
  });
});
```

---

## Pre-Launch Checklist

Before accepting live payments:

- [ ] **Complete account verification**: Submit business details in Dashboard
- [ ] **Add bank account**: Configure payout destination
- [ ] **Enable 2FA**: Secure your Stripe account
- [ ] **Switch to live keys**: Update environment variables
- [ ] **Register live webhook endpoint**: Configure production URL
- [ ] **Test with live test transactions**: Make small real payments
- [ ] **Configure statement descriptor**: What appears on customer statements
- [ ] **Set up dispute notifications**: Get alerted to chargebacks

---

## Switching to Live Mode

```bash
# Set live secret key
wrangler secret put STRIPE_SECRET_KEY --env production
# Enter: sk_live_your_live_secret_key

# Set live webhook secret
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
# Enter: whsec_your_live_webhook_secret
```

Update publishable key in wrangler.jsonc:

```jsonc
{
  "env": {
    "production": {
      "vars": {
        "STRIPE_PUBLISHABLE_KEY": "pk_live_your_publishable_key",
      },
    },
  },
}
```

---

## Monitoring in Production

Set up alerts and monitoring:

1. **Dashboard Alerts**: Settings → Team settings → Alerts
2. **Failed Payment Notifications**: Get notified of payment failures
3. **Dispute Alerts**: Immediate notification of chargebacks
4. **Radar Rules**: Monitor for fraud patterns

---

## Common Security Pitfalls

1. **Exposing secret keys in client code**
   - Solution: Only use publishable keys client-side

2. **Not verifying webhook signatures**
   - Solution: Always use `constructEventAsync` with signing secret

3. **Trusting client-side success redirects**
   - Solution: Use webhooks for fulfillment

4. **Hardcoding API keys**
   - Solution: Use environment secrets

5. **Not handling webhook duplicates**
   - Solution: Implement idempotency checks

---

## Next Steps

- For checkout flows → Read `implementation/checkout-integration.md`
- For webhooks → Read `implementation/webhook-handling.md`
- For complete examples → Read `docs/stripe-cloudflare-integration-guide.md`
