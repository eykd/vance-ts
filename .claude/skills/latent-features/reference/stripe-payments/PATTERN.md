# Stripe Payments Integration Pattern

**Purpose**: Comprehensive Stripe payment integration for Cloudflare Workers with HTMX/Alpine.js

**Trigger keywords**: stripe, payments, checkout, subscription, billing, invoicing, usage-based, webhook

---

## Pattern Overview

**What this pattern provides**:

- Multiple payment models (one-time, subscriptions, usage-based, invoicing)
- Stripe Checkout integration (hosted and embedded)
- Custom payment forms with Stripe Elements
- Webhook handling with signature verification
- Customer portal integration
- Clean Architecture patterns for payment processing
- Complete implementation examples with tests

**Technologies**:

- Cloudflare Workers (TypeScript)
- Stripe SDK (v14+)
- D1 Database (customer/subscription/payment storage)
- KV Storage (session caching, price caching)
- HTMX + Alpine.js (frontend)
- DaisyUI/TailwindCSS (styling)

**Key features**:

- Server-side session creation (secret key protection)
- Webhook-driven fulfillment (reliable payment confirmation)
- Idempotency keys for safe retries
- PCI compliance via Stripe.js tokenization
- Edge-first payment processing (low latency globally)

---

## Progressive Disclosure Path

### Level 1: Architecture Overview (~140 lines)

**File**: `architecture/overview.md`

**When to read**: Specification phase, early planning

**What you get**:

- Clean Architecture diagram with payment layers
- Payment flow architecture (browser → worker → Stripe)
- Key design principles (server-side sessions, webhook fulfillment, idempotency)
- Storage design (D1 for records, KV for caching)
- Integration type comparison (Payment Links vs Checkout vs Elements)
- Project structure overview

**Use this when**:

- Writing feature specifications for payments
- Understanding payment integration requirements
- Making high-level design decisions
- Choosing between integration approaches

---

### Level 2: Checkout Integration (~380 lines)

**File**: `implementation/checkout-integration.md`

**When to read**: Implementing Stripe Checkout flows

**What you get**:

- Hosted checkout implementation
- Embedded checkout setup
- CreateCheckoutSession use case
- Payment handlers for HTMX
- Pricing page template with Alpine.js
- Success/cancel page handling

**Use this when**:

- Building checkout flows
- Creating pricing pages
- Implementing hosted payment pages
- Setting up embedded checkout

---

### Level 3: Payment Use Cases (~420 lines)

**File**: `implementation/payment-use-cases.md`

**When to read**: Implementing specific payment models

**What you get**:

- One-time payments with Payment Links
- SaaS subscriptions with trial periods
- Usage-based billing with meters
- Invoicing for B2B customers
- Product/price creation patterns
- Usage recording middleware

**Use this when**:

- Implementing subscription billing
- Building usage-based pricing
- Creating B2B invoicing features
- Setting up product catalogs

---

### Level 4: Webhook Handling (~350 lines)

**File**: `implementation/webhook-handling.md`

**When to read**: Implementing payment confirmation and fulfillment

**What you get**:

- Webhook endpoint setup
- Signature verification implementation
- Event handler use case pattern
- Checkout, payment, subscription, invoice event handling
- Router integration
- Webhook registration with Stripe CLI/Dashboard

**Use this when**:

- Setting up webhook endpoints
- Implementing payment fulfillment
- Handling subscription lifecycle events
- Processing invoice events

---

### Level 5: Customer Portal (~180 lines)

**File**: `implementation/customer-portal.md`

**When to read**: Enabling customer self-service

**What you get**:

- Portal configuration (features, policies)
- Portal session creation
- Billing UI component
- Handler implementation

**Use this when**:

- Adding subscription management
- Enabling payment method updates
- Implementing invoice history access
- Building billing pages

---

### Level 6: Security & Testing (~320 lines)

**File**: `implementation/security-testing.md`

**When to read**: Ensuring secure implementation and testing

**What you get**:

- API key security patterns
- Webhook signature verification best practices
- Idempotency key usage
- PCI compliance guidelines
- Input validation patterns
- Test mode setup
- Test card numbers
- Webhook testing with Stripe CLI
- Test clocks for subscriptions
- Integration test examples
- Pre-launch checklist

**Use this when**:

- Reviewing security requirements
- Setting up test environment
- Writing integration tests
- Preparing for production launch

---

## Usage by Phase

### Specification Phase (`/sp:02-specify`)

**Goal**: Identify payment requirements for feature spec

**Steps**:

1. Load: `architecture/overview.md`
2. Extract: Architecture overview, integration approach
3. Document: Payment requirements in spec
4. Note: Implementation details deferred to planning

**Token cost**: ~140 lines

**Example output for spec**:

```markdown
## Payment Requirements

This feature requires Stripe integration:

- Integration type: Stripe Checkout (hosted)
- Payment models: Recurring subscriptions with trial periods
- Storage: D1 for customer/subscription records, KV for session caching
- Webhook handling: checkout.session.completed, customer.subscription.\*
- Customer portal: Subscription management, payment method updates

See latent-features/stripe-payments for implementation patterns.
```

---

### Planning Phase (`/sp:04-plan`)

**Goal**: Create implementation plan with component structure

**Steps**:

1. Load: `architecture/overview.md` (if not already loaded)
2. Load: `implementation/checkout-integration.md` (for checkout flows)
3. Load: `implementation/payment-use-cases.md` (for payment models)
4. Extract: Component structure, use case interfaces
5. Create: Implementation phases

**Token cost**: ~940 lines (architecture + checkout + use cases)

**Example plan structure**:

```markdown
## Implementation Plan

### Phase 1: Infrastructure Setup

- Reference: architecture/overview.md
- Configure: wrangler.jsonc with D1, KV bindings
- Add: Stripe secrets (wrangler secret put)
- Create: Database migrations for customers, subscriptions, payments

### Phase 2: Domain Layer

- Reference: payment-use-cases.md
- Implement: Customer, Subscription, Payment entities
- Define: Repository interfaces

### Phase 3: Checkout Implementation

- Reference: checkout-integration.md
- Implement: CreateCheckoutSession use case
- Build: Pricing page with HTMX/Alpine.js
- Add: Success/cancel page handlers

### Phase 4: Webhook Handling

- Reference: webhook-handling.md
- Implement: HandleStripeWebhook use case
- Register: Webhook endpoint with Stripe

### Phase 5: Customer Portal

- Reference: customer-portal.md
- Configure: Portal settings
- Add: Portal session handler
```

---

### Implementation Phase

**Goal**: Load specific patterns as needed for current work

**Approach**: On-demand loading based on implementation task

**Examples**:

```
Task: Build pricing page with checkout
→ Load: implementation/checkout-integration.md
→ Token cost: ~380 lines

Task: Add subscription billing
→ Load: implementation/payment-use-cases.md
→ Token cost: ~420 lines

Task: Set up webhook handling
→ Load: implementation/webhook-handling.md
→ Token cost: ~350 lines

Task: Enable customer self-service
→ Load: implementation/customer-portal.md
→ Token cost: ~180 lines

Task: Prepare for production
→ Load: implementation/security-testing.md
→ Token cost: ~320 lines
```

---

## Complete Reference

**File**: `docs/stripe-cloudflare-integration-guide.md` (~2,229 lines)

**When to use**: Rarely - only when focused reference files are insufficient

**Contains**:

- Complete implementation examples
- Full router and handler code
- Database migration scripts
- Complete pricing page templates
- Package.json configuration
- Step-by-step setup instructions

**Prefer**: Focused reference files above for 65% token savings

---

## Token Efficiency Comparison

### Progressive Disclosure Approach

```
Session 1 (Specification): 140 lines
Session 2 (Planning): 380 + 420 = 800 lines
Session 3 (Webhooks): 350 lines
Session 4 (Portal): 180 lines
Session 5 (Security): 320 lines

Total: ~1,790 lines across 5 sessions
```

### Monolithic Approach

```
Session 1: Load entire guide (2,229 lines)
Total: 2,229 lines
```

**Token savings**: ~20% reduction for single session, up to 65% reduction when loading only needed sections

---

## Testing Strategy

Each reference file includes testing patterns:

- **checkout-integration.md**: Checkout session creation tests
- **payment-use-cases.md**: Use case unit tests, subscription flow tests
- **webhook-handling.md**: Signature verification tests, event handler tests
- **security-testing.md**: Complete test suite patterns, integration tests

---

## Dependencies

```json
{
  "dependencies": {
    "stripe": "^14.0.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "@cloudflare/vitest-pool-workers": "^0.1.0"
  }
}
```

---

## Database Migrations Required

```sql
-- customers table
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- subscriptions table
CREATE TABLE subscriptions (
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

-- payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

---

## Next Steps After Reading This Pattern

1. **For architecture understanding** → Read `architecture/overview.md`
2. **For checkout implementation** → Read `implementation/checkout-integration.md`
3. **For payment models** → Read `implementation/payment-use-cases.md`
4. **For webhooks** → Read `implementation/webhook-handling.md`
5. **For customer portal** → Read `implementation/customer-portal.md`
6. **For security/testing** → Read `implementation/security-testing.md`
7. **For complete examples** → Refer to `docs/stripe-cloudflare-integration-guide.md` (use sparingly)

---

## Notes

- All patterns follow Stripe best practices (January 2026)
- Integration uses defense-in-depth (server-side keys, webhook verification)
- Implementation examples target Cloudflare Workers (TypeScript)
- Architecture assumes DDD/Clean Architecture approach
- All patterns include PCI compliance considerations
