# Stripe Checkout Integration

**Purpose**: Implement Stripe Checkout (hosted and embedded) for payment flows

**When to read**: Implementing checkout flows, pricing pages, payment redirects

**Source**: Full implementation in `docs/stripe-cloudflare-integration-guide.md`

---

## Overview

Stripe Checkout provides a hosted, optimized payment page that handles:

- Payment method collection
- Address collection
- Tax calculation
- 3D Secure authentication
- Mobile optimization
- Localization

---

## CreateCheckoutSession Use Case

**File**: `src/application/use-cases/payments/CreateCheckoutSession.ts`

```typescript
import Stripe from 'stripe';

export interface CreateCheckoutSessionRequest {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'payment' | 'subscription' | 'setup';
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export class CreateCheckoutSession {
  constructor(private stripe: Stripe) {}

  async execute(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    const session = await this.stripe.checkout.sessions.create({
      mode: request.mode,
      line_items: [
        {
          price: request.priceId,
          quantity: 1,
        },
      ],
      customer: request.customerId,
      customer_email: request.customerId ? undefined : request.customerEmail,
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      automatic_tax: { enabled: true },
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }
}
```

**Key points**:

- Always create sessions server-side to protect secret key
- Use `automatic_tax` for tax calculation
- Pass either `customer` (existing) or `customer_email` (new), not both

---

## Hosted Checkout Handler

**File**: `src/presentation/handlers/PaymentHandlers.ts`

```typescript
import type { Env } from '../../env';
import Stripe from 'stripe';
import { CreateCheckoutSession } from '@application/use-cases/payments/CreateCheckoutSession';

export class PaymentHandlers {
  private stripe: Stripe;
  private createCheckoutSession: CreateCheckoutSession;

  constructor(env: Env) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
    this.createCheckoutSession = new CreateCheckoutSession(this.stripe);
  }

  // Display pricing page
  async pricingPage(request: Request): Promise<Response> {
    const prices = await this.stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    return new Response(pricingPage({ prices: prices.data }), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Create checkout session and redirect
  async createCheckout(request: Request): Promise<Response> {
    const formData = await request.formData();
    const priceId = formData.get('priceId') as string;
    const email = formData.get('email') as string;

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const result = await this.createCheckoutSession.execute({
      priceId,
      customerEmail: email,
      mode: 'payment',
      successUrl: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    // Redirect to Stripe Checkout
    return Response.redirect(result.url, 303);
  }

  // Handle success redirect
  async successPage(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return Response.redirect('/pricing', 302);
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });

    return new Response(successPage({ session }), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
```

---

## Pricing Page Template

**File**: `src/presentation/templates/pages/pricing.ts`

```typescript
import type Stripe from 'stripe';
import { baseLayout } from '../layouts/base';

interface PricingPageProps {
  prices: Stripe.Price[];
}

export function pricingPage({ prices }: PricingPageProps): string {
  const content = `
    <div class="container mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p class="text-lg text-base-content/70">Choose the plan that works for you</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        ${prices.map((price) => pricingCard(price)).join('')}
      </div>
    </div>
  `;

  return baseLayout({ title: 'Pricing', content });
}

function pricingCard(price: Stripe.Price): string {
  const product = price.product as Stripe.Product;
  const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : '0';
  const interval = price.recurring?.interval || 'one-time';

  return `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">${product.name}</h2>
        <p class="text-base-content/70">${product.description || ''}</p>

        <div class="my-6">
          <span class="text-4xl font-bold">$${amount}</span>
          ${price.recurring ? `<span class="text-base-content/70">/${interval}</span>` : ''}
        </div>

        <form
          action="/api/checkout"
          method="POST"
          x-data="{ loading: false }"
          @submit="loading = true"
        >
          <input type="hidden" name="priceId" value="${price.id}" />

          <div class="form-control mb-4">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              class="input input-bordered w-full"
              required
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ 'loading': loading }"
            :disabled="loading"
          >
            <span x-show="!loading">Get Started</span>
            <span x-show="loading">Processing...</span>
          </button>
        </form>
      </div>
    </div>
  `;
}
```

---

## Embedded Checkout

For a more seamless experience, embed Checkout directly on your page.

**Handler**:

```typescript
async embeddedCheckoutPage(request: Request): Promise<Response> {
  const formData = await request.formData();
  const priceId = formData.get('priceId') as string;

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Create session with ui_mode: 'embedded'
  const session = await this.stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded',
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  return new Response(embeddedCheckoutPage({ clientSecret: session.client_secret! }), {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

**Template**:

```typescript
export function embeddedCheckoutPage({ clientSecret }: { clientSecret: string }): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Checkout</title>
      <script src="https://js.stripe.com/v3/"></script>
      <link href="/css/app.css" rel="stylesheet" />
    </head>
    <body class="bg-base-200 min-h-screen flex items-center justify-center">
      <div class="w-full max-w-lg">
        <div id="checkout"></div>
      </div>

      <script>
        const stripe = Stripe('${process.env.STRIPE_PUBLISHABLE_KEY}');

        async function initializeCheckout() {
          const checkout = await stripe.initEmbeddedCheckout({
            clientSecret: '${clientSecret}',
          });

          checkout.mount('#checkout');
        }

        initializeCheckout();
      </script>
    </body>
    </html>
  `;
}
```

---

## HTMX-Enhanced Pricing Page

Complete pricing page with billing toggle using Alpine.js:

```typescript
export function pricingPage(): string {
  const content = `
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p class="text-lg text-base-content/70 mb-8">Start free, upgrade when you're ready</p>

        <!-- Billing toggle -->
        <div
          x-data="{ yearly: false }"
          class="flex items-center justify-center gap-4"
        >
          <span :class="{ 'font-bold': !yearly }">Monthly</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            x-model="yearly"
          />
          <span :class="{ 'font-bold': yearly }">
            Yearly
            <span class="badge badge-success badge-sm">Save 17%</span>
          </span>
        </div>
      </div>

      <div
        x-data="{ yearly: false }"
        class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
      >
        <!-- Plan cards with x-text for dynamic pricing -->
      </div>
    </div>
  `;

  return baseLayout({ title: 'Pricing', content });
}
```

---

## Router Integration

```typescript
// src/router.ts
private registerRoutes(): void {
  // Pricing and checkout
  this.get('/pricing', (req) => this.paymentHandlers.pricingPage(req));
  this.post('/api/checkout', (req) => this.paymentHandlers.createCheckout(req));
  this.post('/api/checkout/embedded', (req) => this.paymentHandlers.embeddedCheckout(req));
  this.get('/success', (req) => this.paymentHandlers.successPage(req));
  this.get('/cancel', (req) => this.paymentHandlers.cancelPage(req));
}
```

---

## Testing

```typescript
describe('CreateCheckoutSession', () => {
  it('should create a checkout session', async () => {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 2000,
            product_data: { name: 'Test Product' },
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
});
```

---

## Next Steps

- For subscription checkout → Read `implementation/payment-use-cases.md`
- For webhook handling → Read `implementation/webhook-handling.md`
- For complete examples → Read `docs/stripe-cloudflare-integration-guide.md`
