# Webhook Handling

**Purpose**: Implement Stripe webhook handling with signature verification

**When to read**: Setting up webhook endpoints, payment fulfillment, subscription lifecycle

**Source**: Full implementation in `docs/stripe-cloudflare-integration-guide.md`

---

## Overview

Webhooks are crucial for reliable payment processing. They notify your application of events like:

- Successful payments
- Subscription changes
- Failed charges
- Invoice events

**Important**: Never rely solely on client-side success redirects. Use webhooks to confirm payment completion.

---

## Webhook Endpoint Handler

**File**: `src/presentation/handlers/WebhookHandlers.ts`

```typescript
import type { Env } from '../../env';
import Stripe from 'stripe';
import { HandleStripeWebhook } from '@application/use-cases/webhooks/HandleStripeWebhook';

export class WebhookHandlers {
  private stripe: Stripe;
  private handleWebhook: HandleStripeWebhook;

  constructor(env: Env, handleWebhook: HandleStripeWebhook) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
    this.handleWebhook = handleWebhook;
  }

  async handleStripeWebhook(request: Request, env: Env): Promise<Response> {
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await request.text();

    let event: Stripe.Event;

    try {
      event = await this.stripe.webhooks.constructEventAsync(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    try {
      await this.handleWebhook.execute(event);
      return new Response('OK', { status: 200 });
    } catch (err) {
      console.error('Webhook handler error:', err);
      // Return 200 to prevent Stripe from retrying
      // Log the error for investigation
      return new Response('OK', { status: 200 });
    }
  }
}
```

**Key points**:

- Always verify webhook signatures
- Return 200 even on handler errors to prevent infinite retries
- Log errors for investigation

---

## HandleStripeWebhook Use Case

**File**: `src/application/use-cases/webhooks/HandleStripeWebhook.ts`

```typescript
import type Stripe from 'stripe';
import type { SubscriptionRepository } from '@domain/interfaces/SubscriptionRepository';
import type { PaymentRepository } from '@domain/interfaces/PaymentRepository';
import type { CustomerRepository } from '@domain/interfaces/CustomerRepository';

export class HandleStripeWebhook {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private paymentRepository: PaymentRepository,
    private customerRepository: CustomerRepository
  ) {}

  async execute(event: Stripe.Event): Promise<void> {
    console.log(`Processing webhook: ${event.type}`);

    switch (event.type) {
      // Checkout completed
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      // Payment succeeded
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      // Payment failed
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      // Subscription created
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      // Subscription updated
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      // Subscription deleted/canceled
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // Invoice paid
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      // Invoice payment failed
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
```

---

## Event Handlers

### Checkout Completed

```typescript
private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Checkout completed:', session.id);

  if (session.mode === 'subscription') {
    // Subscription is handled by customer.subscription.created
    return;
  }

  // Handle one-time payment
  if (session.payment_intent && session.customer) {
    await this.paymentRepository.create({
      id: crypto.randomUUID(),
      stripePaymentIntentId: session.payment_intent as string,
      customerId: session.customer as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
    });
  }
}
```

### Payment Events

```typescript
private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment succeeded:', paymentIntent.id);

  await this.paymentRepository.updateStatus(
    paymentIntent.id,
    'completed'
  );

  // Trigger fulfillment, send receipt, etc.
}

private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('Payment failed:', paymentIntent.id);

  await this.paymentRepository.updateStatus(
    paymentIntent.id,
    'failed'
  );

  // Notify customer, trigger retry logic, etc.
}
```

### Subscription Events

```typescript
private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription created:', subscription.id);

  await this.subscriptionRepository.create({
    id: crypto.randomUUID(),
    stripeSubscriptionId: subscription.id,
    customerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', subscription.id);

  await this.subscriptionRepository.updateByStripeId(subscription.id, {
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
}

private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription deleted:', subscription.id);

  await this.subscriptionRepository.updateByStripeId(subscription.id, {
    status: 'canceled',
  });

  // Revoke access, send cancellation email, etc.
}
```

### Invoice Events

```typescript
private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice paid:', invoice.id);
  // Continue to provision access
}

private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Invoice payment failed:', invoice.id);
  // Notify customer to update payment method
}
```

---

## Router Integration

```typescript
// src/router.ts
private registerRoutes(): void {
  // ... other routes

  // Stripe webhook endpoint
  this.post('/webhooks/stripe', (req) => this.webhookHandlers.handleStripeWebhook(req, this.env));
}
```

---

## Registering Webhooks

### Local Development (Stripe CLI)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8787/webhooks/stripe

# This outputs a webhook signing secret (whsec_...)
# Add it to your environment
wrangler secret put STRIPE_WEBHOOK_SECRET
```

### Trigger Test Events

```bash
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
stripe trigger checkout.session.completed
```

### Production (Dashboard)

1. Navigate to Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. Enter your endpoint URL: `https://your-worker.workers.dev/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. Copy the signing secret and add to production:

```bash
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
```

---

## Worker Entry Point Integration

```typescript
// src/index.ts
import { HandleStripeWebhook } from './application/use-cases/webhooks/HandleStripeWebhook';
import { WebhookHandlers } from './presentation/handlers/WebhookHandlers';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Initialize repositories
    const customerRepository = new D1CustomerRepository(env.DB);
    const subscriptionRepository = new D1SubscriptionRepository(env.DB);
    const paymentRepository = new D1PaymentRepository(env.DB);

    // Initialize use cases
    const handleWebhook = new HandleStripeWebhook(
      subscriptionRepository,
      paymentRepository,
      customerRepository
    );

    // Initialize handlers
    const webhookHandlers = new WebhookHandlers(env, handleWebhook);

    // Route to handler
    const url = new URL(request.url);
    if (url.pathname === '/webhooks/stripe' && request.method === 'POST') {
      return webhookHandlers.handleStripeWebhook(request, env);
    }

    // ... other routes
  },
};
```

---

## Testing

```typescript
describe('HandleStripeWebhook', () => {
  it('should handle checkout.session.completed', async () => {
    const mockPaymentRepo = {
      create: vi.fn().mockResolvedValue({}),
    };

    const useCase = new HandleStripeWebhook(
      mockSubscriptionRepo,
      mockPaymentRepo,
      mockCustomerRepo
    );

    await useCase.execute({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          mode: 'payment',
          payment_intent: 'pi_test_123',
          customer: 'cus_test_123',
          amount_total: 2900,
          currency: 'usd',
        },
      },
    } as Stripe.Event);

    expect(mockPaymentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        stripePaymentIntentId: 'pi_test_123',
        amount: 2900,
        status: 'completed',
      })
    );
  });

  it('should handle subscription lifecycle', async () => {
    const mockSubRepo = {
      create: vi.fn().mockResolvedValue({}),
      updateByStripeId: vi.fn().mockResolvedValue({}),
    };

    const useCase = new HandleStripeWebhook(mockSubRepo, mockPaymentRepo, mockCustomerRepo);

    // Test subscription created
    await useCase.execute({
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'active',
          items: { data: [{ price: { id: 'price_123' } }] },
          current_period_start: 1704067200,
          current_period_end: 1706745600,
          cancel_at_period_end: false,
        },
      },
    } as Stripe.Event);

    expect(mockSubRepo.create).toHaveBeenCalled();
  });
});
```

---

## Common Pitfalls

1. **Not verifying signatures**: Always verify webhook signatures to prevent spoofing
2. **Returning errors to Stripe**: Return 200 even on handler errors to prevent retries
3. **Relying on redirects**: Always use webhooks for fulfillment, not just success redirects
4. **Missing idempotency**: Handle duplicate events gracefully (Stripe may retry)

---

## Next Steps

- For checkout flows → Read `implementation/checkout-integration.md`
- For customer portal → Read `implementation/customer-portal.md`
- For security → Read `implementation/security-testing.md`
