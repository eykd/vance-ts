# Customer Portal Integration

**Purpose**: Enable customer self-service for subscription and billing management

**When to read**: Adding subscription management, payment method updates, invoice history

**Source**: Full implementation in `docs/stripe-cloudflare-integration-guide.md`

---

## Overview

The Stripe Customer Portal allows customers to:

- Manage their subscriptions (upgrade, downgrade, cancel)
- Update payment methods
- View and download invoices
- Update billing information

**Benefits**: No custom UI required for common billing operations.

---

## Portal Configuration

Configure via Dashboard (Settings → Billing → Customer portal) or API:

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

**Configuration options**:

| Feature                 | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `customer_update`       | Allow updating email, address, phone            |
| `payment_method_update` | Allow adding/removing payment methods           |
| `subscription_cancel`   | Allow cancellation (immediate or at period end) |
| `subscription_update`   | Allow plan changes with proration handling      |
| `invoice_history`       | Show past invoices with download links          |

---

## Portal Session Handler

**File**: `src/presentation/handlers/CustomerPortalHandlers.ts`

```typescript
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

    // Example with session cookie:
    // const sessionId = getCookie(request, '__Host-session');
    // const session = await sessionRepository.findById(sessionId);
    // const user = await userRepository.findById(session.userId);
    // return user.stripeCustomerId;

    return null;
  }
}
```

---

## Billing Page Component

```typescript
// src/presentation/templates/partials/billing-section.ts
export function billingSection(customer: { stripeCustomerId: string }): string {
  return `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Billing & Subscription</h2>
        <p class="text-base-content/70">
          Manage your subscription, update payment methods, and view invoices.
        </p>

        <form action="/api/customer-portal" method="POST" class="mt-4">
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

## Account Page Integration

```typescript
// src/presentation/templates/pages/account.ts
import { baseLayout } from '../layouts/base';
import { billingSection } from '../partials/billing-section';

interface AccountPageProps {
  user: {
    email: string;
    name: string | null;
    stripeCustomerId: string | null;
  };
  subscription: {
    status: string;
    planName: string;
    currentPeriodEnd: Date;
  } | null;
}

export function accountPage({ user, subscription }: AccountPageProps): string {
  const content = `
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold mb-8">Account Settings</h1>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Profile Section -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">Profile</h2>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Name:</strong> ${user.name || 'Not set'}</p>
          </div>
        </div>

        <!-- Subscription Status -->
        ${
          subscription
            ? `
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Current Plan</h2>
              <p><strong>Plan:</strong> ${subscription.planName}</p>
              <p><strong>Status:</strong>
                <span class="badge ${subscription.status === 'active' ? 'badge-success' : 'badge-warning'}">
                  ${subscription.status}
                </span>
              </p>
              <p><strong>Renews:</strong> ${subscription.currentPeriodEnd.toLocaleDateString()}</p>
            </div>
          </div>
        `
            : ''
        }

        <!-- Billing Section -->
        ${
          user.stripeCustomerId
            ? billingSection({ stripeCustomerId: user.stripeCustomerId })
            : `
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Billing</h2>
              <p>No active subscription.</p>
              <a href="/pricing" class="btn btn-primary mt-4">View Plans</a>
            </div>
          </div>
        `
        }
      </div>
    </div>
  `;

  return baseLayout({ title: 'Account', content });
}
```

---

## Router Integration

```typescript
// src/router.ts
private registerRoutes(): void {
  // ... other routes

  // Customer portal
  this.post('/api/customer-portal', (req) => this.portalHandlers.createPortalSession(req));

  // Account page
  this.get('/account', (req) => this.accountHandlers.accountPage(req));
}
```

---

## With Authentication Middleware

```typescript
// Ensure user is authenticated before portal access
async createPortalSession(request: Request): Promise<Response> {
  // Auth middleware should have already validated session
  const session = request.session; // From middleware

  if (!session || !session.userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const customer = await this.customerRepository.findById(session.userId);

  if (!customer?.stripeCustomerId) {
    return new Response('No Stripe customer found', { status: 400 });
  }

  const url = new URL(request.url);
  const returnUrl = `${url.protocol}//${url.host}/account`;

  const portalSession = await this.stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: returnUrl,
  });

  return Response.redirect(portalSession.url, 303);
}
```

---

## HTMX Integration

```html
<!-- Billing button with loading state -->
<form
  action="/api/customer-portal"
  method="POST"
  x-data="{ loading: false }"
  @submit="loading = true"
>
  <button type="submit" class="btn btn-primary" :class="{ 'loading': loading }" :disabled="loading">
    <span x-show="!loading">Manage Billing</span>
    <span x-show="loading">Redirecting...</span>
  </button>
</form>
```

---

## Testing

```typescript
describe('CustomerPortalHandlers', () => {
  it('should create portal session for authenticated user', async () => {
    const mockStripe = {
      billingPortal: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            url: 'https://billing.stripe.com/session/test',
          }),
        },
      },
    };

    const handler = new CustomerPortalHandlers(env);
    handler.stripe = mockStripe as unknown as Stripe;

    // Mock authenticated request
    const request = new Request('https://example.com/api/customer-portal', {
      method: 'POST',
    });

    const response = await handler.createPortalSession(request);

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toContain('billing.stripe.com');
  });

  it('should redirect to login if not authenticated', async () => {
    const handler = new CustomerPortalHandlers(env);

    const request = new Request('https://example.com/api/customer-portal', {
      method: 'POST',
    });

    const response = await handler.createPortalSession(request);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/login');
  });
});
```

---

## Next Steps

- For checkout flows → Read `implementation/checkout-integration.md`
- For security → Read `implementation/security-testing.md`
- For complete examples → Read `docs/stripe-cloudflare-integration-guide.md`
