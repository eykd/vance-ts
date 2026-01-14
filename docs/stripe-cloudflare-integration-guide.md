# Comprehensive Guide: Integrating Stripe Payments into Cloudflare-Based Interactive Web Applications

**Building Secure Payment Systems with TypeScript Workers, HTMX, Alpine.js, and Clean Architecture**

_January 2026_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Setting Up Stripe](#setting-up-stripe)
4. [Project Structure for Payments](#project-structure-for-payments)
5. [Payment Use Cases](#payment-use-cases)
   - [One-Time Payments](#one-time-payments)
   - [SaaS Subscriptions](#saas-subscriptions)
   - [Usage-Based Billing](#usage-based-billing)
   - [Invoicing](#invoicing)
6. [Stripe Checkout Integration](#stripe-checkout-integration)
7. [Custom Payment Forms with Elements](#custom-payment-forms-with-elements)
8. [Webhook Handling](#webhook-handling)
9. [Customer Portal Integration](#customer-portal-integration)
10. [Security Best Practices](#security-best-practices)
11. [Testing Your Integration](#testing-your-integration)
12. [Going Live](#going-live)
13. [Complete Example Application](#complete-example-application)

---

## Introduction

This guide presents a comprehensive approach to integrating Stripe payment processing into Cloudflare-based interactive web applications. Building upon the hypermedia-driven architecture with HTMX, Alpine.js, TailwindCSS 4, DaisyUI 5, and TypeScript Workers, we add robust payment capabilities that handle everything from simple one-time payments to complex usage-based billing systems.

### Why Stripe + Cloudflare?

The combination of Stripe and Cloudflare Workers provides several key advantages:

**Edge-First Payment Processing**: Cloudflare Workers execute globally at the edge, reducing latency for payment API calls and providing fast response times for customers worldwide.

**Serverless Webhook Handling**: Workers can receive and process Stripe webhooks without managing traditional server infrastructure, with automatic scaling for high-volume payment events.

**Secure Secret Management**: Cloudflare's environment variables and secrets management provide secure storage for Stripe API keys.

**Hypermedia-Driven Payment UX**: HTMX enables seamless payment flows with partial page updates, while Alpine.js handles client-side payment form interactions.

### Integration Approaches

Stripe offers multiple integration paths, each suited to different needs:

| Integration Type           | Effort      | Customization | Best For                     |
| -------------------------- | ----------- | ------------- | ---------------------------- |
| Payment Links              | No code     | Limited       | Quick setup, simple products |
| Stripe Checkout (Hosted)   | Low         | Moderate      | Most applications            |
| Stripe Checkout (Embedded) | Low-Medium  | Moderate      | Seamless UX on your site     |
| Stripe Elements            | Medium-High | Extensive     | Full custom payment forms    |

This guide covers all approaches, with emphasis on Stripe Checkout as the recommended starting point for most Cloudflare-based applications.

---

## Architecture Overview

### Clean Architecture with Payments

The payment integration follows Clean Architecture principles, keeping Stripe-specific code in the infrastructure layer while domain logic remains pure:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                          │
│   (HTMX/Alpine.js + Payment Forms + TailwindCSS/DaisyUI)        │
├─────────────────────────────────────────────────────────────────┤
│                      Application Layer                           │
│   (Use Cases: CreateSubscription, ProcessPayment, HandleWebhook)│
├─────────────────────────────────────────────────────────────────┤
│                        Domain Layer                              │
│   (Entities: Subscription, Payment, Customer, Invoice)          │
│   (Interfaces: PaymentGateway, SubscriptionRepository)          │
├─────────────────────────────────────────────────────────────────┤
│                     Infrastructure Layer                         │
│   (StripePaymentGateway, D1 Repositories, Webhook Handlers)     │
└─────────────────────────────────────────────────────────────────┘
```

### Payment Flow Architecture

```
┌──────────────┐    HTMX/Form     ┌──────────────┐    Stripe API    ┌──────────────┐
│   Browser    │ ───────────────► │   Worker     │ ────────────────► │   Stripe     │
│   (Client)   │                  │   (Edge)     │                   │   (API)      │
│              │ ◄─────────────── │              │ ◄──────────────── │              │
│  - HTMX      │   HTML/Redirect  │  - Handlers  │   Session/Intent  │  - Checkout  │
│  - Alpine.js │                  │  - Use Cases │                   │  - Billing   │
│  - Stripe.js │                  │  - Gateway   │                   │  - Webhooks  │
└──────────────┘                  └──────────────┘                   └──────────────┘
                                         │
                                         │ Webhook Events
                                         ▼
                                  ┌──────────────┐
                                  │   D1 / KV    │
                                  │  (Storage)   │
                                  └──────────────┘
```

### Key Design Principles

1. **Server-Side Session Creation**: Always create Checkout Sessions and Payment Intents on the server (Worker) to protect your secret key.

2. **Webhook-Driven Fulfillment**: Never rely solely on client-side success redirects. Use webhooks to confirm payment completion.

3. **Idempotency**: Use idempotency keys for all mutating Stripe API calls to safely handle retries.

4. **Domain Isolation**: Keep payment domain logic separate from Stripe-specific implementation details.

---

## Setting Up Stripe

### Prerequisites

Before integrating Stripe, ensure you have:

- A Cloudflare account with Workers enabled
- Node.js 18+ installed locally
- Wrangler CLI installed (`npm install -g wrangler`)
- A Stripe account (create one at [dashboard.stripe.com/register](https://dashboard.stripe.com/register))

### Creating Your Stripe Account

1. **Register**: Create an account at [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. **Verify Email**: Click the verification link sent to your email
3. **Complete Business Profile**: Fill out your business information
4. **Get API Keys**: Navigate to Developers → API Keys

### API Keys and Environment Configuration

Stripe provides two sets of API keys:

| Key Type        | Prefix                  | Usage                          |
| --------------- | ----------------------- | ------------------------------ |
| Publishable Key | `pk_test_` / `pk_live_` | Client-side, safe to expose    |
| Secret Key      | `sk_test_` / `sk_live_` | Server-side only, never expose |

### Wrangler Configuration

Update your `wrangler.jsonc` to include Stripe configuration:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-payment-app",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],

  // Static assets
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
  },

  // D1 Database for storing payment records
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "payments-db",
      "database_id": "your-database-id",
    },
  ],

  // KV for session caching
  "kv_namespaces": [
    {
      "binding": "SESSIONS",
      "id": "your-kv-namespace-id",
    },
  ],

  // Environment variables (non-sensitive)
  "vars": {
    "ENVIRONMENT": "development",
    "STRIPE_PUBLISHABLE_KEY": "pk_test_your_publishable_key",
  },

  // Note: STRIPE_SECRET_KEY should be added as a secret, not here
}
```

### Adding Stripe Secret Key

Never commit your secret key to version control. Use Wrangler secrets:

```bash
# Add your Stripe secret key as a secret
wrangler secret put STRIPE_SECRET_KEY
# Enter: sk_test_your_secret_key

# Add webhook signing secret
wrangler secret put STRIPE_WEBHOOK_SECRET
# Enter: whsec_your_webhook_secret
```

### Installing Dependencies

```bash
# Install Stripe SDK
npm install stripe

# Install types for Cloudflare Workers
npm install -D @cloudflare/workers-types
```

### TypeScript Environment Types

Create or update your environment type definitions:

```typescript
// src/env.d.ts
export interface Env {
  // Cloudflare bindings
  DB: D1Database;
  SESSIONS: KVNamespace;
  ASSETS: Fetcher;

  // Environment variables
  ENVIRONMENT: string;
  STRIPE_PUBLISHABLE_KEY: string;

  // Secrets (added via wrangler secret)
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}
```

---

## Project Structure for Payments

### Recommended Directory Layout

Extend the base Cloudflare project structure with payment-specific modules:

```
project-root/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Customer.ts
│   │   │   ├── Subscription.ts
│   │   │   ├── Payment.ts
│   │   │   └── Invoice.ts
│   │   ├── value-objects/
│   │   │   ├── Money.ts
│   │   │   ├── SubscriptionStatus.ts
│   │   │   └── PaymentStatus.ts
│   │   ├── services/
│   │   │   └── PricingCalculator.ts
│   │   └── interfaces/
│   │       ├── PaymentGateway.ts
│   │       ├── CustomerRepository.ts
│   │       └── SubscriptionRepository.ts
│   │
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── payments/
│   │   │   │   ├── CreateCheckoutSession.ts
│   │   │   │   ├── ProcessPayment.ts
│   │   │   │   └── RefundPayment.ts
│   │   │   ├── subscriptions/
│   │   │   │   ├── CreateSubscription.ts
│   │   │   │   ├── CancelSubscription.ts
│   │   │   │   └── UpdateSubscription.ts
│   │   │   ├── billing/
│   │   │   │   ├── RecordUsage.ts
│   │   │   │   └── CreateInvoice.ts
│   │   │   └── webhooks/
│   │   │       └── HandleStripeWebhook.ts
│   │   └── dto/
│   │       ├── CheckoutSessionRequest.ts
│   │       ├── SubscriptionResponse.ts
│   │       └── WebhookEvent.ts
│   │
│   ├── infrastructure/
│   │   ├── stripe/
│   │   │   ├── StripeClient.ts
│   │   │   ├── StripePaymentGateway.ts
│   │   │   ├── StripeWebhookHandler.ts
│   │   │   └── StripeCustomerSync.ts
│   │   ├── repositories/
│   │   │   ├── D1CustomerRepository.ts
│   │   │   ├── D1SubscriptionRepository.ts
│   │   │   └── D1PaymentRepository.ts
│   │   └── cache/
│   │       └── KVPriceCache.ts
│   │
│   ├── presentation/
│   │   ├── handlers/
│   │   │   ├── PaymentHandlers.ts
│   │   │   ├── SubscriptionHandlers.ts
│   │   │   ├── WebhookHandlers.ts
│   │   │   └── CustomerPortalHandlers.ts
│   │   ├── templates/
│   │   │   ├── pages/
│   │   │   │   ├── pricing.ts
│   │   │   │   ├── checkout.ts
│   │   │   │   └── billing.ts
│   │   │   └── partials/
│   │   │       ├── pricing-table.ts
│   │   │       ├── payment-form.ts
│   │   │       ├── subscription-status.ts
│   │   │       └── invoice-list.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       └── stripeSignature.ts
│   │
│   ├── index.ts
│   └── router.ts
│
├── public/
│   ├── css/
│   │   └── app.css
│   └── js/
│       ├── htmx.min.js
│       ├── alpine.min.js
│       └── stripe-elements.js
│
├── migrations/
│   ├── 0001_initial.sql
│   ├── 0002_customers.sql
│   ├── 0003_subscriptions.sql
│   └── 0004_payments.sql
│
├── wrangler.jsonc
├── vitest.config.ts
├── package.json
└── tsconfig.json
```

### Database Migrations

Create migrations for payment-related tables:

```sql
-- migrations/0002_customers.sql
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
CREATE INDEX idx_customers_email ON customers(email);
```

```sql
-- migrations/0003_subscriptions.sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

```sql
-- migrations/0004_payments.sql
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  metadata TEXT, -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## Payment Use Cases

Stripe supports various business models. Choose the approach that best fits your needs:

### One-Time Payments

**Best for**: E-commerce, digital products, donations, services

One-time payments are the simplest integration path. Customers pay once for a product or service.

#### Using Payment Links (No Code)

The fastest way to accept payments—no code required:

1. In the Stripe Dashboard, navigate to **Payment Links** → **+ New**
2. Add your product with price details
3. Click **Create link**
4. Share the link via email, social media, or embed on your site

```html
<!-- Embed as a button -->
<a href="https://buy.stripe.com/your_link" class="btn btn-primary"> Buy Now - $29 </a>

<!-- Or embed as a styled button with HTMX for loading state -->
<a
  href="https://buy.stripe.com/your_link"
  class="btn btn-primary"
  hx-boost="false"
  x-data="{ loading: false }"
  @click="loading = true"
  :class="{ 'loading': loading }"
>
  <span x-show="!loading">Buy Now - $29</span>
  <span x-show="loading">Redirecting...</span>
</a>
```

#### Using Stripe Checkout (Recommended)

Stripe Checkout provides a hosted, optimized payment page:

```typescript
// src/application/use-cases/payments/CreateCheckoutSession.ts
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
      // Enable automatic tax calculation
      automatic_tax: { enabled: true },
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }
}
```

### SaaS Subscriptions

**Best for**: Software subscriptions, membership sites, recurring services

Subscriptions charge customers on a recurring basis (monthly, yearly, etc.).

#### Creating Products and Prices

First, create your products and prices in the Stripe Dashboard or via API:

```typescript
// src/infrastructure/stripe/StripeProductSetup.ts
import Stripe from 'stripe';

export async function createSubscriptionProduct(stripe: Stripe) {
  // Create the product
  const product = await stripe.products.create({
    name: 'Pro Plan',
    description: 'Full access to all features',
  });

  // Create monthly price
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    lookup_key: 'pro_monthly', // Use for easy reference
  });

  // Create yearly price with discount
  const yearlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 29000, // $290.00 (2 months free)
    currency: 'usd',
    recurring: {
      interval: 'year',
    },
    lookup_key: 'pro_yearly',
  });

  return { product, monthlyPrice, yearlyPrice };
}
```

#### Subscription Checkout Session

```typescript
// src/application/use-cases/subscriptions/CreateSubscription.ts
import Stripe from 'stripe';
import type { CustomerRepository } from '@domain/interfaces/CustomerRepository';

export interface CreateSubscriptionRequest {
  customerId: string;
  priceId: string;
  trialDays?: number;
  successUrl: string;
  cancelUrl: string;
}

export class CreateSubscription {
  constructor(
    private stripe: Stripe,
    private customerRepository: CustomerRepository
  ) {}

  async execute(request: CreateSubscriptionRequest): Promise<{ url: string }> {
    // Get or create Stripe customer
    const customer = await this.customerRepository.findById(request.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    let stripeCustomerId = customer.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripeCustomer = await this.stripe.customers.create({
        email: customer.email,
        name: customer.name,
        metadata: {
          internal_id: customer.id,
        },
      });
      stripeCustomerId = stripeCustomer.id;

      // Save Stripe customer ID
      await this.customerRepository.updateStripeCustomerId(customer.id, stripeCustomerId);
    }

    // Create checkout session for subscription
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: request.priceId,
          quantity: 1,
        },
      ],
      subscription_data: request.trialDays
        ? {
            trial_period_days: request.trialDays,
          }
        : undefined,
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      // Allow customers to update payment methods
      payment_method_collection: 'if_required',
    });

    return { url: session.url! };
  }
}
```

#### Adding Trial Periods

```typescript
// Add a 14-day free trial
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: stripeCustomerId,
  line_items: [{ price: priceId, quantity: 1 }],
  subscription_data: {
    trial_period_days: 14,
  },
  success_url: successUrl,
  cancel_url: cancelUrl,
});
```

### Usage-Based Billing

**Best for**: API services, AI/ML platforms, cloud infrastructure, metered services

Usage-based billing charges customers based on their actual consumption.

#### Creating a Meter

Meters track usage events and aggregate them for billing:

```typescript
// src/infrastructure/stripe/StripeMetering.ts
import Stripe from 'stripe';

export async function createUsageMeter(stripe: Stripe) {
  const meter = await stripe.billing.meters.create({
    display_name: 'API Requests',
    event_name: 'api_request',
    default_aggregation: {
      formula: 'sum',
    },
    customer_mapping: {
      event_payload_key: 'stripe_customer_id',
      type: 'by_id',
    },
    value_settings: {
      event_payload_key: 'request_count',
    },
  });

  return meter;
}
```

#### Creating Usage-Based Prices

```typescript
// Create a metered price
const meteredPrice = await stripe.prices.create({
  product: productId,
  currency: 'usd',
  billing_scheme: 'tiered',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
    meter: meterId, // Reference to the meter
  },
  tiers: [
    {
      up_to: 1000,
      unit_amount_decimal: '0', // First 1000 free
      flat_amount_decimal: '0',
    },
    {
      up_to: 'inf',
      unit_amount_decimal: '0.1', // $0.001 per request after
      flat_amount_decimal: '0',
    },
  ],
  tiers_mode: 'graduated',
});
```

#### Recording Usage

```typescript
// src/application/use-cases/billing/RecordUsage.ts
import Stripe from 'stripe';

export interface RecordUsageRequest {
  stripeCustomerId: string;
  eventName: string;
  value: number;
  timestamp?: number;
}

export class RecordUsage {
  constructor(private stripe: Stripe) {}

  async execute(request: RecordUsageRequest): Promise<void> {
    await this.stripe.billing.meterEvents.create({
      event_name: request.eventName,
      payload: {
        stripe_customer_id: request.stripeCustomerId,
        value: String(request.value),
      },
      timestamp: request.timestamp || Math.floor(Date.now() / 1000),
    });
  }
}
```

#### Usage Recording Middleware

Record API usage automatically with middleware:

```typescript
// src/presentation/middleware/usageTracking.ts
import type { Env } from '../../env';
import { RecordUsage } from '@application/use-cases/billing/RecordUsage';
import Stripe from 'stripe';

export function createUsageTracker(env: Env) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const recordUsage = new RecordUsage(stripe);

  return async (request: Request, customerId: string | null, ctx: ExecutionContext) => {
    if (!customerId) return;

    // Use waitUntil to record usage without blocking the response
    ctx.waitUntil(
      recordUsage
        .execute({
          stripeCustomerId: customerId,
          eventName: 'api_request',
          value: 1,
        })
        .catch((err) => {
          console.error('Failed to record usage:', err);
        })
    );
  };
}
```

### Invoicing

**Best for**: B2B, enterprise sales, manual billing, custom payment terms

Invoicing allows you to bill customers with net payment terms (e.g., Net 30).

#### Creating and Sending Invoices

```typescript
// src/application/use-cases/billing/CreateInvoice.ts
import Stripe from 'stripe';

export interface CreateInvoiceRequest {
  stripeCustomerId: string;
  items: Array<{
    description: string;
    amount: number; // in cents
    quantity: number;
  }>;
  daysUntilDue?: number;
  memo?: string;
}

export class CreateInvoice {
  constructor(private stripe: Stripe) {}

  async execute(request: CreateInvoiceRequest): Promise<Stripe.Invoice> {
    // Create invoice items
    for (const item of request.items) {
      await this.stripe.invoiceItems.create({
        customer: request.stripeCustomerId,
        amount: item.amount * item.quantity,
        currency: 'usd',
        description: item.description,
      });
    }

    // Create the invoice
    const invoice = await this.stripe.invoices.create({
      customer: request.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: request.daysUntilDue || 30,
      description: request.memo,
    });

    // Finalize and send
    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);

    await this.stripe.invoices.sendInvoice(finalizedInvoice.id);

    return finalizedInvoice;
  }
}
```

---

## Stripe Checkout Integration

Stripe Checkout is the recommended integration path for most applications. It provides a hosted, optimized payment page that handles:

- Payment method collection
- Address collection
- Tax calculation
- 3D Secure authentication
- Mobile optimization
- Localization

### Hosted Checkout Flow

The hosted checkout redirects customers to a Stripe-hosted payment page:

```typescript
// src/presentation/handlers/PaymentHandlers.ts
import type { Env } from '../../env';
import Stripe from 'stripe';
import { CreateCheckoutSession } from '@application/use-cases/payments/CreateCheckoutSession';
import { pricingPage } from '../templates/pages/pricing';
import { successPage } from '../templates/pages/success';

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

    // Retrieve session to display order details
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });

    return new Response(successPage({ session }), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
```

### Pricing Page Template

```typescript
// src/presentation/templates/pages/pricing.ts
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
          action="/app/_/checkout"
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

### Embedded Checkout

For a more seamless experience, embed Checkout directly on your page:

```typescript
// src/presentation/handlers/PaymentHandlers.ts
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

  // Return the client secret for the embedded form
  return new Response(embeddedCheckoutPage({ clientSecret: session.client_secret! }), {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

```typescript
// src/presentation/templates/pages/embedded-checkout.ts
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

## Custom Payment Forms with Elements

For maximum control over the payment experience, use Stripe Elements to build custom payment forms.

### Setting Up Stripe Elements

```html
<!-- public/checkout.html or in your template -->
<head>
  <script src="https://js.stripe.com/v3/"></script>
</head>
```

### Payment Element Integration

The Payment Element is a unified component that handles multiple payment methods:

```typescript
// src/presentation/templates/partials/payment-form.ts
export function paymentForm(clientSecret: string, publishableKey: string): string {
  return `
    <div 
      x-data="paymentForm('${clientSecret}', '${publishableKey}')"
      class="max-w-md mx-auto"
    >
      <form @submit.prevent="handleSubmit">
        <!-- Email input -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input 
            type="email" 
            x-model="email"
            class="input input-bordered w-full"
            required
          />
        </div>

        <!-- Stripe Payment Element mounts here -->
        <div id="payment-element" class="mb-4"></div>

        <!-- Error display -->
        <div x-show="error" class="alert alert-error mb-4">
          <span x-text="error"></span>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-full"
          :class="{ 'loading': processing }"
          :disabled="processing || !ready"
        >
          <span x-show="!processing">Pay Now</span>
          <span x-show="processing">Processing...</span>
        </button>
      </form>
    </div>

    <script>
      document.addEventListener('alpine:init', () => {
        Alpine.data('paymentForm', (clientSecret, publishableKey) => ({
          stripe: null,
          elements: null,
          paymentElement: null,
          email: '',
          error: null,
          processing: false,
          ready: false,

          async init() {
            this.stripe = Stripe(publishableKey);
            this.elements = this.stripe.elements({
              clientSecret: clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#570df8',
                  borderRadius: '8px',
                }
              }
            });
            
            this.paymentElement = this.elements.create('payment');
            this.paymentElement.mount('#payment-element');
            
            this.paymentElement.on('ready', () => {
              this.ready = true;
            });
          },

          async handleSubmit() {
            if (this.processing) return;
            
            this.processing = true;
            this.error = null;

            const { error } = await this.stripe.confirmPayment({
              elements: this.elements,
              confirmParams: {
                return_url: window.location.origin + '/success',
                receipt_email: this.email,
              },
            });

            if (error) {
              this.error = error.message;
              this.processing = false;
            }
            // If successful, Stripe redirects to return_url
          }
        }));
      });
    </script>
  `;
}
```

### Creating Payment Intent on Server

```typescript
// src/application/use-cases/payments/CreatePaymentIntent.ts
import Stripe from 'stripe';

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export class CreatePaymentIntent {
  constructor(private stripe: Stripe) {}

  async execute(request: CreatePaymentIntentRequest): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: request.amount,
      currency: request.currency,
      customer: request.customerId,
      metadata: request.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }
}
```

### Payment Handler with HTMX

```typescript
// src/presentation/handlers/PaymentHandlers.ts
async createPaymentIntent(request: Request): Promise<Response> {
  const formData = await request.formData();
  const amount = parseInt(formData.get('amount') as string, 10);

  const result = await this.createPaymentIntentUseCase.execute({
    amount,
    currency: 'usd',
  });

  // Return the payment form partial for HTMX to swap in
  return new Response(
    paymentForm(result.clientSecret, this.env.STRIPE_PUBLISHABLE_KEY),
    {
      headers: { 'Content-Type': 'text/html' },
    }
  );
}
```

---

## Webhook Handling

Webhooks are crucial for reliable payment processing. They notify your application of events like successful payments, subscription changes, and failed charges.

### Webhook Endpoint Setup

```typescript
// src/presentation/handlers/WebhookHandlers.ts
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

### Webhook Event Handler

```typescript
// src/application/use-cases/webhooks/HandleStripeWebhook.ts
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

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    // Provision access, send confirmation email, etc.
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

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment succeeded:', paymentIntent.id);

    await this.paymentRepository.updateStatus(paymentIntent.id, 'completed');

    // Trigger fulfillment, send receipt, etc.
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment failed:', paymentIntent.id);

    await this.paymentRepository.updateStatus(paymentIntent.id, 'failed');

    // Notify customer, trigger retry logic, etc.
  }

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

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice paid:', invoice.id);
    // Continue to provision access
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    console.log('Invoice payment failed:', invoice.id);
    // Notify customer to update payment method
  }
}
```

### Router Integration

```typescript
// src/router.ts (excerpt)
private registerRoutes(): void {
  // ... other routes

  // Stripe webhook endpoint
  this.post('/webhooks/stripe', (req) => this.webhookHandlers.handleStripeWebhook(req, this.env));
}
```

### Registering Webhooks with Stripe

Register your webhook endpoint in the Stripe Dashboard or via CLI:

```bash
# Using Stripe CLI for local development
stripe listen --forward-to localhost:8787/webhooks/stripe

# This will output a webhook signing secret (whsec_...)
# Add it to your environment
wrangler secret put STRIPE_WEBHOOK_SECRET
```

For production, register in Dashboard → Developers → Webhooks:

**Events to listen for:**

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

## Customer Portal Integration

The Stripe Customer Portal allows customers to manage their subscriptions, update payment methods, and view invoices without you building a custom UI.

### Configuring the Portal

Configure the portal in Dashboard → Settings → Billing → Customer portal, or via API:

```typescript
// src/infrastructure/stripe/StripePortalConfig.ts
import Stripe from 'stripe';

export async function configureCustomerPortal(stripe: Stripe) {
  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'Manage your subscription',
      privacy_policy_url: 'https://yoursite.com/privacy',
      terms_of_service_url: 'https://yoursite.com/terms',
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ['email', 'address', 'phone'],
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        proration_behavior: 'none',
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        proration_behavior: 'create_prorations',
      },
      invoice_history: {
        enabled: true,
      },
    },
  });

  return configuration;
}
```

### Creating Portal Sessions

```typescript
// src/presentation/handlers/CustomerPortalHandlers.ts
import type { Env } from '../../env';
import Stripe from 'stripe';

export class CustomerPortalHandlers {
  private stripe: Stripe;

  constructor(env: Env) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }

  async createPortalSession(request: Request): Promise<Response> {
    // Get the customer ID from session/auth
    const customerId = await this.getAuthenticatedCustomerId(request);

    if (!customerId) {
      return Response.redirect('/login', 302);
    }

    const url = new URL(request.url);
    const returnUrl = `${url.protocol}//${url.host}/account`;

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return Response.redirect(portalSession.url, 303);
  }

  private async getAuthenticatedCustomerId(request: Request): Promise<string | null> {
    // Implement your authentication logic here
    // Return the Stripe customer ID for the logged-in user
    return null;
  }
}
```

### Portal Link in UI

```typescript
// In your account/billing template
export function billingSection(customer: { stripeCustomerId: string }): string {
  return `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Billing & Subscription</h2>
        <p>Manage your subscription, update payment methods, and view invoices.</p>
        
        <form action="/app/_/customer-portal" method="POST">
          <button type="submit" class="btn btn-primary">
            Manage Billing
          </button>
        </form>
      </div>
    </div>
  `;
}
```

---

## Security Best Practices

### API Key Security

1. **Never expose secret keys**: Only use publishable keys on the client side
2. **Use environment secrets**: Store keys with `wrangler secret put`
3. **Rotate keys regularly**: Especially after any suspected compromise
4. **Restrict API keys**: Use Dashboard to limit key permissions

```typescript
// ❌ WRONG: Hardcoded secret key
const stripe = new Stripe('sk_live_...');

// ✅ CORRECT: Use environment variable
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
```

### Webhook Security

1. **Always verify signatures**: Never process unverified webhooks
2. **Use HTTPS**: Stripe only sends webhooks to HTTPS endpoints
3. **Respond quickly**: Return 2xx within 5 seconds to prevent retries

```typescript
// Always verify webhook signatures
try {
  event = await stripe.webhooks.constructEventAsync(body, signature, env.STRIPE_WEBHOOK_SECRET);
} catch (err) {
  return new Response('Invalid signature', { status: 400 });
}
```

### Idempotency

Use idempotency keys for all mutating operations to safely handle retries:

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

### PCI Compliance

Using Stripe Checkout or Elements keeps your integration PCI compliant:

1. **Never handle raw card data**: Let Stripe.js tokenize cards
2. **Use Stripe's hosted fields**: Payment Element handles card input
3. **Redirect to Stripe Checkout**: Simplest path to compliance

### Input Validation

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

## Testing Your Integration

### Test Mode vs Live Mode

Stripe provides separate test and live environments:

| Environment | Key Prefix             | Purpose                 |
| ----------- | ---------------------- | ----------------------- |
| Test        | `pk_test_`, `sk_test_` | Development and testing |
| Live        | `pk_live_`, `sk_live_` | Production transactions |

### Test Card Numbers

Use these test card numbers in test mode:

| Scenario                | Card Number           |
| ----------------------- | --------------------- |
| Successful payment      | `4242 4242 4242 4242` |
| Requires authentication | `4000 0025 0000 3155` |
| Declined                | `4000 0000 0000 9995` |
| Insufficient funds      | `4000 0000 0000 9995` |

Use any future expiration date and any 3-digit CVC.

### Testing Webhooks Locally

Use the Stripe CLI to forward webhooks during development:

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

### Test Clocks for Subscriptions

Test time-based subscription behavior with test clocks:

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

### Integration Tests

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

## Going Live

### Pre-Launch Checklist

Before accepting live payments:

- [ ] **Complete account verification**: Submit business details in Dashboard
- [ ] **Add bank account**: Configure payout destination
- [ ] **Enable 2FA**: Secure your Stripe account
- [ ] **Switch to live keys**: Update environment variables
- [ ] **Register live webhook endpoint**: Configure production URL
- [ ] **Test with live test transactions**: Make small real payments
- [ ] **Configure statement descriptor**: What appears on customer statements
- [ ] **Set up dispute notifications**: Get alerted to chargebacks

### Activating Your Account

1. Go to Dashboard → Account → Complete your profile
2. Enter business type, tax details, and business information
3. Add personal verification information
4. Configure customer-facing details (statement descriptor)
5. Add bank account for payouts
6. Enable two-step authentication
7. Review and submit

### Switching to Live Mode

Update your Wrangler secrets for production:

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

### Monitoring in Production

Set up alerts and monitoring:

1. **Dashboard Alerts**: Configure in Settings → Team settings → Alerts
2. **Failed Payment Notifications**: Get notified of payment failures
3. **Dispute Alerts**: Immediate notification of chargebacks
4. **Radar Rules**: Monitor for fraud patterns

---

## Complete Example Application

This section provides a complete, working example of a SaaS application with subscription billing.

### Worker Entry Point

```typescript
// src/index.ts
import { Router } from './router';
import type { Env } from './env';
import Stripe from 'stripe';
import { PaymentHandlers } from './presentation/handlers/PaymentHandlers';
import { SubscriptionHandlers } from './presentation/handlers/SubscriptionHandlers';
import { WebhookHandlers } from './presentation/handlers/WebhookHandlers';
import { CustomerPortalHandlers } from './presentation/handlers/CustomerPortalHandlers';
import { D1CustomerRepository } from './infrastructure/repositories/D1CustomerRepository';
import { D1SubscriptionRepository } from './infrastructure/repositories/D1SubscriptionRepository';
import { D1PaymentRepository } from './infrastructure/repositories/D1PaymentRepository';
import { HandleStripeWebhook } from './application/use-cases/webhooks/HandleStripeWebhook';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Initialize Stripe
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);

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
      const paymentHandlers = new PaymentHandlers(env, stripe);
      const subscriptionHandlers = new SubscriptionHandlers(env, stripe, customerRepository);
      const webhookHandlers = new WebhookHandlers(env, handleWebhook);
      const portalHandlers = new CustomerPortalHandlers(env);

      // Create and run router
      const router = new Router(
        env,
        paymentHandlers,
        subscriptionHandlers,
        webhookHandlers,
        portalHandlers
      );

      return await router.handle(request);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
```

### Complete Router

```typescript
// src/router.ts
import type { Env } from './env';
import type { PaymentHandlers } from './presentation/handlers/PaymentHandlers';
import type { SubscriptionHandlers } from './presentation/handlers/SubscriptionHandlers';
import type { WebhookHandlers } from './presentation/handlers/WebhookHandlers';
import type { CustomerPortalHandlers } from './presentation/handlers/CustomerPortalHandlers';

type RouteHandler = (request: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  constructor(
    private env: Env,
    private paymentHandlers: PaymentHandlers,
    private subscriptionHandlers: SubscriptionHandlers,
    private webhookHandlers: WebhookHandlers,
    private portalHandlers: CustomerPortalHandlers
  ) {
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // Application pages (authenticated) - served under /app
    this.get('/app', (req) => this.paymentHandlers.dashboardPage(req));
    this.get('/app/billing', (req) => this.paymentHandlers.billingPage(req));

    // HTMX partials (authenticated) - served under /app/_
    this.post('/app/_/checkout', (req) => this.paymentHandlers.createCheckout(req));
    this.post('/app/_/checkout/embedded', (req) => this.paymentHandlers.embeddedCheckout(req));
    this.post('/app/_/subscribe', (req) => this.subscriptionHandlers.createSubscription(req));
    this.post('/app/_/subscription/cancel', (req) =>
      this.subscriptionHandlers.cancelSubscription(req)
    );
    this.get('/app/_/subscription/status', (req) => this.subscriptionHandlers.getStatus(req));
    this.post('/app/_/customer-portal', (req) => this.portalHandlers.createPortalSession(req));

    // Webhooks (signature verification, no session auth)
    this.post('/webhooks/stripe', (req) => this.webhookHandlers.handleStripeWebhook(req, this.env));

    // Note: Static pages (/, /pricing, /success, /cancel) are served by
    // Cloudflare Pages from public/, NOT by the Worker
  }

  private addRoute(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const pattern = path
      .replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
      handler,
    });
  }

  private get(path: string, handler: RouteHandler): void {
    this.addRoute('GET', path, handler);
  }

  private post(path: string, handler: RouteHandler): void {
    this.addRoute('POST', path, handler);
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = url.pathname.match(route.pattern);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return route.handler(request, params);
    }

    return new Response('Not found', { status: 404 });
  }
}
```

### Pricing Page with HTMX

```typescript
// src/presentation/templates/pages/pricing.ts
import { baseLayout } from '../layouts/base';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  recommended?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals',
    monthlyPrice: 9,
    yearlyPrice: 90,
    features: ['5 projects', '10GB storage', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing teams',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Dedicated support',
      'Custom integrations',
      'SLA',
    ],
  },
];

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
        ${plans.map((plan) => planCard(plan)).join('')}
      </div>
    </div>
  `;

  return baseLayout({ title: 'Pricing', content });
}

function planCard(plan: Plan): string {
  return `
    <div class="card bg-base-100 shadow-xl ${plan.recommended ? 'border-2 border-primary' : ''}">
      ${plan.recommended ? '<div class="badge badge-primary absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</div>' : ''}
      
      <div class="card-body">
        <h2 class="card-title">${plan.name}</h2>
        <p class="text-base-content/70">${plan.description}</p>
        
        <div class="my-6">
          <span class="text-4xl font-bold" x-text="yearly ? '$${plan.yearlyPrice}' : '$${plan.monthlyPrice}'">$${plan.monthlyPrice}</span>
          <span class="text-base-content/70" x-text="yearly ? '/year' : '/month'">/month</span>
        </div>

        <ul class="space-y-2 mb-6">
          ${plan.features
            .map(
              (f) => `
            <li class="flex items-center gap-2">
              <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              ${f}
            </li>
          `
            )
            .join('')}
        </ul>

        <form
          action="/app/_/subscribe"
          method="POST"
          hx-post="/app/_/subscribe"
          hx-swap="none"
          x-data="{ loading: false }"
          @htmx:before-request="loading = true"
          @htmx:after-request="loading = false"
        >
          <input type="hidden" name="planId" value="${plan.id}" />
          <input type="hidden" name="interval" :value="yearly ? 'year' : 'month'" />
          
          <button 
            type="submit" 
            class="btn ${plan.recommended ? 'btn-primary' : 'btn-outline'} w-full"
            :class="{ 'loading': loading }"
            :disabled="loading"
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  `;
}
```

### Package.json

```json
{
  "name": "cloudflare-stripe-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest",
    "test:run": "vitest run",
    "types": "wrangler types",
    "db:migrate": "wrangler d1 migrations apply payments-db",
    "db:migrate:local": "wrangler d1 migrations apply payments-db --local",
    "css:build": "npx @tailwindcss/cli -i ./src/styles/app.css -o ./public/css/app.css --minify"
  },
  "dependencies": {
    "stripe": "^14.0.0"
  },
  "devDependencies": {
    "@cloudflare/vitest-pool-workers": "^0.1.0",
    "@cloudflare/workers-types": "^4.20250101.0",
    "@tailwindcss/postcss": "^4.0.0",
    "daisyui": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "wrangler": "^3.0.0"
  }
}
```

---

## Conclusion

This guide has covered the essential aspects of integrating Stripe payments into Cloudflare-based interactive web applications:

1. **Multiple Payment Models**: From simple one-time payments to complex usage-based billing
2. **Checkout Integration**: Both hosted and embedded options for maximum flexibility
3. **Webhook Handling**: Reliable payment confirmation and fulfillment
4. **Security Best Practices**: Protecting API keys, validating webhooks, and maintaining PCI compliance
5. **Testing Strategies**: Using test mode, test cards, and test clocks
6. **Production Readiness**: Complete checklist for going live

### Key Takeaways

- **Use Stripe Checkout** for most use cases—it's fast, secure, and conversion-optimized
- **Always use webhooks** for payment confirmation—never rely solely on redirects
- **Keep domain logic pure** by abstracting Stripe behind interfaces
- **Test thoroughly** with Stripe's test mode before going live
- **Monitor actively** using Stripe's dashboard and alerts

### Next Steps

- Explore [Stripe Radar](https://docs.stripe.com/radar) for fraud prevention
- Implement [Stripe Tax](https://docs.stripe.com/tax) for automatic tax calculation
- Consider [Stripe Connect](https://docs.stripe.com/connect) for marketplace payments
- Review [Stripe Sigma](https://docs.stripe.com/sigma) for advanced analytics

---

_This guide reflects best practices as of January 2026. For the latest documentation, consult the official [Stripe documentation](https://docs.stripe.com) and [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)._
