# Stripe Payments Architecture

**Purpose**: High-level architectural overview for Stripe integration

**When to read**: Specification phase, early planning

---

## Why Stripe + Cloudflare?

**Edge-First Payment Processing**: Cloudflare Workers execute globally at the edge, reducing latency for payment API calls.

**Serverless Webhook Handling**: Workers receive and process Stripe webhooks without managing traditional server infrastructure.

**Secure Secret Management**: Cloudflare's environment variables and secrets management provide secure storage for Stripe API keys.

**Hypermedia-Driven Payment UX**: HTMX enables seamless payment flows with partial page updates, while Alpine.js handles client-side interactions.

---

## Clean Architecture with Payments

```
+-------------------------------------------------------------+
|                    Presentation Layer                        |
|   (HTMX/Alpine.js + Payment Forms + TailwindCSS/DaisyUI)    |
+-------------------------------------------------------------+
|                    Application Layer                         |
|   (Use Cases: CreateSubscription, ProcessPayment, etc.)     |
+-------------------------------------------------------------+
|                      Domain Layer                            |
|   (Entities: Subscription, Payment, Customer, Invoice)      |
|   (Interfaces: PaymentGateway, SubscriptionRepository)      |
+-------------------------------------------------------------+
|                   Infrastructure Layer                       |
|   (StripePaymentGateway, D1 Repositories, Webhook Handlers) |
+-------------------------------------------------------------+
```

---

## Payment Flow Architecture

```
+------------+   HTMX/Form    +------------+   Stripe API   +------------+
|  Browser   | ------------> |   Worker   | -------------> |   Stripe   |
|  (Client)  |               |   (Edge)   |                |   (API)    |
|            | <------------ |            | <------------- |            |
| - HTMX     |  HTML/Redirect| - Handlers |  Session/Intent| - Checkout |
| - Alpine.js|               | - Use Cases|                | - Billing  |
| - Stripe.js|               | - Gateway  |                | - Webhooks |
+------------+               +------------+                +------------+
                                   |
                                   | Webhook Events
                                   v
                             +------------+
                             |  D1 / KV   |
                             | (Storage)  |
                             +------------+
```

---

## Key Design Principles

1. **Server-Side Session Creation**: Always create Checkout Sessions and Payment Intents on the server (Worker) to protect your secret key.

2. **Webhook-Driven Fulfillment**: Never rely solely on client-side success redirects. Use webhooks to confirm payment completion.

3. **Idempotency**: Use idempotency keys for all mutating Stripe API calls to safely handle retries.

4. **Domain Isolation**: Keep payment domain logic separate from Stripe-specific implementation details.

---

## Integration Type Comparison

| Integration Type           | Effort      | Customization | Best For                     |
| -------------------------- | ----------- | ------------- | ---------------------------- |
| Payment Links              | No code     | Limited       | Quick setup, simple products |
| Stripe Checkout (Hosted)   | Low         | Moderate      | Most applications            |
| Stripe Checkout (Embedded) | Low-Medium  | Moderate      | Seamless UX on your site     |
| Stripe Elements            | Medium-High | Extensive     | Full custom payment forms    |

**Recommendation**: Start with Stripe Checkout (Hosted) for most use cases.

---

## Storage Design

### D1 Database (Persistent Records)

- **customers**: User-to-Stripe customer mapping
- **subscriptions**: Subscription state and period tracking
- **payments**: Payment intent records and status

### KV Storage (Caching/Sessions)

- **Session caching**: Reduce database reads for user sessions
- **Price caching**: Cache Stripe price data for faster page loads

---

## API Keys

| Key Type        | Prefix                  | Usage                       |
| --------------- | ----------------------- | --------------------------- |
| Publishable Key | `pk_test_` / `pk_live_` | Client-side, safe to expose |
| Secret Key      | `sk_test_` / `sk_live_` | Server-side only            |

**Never expose secret keys to the client**.

---

## Project Structure

```
src/
├── domain/
│   ├── entities/
│   │   ├── Customer.ts
│   │   ├── Subscription.ts
│   │   ├── Payment.ts
│   │   └── Invoice.ts
│   ├── value-objects/
│   │   ├── Money.ts
│   │   └── SubscriptionStatus.ts
│   └── interfaces/
│       ├── PaymentGateway.ts
│       └── CustomerRepository.ts
│
├── application/
│   └── use-cases/
│       ├── payments/
│       │   ├── CreateCheckoutSession.ts
│       │   └── ProcessPayment.ts
│       ├── subscriptions/
│       │   ├── CreateSubscription.ts
│       │   └── CancelSubscription.ts
│       └── webhooks/
│           └── HandleStripeWebhook.ts
│
├── infrastructure/
│   ├── stripe/
│   │   ├── StripeClient.ts
│   │   └── StripePaymentGateway.ts
│   └── repositories/
│       ├── D1CustomerRepository.ts
│       └── D1SubscriptionRepository.ts
│
└── presentation/
    ├── handlers/
    │   ├── PaymentHandlers.ts
    │   └── WebhookHandlers.ts
    └── templates/
        └── pages/
            └── pricing.ts
```

---

## Next Steps

- For checkout implementation → Read `implementation/checkout-integration.md`
- For payment models → Read `implementation/payment-use-cases.md`
- For webhook handling → Read `implementation/webhook-handling.md`
- For complete examples → Read `docs/stripe-cloudflare-integration-guide.md`
