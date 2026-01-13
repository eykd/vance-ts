# GOOS: Growing Object-Oriented Software, Guided by Tests

The GOOS methodology for outside-in test-driven development in TypeScript.

## Core Philosophy

GOOS emphasizes:

1. **Tests describe behavior, not implementation** - Tests express what the system does
2. **Objects communicate through messages** - Focus on method calls, not internal state
3. **Outside-in development** - Start from acceptance tests, work inward
4. **Mock roles, not objects** - Mock TypeScript interfaces, not concrete classes
5. **Listen to the tests** - Hard-to-test code signals design problems

## The Outside-In Process

### Step 1: Write a Failing Acceptance Test

Start with a test that describes the complete feature from the user's perspective:

```typescript
// src/api/OrderController.acceptance.test.ts
describe('Order Placement Feature', () => {
  it('allows customer to place order', async () => {
    // Given: Customer and products exist
    const orderRequest = {
      customerId: 'customer-123',
      items: [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
      ],
    };

    // When: Customer submits order
    const response = await request(app).post('/api/orders').send(orderRequest).expect(201);

    // Then: Receive confirmation
    expect(response.body).toEqual({
      orderId: expect.stringMatching(/^order-/),
      customerId: 'customer-123',
      status: 'confirmed',
      totalItems: 3,
    });
  });
});
```

**Characteristics:**

- Uses domain language (customer, order, items)
- Tests end-to-end behavior
- Written from user perspective
- Given-When-Then structure

### Step 2: Identify First Missing Capability

Run the acceptance test. It will fail and tell you what's missing:

```
Error: Cannot POST /api/orders
```

This identifies what to build next: an HTTP endpoint and controller.

### Step 3: Drop Down to Unit Tests

Write unit tests to drive the design of the missing capability:

```typescript
// src/api/OrderController.spec.ts
describe('OrderController', () => {
  let controller: OrderController;
  let mockService: PlaceOrderService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Mock the collaborator (role)
    mockService = {
      placeOrder: vi.fn(),
    } as PlaceOrderService;

    controller = new OrderController(mockService);

    mockRequest = { body: {} };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it('delegates order placement to service', async () => {
    // Given: Valid request
    mockRequest.body = {
      customerId: 'customer-123',
      items: [{ productId: 'product-1', quantity: 2 }],
    };

    vi.mocked(mockService.placeOrder).mockResolvedValue({
      orderId: 'order-abc',
      customerId: 'customer-123',
      status: 'confirmed',
      totalItems: 2,
    });

    // When: Controller handles request
    await controller.placeOrder(mockRequest as Request, mockResponse as Response);

    // Then: Delegates to service
    expect(mockService.placeOrder).toHaveBeenCalledWith({
      customerId: 'customer-123',
      items: [{ productId: 'product-1', quantity: 2 }],
    });

    // And: Returns created order
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      orderId: 'order-abc',
      customerId: 'customer-123',
      status: 'confirmed',
      totalItems: 2,
    });
  });
});
```

**What this demonstrates:**

- Mocks collaborator (PlaceOrderService) - tests controller in isolation
- Tests messages sent (method calls)
- Verifies interactions, not implementation
- Clear Given-When-Then structure

### Step 4: Implement Minimum Code

Write just enough to pass the unit test:

```typescript
// src/api/OrderController.ts
export class OrderController {
  constructor(private readonly placeOrderService: PlaceOrderService) {}

  async placeOrder(req: Request, res: Response): Promise<void> {
    const orderRequest = req.body;

    // Validate
    if (!orderRequest.customerId) {
      res.status(400).json({ error: 'Missing customerId' });
      return;
    }

    // Delegate to service
    const order = await this.placeOrderService.placeOrder(orderRequest);

    // Return response
    res.status(201).json(order);
  }
}
```

### Step 5: Continue the Cycle

The unit test now passes, but the acceptance test still fails because `PlaceOrderService` doesn't exist.

Drop down another level and write unit tests for the service:

```typescript
// src/application/PlaceOrderService.spec.ts
describe('PlaceOrderService', () => {
  let service: PlaceOrderService;
  let mockRepository: OrderRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
    } as OrderRepository;

    service = new PlaceOrderService(mockRepository);
  });

  it('creates and saves order', async () => {
    // Given: Order request
    const request = {
      customerId: 'customer-123',
      items: [{ productId: 'product-1', quantity: 2 }],
    };

    vi.mocked(mockRepository.save).mockResolvedValue({
      orderId: 'order-abc',
      customerId: 'customer-123',
      status: 'confirmed',
      items: request.items,
    } as Order);

    // When: Service processes order
    const result = await service.placeOrder(request);

    // Then: Creates and saves order
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer-123',
        status: 'confirmed',
      })
    );

    // And: Returns summary
    expect(result).toEqual({
      orderId: 'order-abc',
      customerId: 'customer-123',
      status: 'confirmed',
      totalItems: 2,
    });
  });
});
```

Implement the service, then continue until the acceptance test passes.

### Step 6: Integrate Upward

Wire everything together:

```typescript
// src/app.ts
export function createApp(): Application {
  const app = express();

  // Setup dependencies
  const repository = new InMemoryOrderRepository();
  const service = new PlaceOrderService(repository);
  const controller = new OrderController(service);

  // Setup routes
  app.post('/api/orders', (req, res) => controller.placeOrder(req, res));

  return app;
}
```

Run the acceptance test - it should pass!

### Step 7: Refactor

With all tests green, improve the design:

- Extract duplicated code
- Improve naming
- Strengthen types
- Add documentation
- Remove dead code

Tests provide safety net for refactoring.

## Mock Roles, Not Objects

**Core principle:** Mock the role (interface) an object needs, not a specific implementation class.

**Good: Mock the Role**

```typescript
// Define the role
export interface PaymentGateway {
  charge(amount: number, token: string): Promise<PaymentResult>;
}

// Test with mock role
describe('PaymentProcessor', () => {
  it('processes payment', async () => {
    const mockGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue({ success: true, transactionId: 'tx-123' }),
    };

    const processor = new PaymentProcessor(mockGateway);
    await processor.processPayment(100, 'token-abc');

    expect(mockGateway.charge).toHaveBeenCalledWith(100, 'token-abc');
  });
});
```

This tests that the processor correctly uses _any_ payment gateway, not a specific one.

**Bad: Mock Concrete Class**

```typescript
// ❌ Tightly coupled to Stripe
describe('PaymentProcessor', () => {
  it('processes payment', async () => {
    const mockStripe = new StripeGateway();
    vi.spyOn(mockStripe, 'charge').mockResolvedValue({ success: true });

    const processor = new PaymentProcessor(mockStripe);
    // Now coupled to Stripe specifically
  });
});
```

## Don't Mock What You Don't Own

Never mock third-party libraries directly. Wrap them in your adapter:

```typescript
// Define your interface
export interface PaymentGateway {
  charge(amount: number, token: string): Promise<string>;
}

// Implement adapter
export class StripePaymentGateway implements PaymentGateway {
  constructor(private readonly stripe: Stripe) {}

  async charge(amount: number, token: string): Promise<string> {
    const charge = await this.stripe.charges.create({
      amount,
      currency: 'usd',
      source: token,
    });
    return charge.id;
  }
}

// Test your service with your interface
describe('PaymentService', () => {
  it('charges card', async () => {
    const mockGateway: PaymentGateway = {
      charge: vi.fn().mockResolvedValue('ch-123'),
    };

    const service = new PaymentService(mockGateway);
    const chargeId = await service.charge(100, 'token-abc');

    expect(chargeId).toBe('ch-123');
  });
});

// Test adapter separately with integration test
describe('StripePaymentGateway Integration', () => {
  it('charges through Stripe', async () => {
    const stripe = new Stripe(process.env.STRIPE_TEST_KEY!);
    const gateway = new StripePaymentGateway(stripe);

    const chargeId = await gateway.charge(100, 'tok_visa');

    expect(chargeId).toMatch(/^ch_/);
  });
});
```

## Listening to Tests

When tests are hard to write, it's feedback about design:

**Sign: Too many dependencies**

```typescript
// Hard to test - too many dependencies
export class OrderService {
  constructor(
    private repo: OrderRepository,
    private payment: PaymentGateway,
    private inventory: InventoryService,
    private email: EmailService,
    private logger: Logger,
    private analytics: Analytics
  ) {} // 6 dependencies!
}
```

**Solution:** Split responsibilities

```typescript
export class OrderService {
  constructor(
    private repo: OrderRepository,
    private orderProcessor: OrderProcessor // Encapsulates other concerns
  ) {}
}
```

**Sign: Long test setup**

```typescript
// Hard to test - long setup
it('creates order', async () => {
  const customer = await createCustomer();
  await createAddress(customer);
  await createPaymentMethod(customer);
  const product1 = await createProduct();
  const product2 = await createProduct();
  await createInventory(product1, 100);
  await createInventory(product2, 50);
  // ... 50 more lines

  const order = await service.createOrder(/* ... */);

  expect(order).toBeDefined();
});
```

**Solution:** Use builders

```typescript
it('creates order', async () => {
  const order = new OrderBuilder()
    .withCustomer('customer-1')
    .withItems([
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ])
    .build();

  await service.createOrder(order);

  expect(order.status).toBe('confirmed');
});
```

**Sign: Mocking concrete classes**

```typescript
// Hard to test - mocking implementation
const mockStripe = new StripeClient();
vi.spyOn(mockStripe, 'charges').mockImplementation(/* ... */);
```

**Solution:** Depend on interfaces

```typescript
interface PaymentGateway {
  charge(amount: number): Promise<string>;
}

const mockGateway: PaymentGateway = {
  charge: vi.fn().mockResolvedValue('txn-123'),
};
```

## Test Layers

GOOS uses three test layers:

### 1. Acceptance Tests

- Test complete features end-to-end
- Written from user perspective
- Use domain language
- Few in number (one per feature)
- Can be slow (seconds)

```typescript
describe('Order Placement Feature', () => {
  it('allows customer to place order', async () => {
    // HTTP request to actual app
    const response = await request(app).post('/api/orders').send(/* ... */);
    expect(response.status).toBe(201);
  });
});
```

### 2. Unit Tests

- Test individual objects in isolation
- Mock collaborators
- Fast (milliseconds)
- Many tests covering edge cases
- Test messages between objects

```typescript
describe('OrderService', () => {
  it('saves order when payment succeeds', async () => {
    mockPayment.process.mockResolvedValue({ success: true });
    await service.placeOrder(/* ... */);
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

### 3. Integration Tests

- Test boundaries with real external systems
- Verify adapters work correctly
- Test database queries, API calls
- Slower than unit tests
- Fewer than unit tests

```typescript
describe('PostgresOrderRepository Integration', () => {
  it('persists orders correctly', async () => {
    const repo = new PostgresOrderRepository(testDatabase);
    await repo.save(order);
    const retrieved = await repo.findById(order.id);
    expect(retrieved).toEqual(order);
  });
});
```

## Benefits of GOOS

1. **Drives design** - Tests reveal objects and collaborations
2. **Clear architecture** - Separates domain logic from infrastructure
3. **Testable code** - Dependencies are explicit and mockable
4. **Living documentation** - Tests describe system behavior
5. **Confidence to refactor** - Tests catch regressions
6. **Outside-in thinking** - Start from user needs, not implementation

## Summary

GOOS in TypeScript means:

1. Start with acceptance test
2. Work outside-in, discovering objects
3. Mock roles (interfaces), not classes
4. Test messages, not state
5. Listen to tests for design feedback
6. Refactor continuously with test safety net
