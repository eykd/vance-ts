# Payment Use Cases

**Purpose**: Implement specific payment models (one-time, subscriptions, usage-based, invoicing)

**When to read**: Implementing specific payment models for your business

**Source**: Full implementation in `docs/stripe-cloudflare-integration-guide.md`

---

## Overview

Stripe supports various business models:

| Model         | Best For                                        |
| ------------- | ----------------------------------------------- |
| One-Time      | E-commerce, digital products, donations         |
| Subscriptions | SaaS, membership sites, recurring services      |
| Usage-Based   | API services, AI/ML platforms, metered services |
| Invoicing     | B2B, enterprise sales, custom payment terms     |

---

## One-Time Payments

### Payment Links (No Code)

The fastest way to accept payments:

1. In Stripe Dashboard: **Payment Links** → **+ New**
2. Add your product with price details
3. Share the link

```html
<!-- Embed as a button -->
<a href="https://buy.stripe.com/your_link" class="btn btn-primary"> Buy Now - $29 </a>

<!-- With Alpine.js loading state -->
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

### Stripe Checkout (Recommended)

See `implementation/checkout-integration.md` for full Checkout implementation.

---

## SaaS Subscriptions

### Creating Products and Prices

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

### CreateSubscription Use Case

**File**: `src/application/use-cases/subscriptions/CreateSubscription.ts`

```typescript
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
      payment_method_collection: 'if_required',
    });

    return { url: session.url! };
  }
}
```

### Trial Periods

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

---

## Usage-Based Billing

### Creating a Meter

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

### Creating Usage-Based Prices

```typescript
// Create a metered price with tiered pricing
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

### RecordUsage Use Case

**File**: `src/application/use-cases/billing/RecordUsage.ts`

```typescript
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

### Usage Recording Middleware

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

---

## Invoicing

### CreateInvoice Use Case

**File**: `src/application/use-cases/billing/CreateInvoice.ts`

```typescript
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

## Domain Entities

### Customer Entity

```typescript
// src/domain/entities/Customer.ts
export interface Customer {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription Entity

```typescript
// src/domain/entities/Subscription.ts
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export interface Subscription {
  id: string;
  customerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment Entity

```typescript
// src/domain/entities/Payment.ts
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  customerId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string | null;
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Repository Interfaces

```typescript
// src/domain/interfaces/CustomerRepository.ts
export interface CustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByStripeCustomerId(stripeId: string): Promise<Customer | null>;
  create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer>;
  updateStripeCustomerId(id: string, stripeCustomerId: string): Promise<void>;
}

// src/domain/interfaces/SubscriptionRepository.ts
export interface SubscriptionRepository {
  findByCustomerId(customerId: string): Promise<Subscription | null>;
  findByStripeId(stripeId: string): Promise<Subscription | null>;
  create(subscription: Omit<Subscription, 'createdAt' | 'updatedAt'>): Promise<Subscription>;
  updateByStripeId(stripeId: string, data: Partial<Subscription>): Promise<void>;
}
```

---

## Testing

```typescript
describe('CreateSubscription', () => {
  it('should create subscription checkout session', async () => {
    const mockCustomerRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'cust_1',
        email: 'test@example.com',
        stripeCustomerId: 'cus_stripe123',
      }),
      updateStripeCustomerId: vi.fn(),
    };

    const useCase = new CreateSubscription(stripe, mockCustomerRepo);

    const result = await useCase.execute({
      customerId: 'cust_1',
      priceId: 'price_123',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.url).toBeDefined();
  });
});
```

---

## Next Steps

- For checkout flows → Read `implementation/checkout-integration.md`
- For webhook handling → Read `implementation/webhook-handling.md`
- For customer portal → Read `implementation/customer-portal.md`
