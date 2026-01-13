# Complete TypeScript Testing Examples

Full test suites demonstrating GOOS and TDD principles.

## Example 1: Order Domain Model

Complete implementation with comprehensive tests.

### Order Implementation

```typescript
// src/domain/Order.ts
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export class Order {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    private readonly orderItems: OrderItem[],
    private orderStatus: OrderStatus = 'pending',
    private trackingNum?: string,
    private shippedDate?: Date
  ) {}

  get status(): OrderStatus {
    return this.orderStatus;
  }

  get items(): OrderItem[] {
    return [...this.orderItems];
  }

  get trackingNumber(): string | undefined {
    return this.trackingNum;
  }

  get shippedAt(): Date | undefined {
    return this.shippedDate;
  }

  calculateTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  confirm(): { success: boolean; error?: string } {
    if (this.orderStatus === 'confirmed') {
      return { success: false, error: 'Order already confirmed' };
    }

    if (this.orderStatus !== 'pending') {
      return { success: false, error: `Cannot confirm ${this.orderStatus} order` };
    }

    this.orderStatus = 'confirmed';
    return { success: true };
  }

  ship(trackingNumber: string): { success: boolean; error?: string } {
    if (!trackingNumber) {
      throw new Error('Tracking number required');
    }

    if (this.orderStatus !== 'confirmed') {
      return { success: false, error: 'Order must be confirmed before shipping' };
    }

    this.orderStatus = 'shipped';
    this.trackingNum = trackingNumber;
    this.shippedDate = new Date();
    return { success: true };
  }

  deliver(): { success: boolean; error?: string } {
    if (this.orderStatus !== 'shipped') {
      return { success: false, error: 'Order must be shipped before delivery' };
    }

    this.orderStatus = 'delivered';
    return { success: true };
  }

  cancel(): { success: boolean; error?: string } {
    if (this.orderStatus === 'shipped' || this.orderStatus === 'delivered') {
      return { success: false, error: 'Cannot cancel order after shipping' };
    }

    if (this.orderStatus === 'canceled') {
      return { success: false, error: 'Order already canceled' };
    }

    this.orderStatus = 'canceled';
    return { success: true };
  }
}
```

### Order Test Suite

```typescript
// src/domain/Order.spec.ts
import { describe, it, expect } from 'vitest';
import { Order } from './Order';
import { OrderBuilder } from '../test/builders/OrderBuilder';

describe('Order', () => {
  describe('calculateTotal', () => {
    it('returns zero for empty order', () => {
      const order = new OrderBuilder().withItems([]).build();
      expect(order.calculateTotal()).toBe(0);
    });

    it('calculates total for single item', () => {
      const order = new OrderBuilder()
        .withItems([{ productId: 'p1', quantity: 2, price: 10 }])
        .build();

      expect(order.calculateTotal()).toBe(20);
    });

    it('calculates total for multiple items', () => {
      const order = new OrderBuilder()
        .withItems([
          { productId: 'p1', quantity: 2, price: 10 },
          { productId: 'p2', quantity: 1, price: 20 },
        ])
        .build();

      expect(order.calculateTotal()).toBe(40);
    });
  });

  describe('confirm', () => {
    it('transitions from pending to confirmed', () => {
      const order = new OrderBuilder().withStatus('pending').build();

      const result = order.confirm();

      expect(result.success).toBe(true);
      expect(order.status).toBe('confirmed');
    });

    it('fails when already confirmed', () => {
      const order = new OrderBuilder().withStatus('confirmed').build();

      const result = order.confirm();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order already confirmed');
      expect(order.status).toBe('confirmed');
    });

    it('fails when order is shipped', () => {
      const order = new OrderBuilder().withStatus('shipped').build();

      const result = order.confirm();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot confirm');
    });

    it('fails when order is canceled', () => {
      const order = new OrderBuilder().withStatus('canceled').build();

      const result = order.confirm();

      expect(result.success).toBe(false);
      expect(order.status).toBe('canceled');
    });
  });

  describe('ship', () => {
    it('transitions from confirmed to shipped', () => {
      const order = new OrderBuilder().withStatus('confirmed').build();

      const result = order.ship('TRACK123');

      expect(result.success).toBe(true);
      expect(order.status).toBe('shipped');
      expect(order.trackingNumber).toBe('TRACK123');
      expect(order.shippedAt).toBeInstanceOf(Date);
    });

    it('requires tracking number', () => {
      const order = new OrderBuilder().withStatus('confirmed').build();

      expect(() => order.ship('')).toThrow('Tracking number required');
    });

    it('fails when order not confirmed', () => {
      const order = new OrderBuilder().withStatus('pending').build();

      const result = order.ship('TRACK123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order must be confirmed before shipping');
      expect(order.status).toBe('pending');
    });

    it('fails when order already shipped', () => {
      const order = new OrderBuilder().withStatus('shipped').build();

      const result = order.ship('TRACK456');

      expect(result.success).toBe(false);
      expect(order.status).toBe('shipped');
    });
  });

  describe('deliver', () => {
    it('transitions from shipped to delivered', () => {
      const order = new OrderBuilder().withStatus('shipped').build();

      const result = order.deliver();

      expect(result.success).toBe(true);
      expect(order.status).toBe('delivered');
    });

    it('fails when not shipped', () => {
      const order = new OrderBuilder().withStatus('confirmed').build();

      const result = order.deliver();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order must be shipped before delivery');
    });
  });

  describe('cancel', () => {
    it('can cancel pending order', () => {
      const order = new OrderBuilder().withStatus('pending').build();

      const result = order.cancel();

      expect(result.success).toBe(true);
      expect(order.status).toBe('canceled');
    });

    it('can cancel confirmed order', () => {
      const order = new OrderBuilder().withStatus('confirmed').build();

      const result = order.cancel();

      expect(result.success).toBe(true);
      expect(order.status).toBe('canceled');
    });

    it('cannot cancel shipped order', () => {
      const order = new OrderBuilder().withStatus('shipped').build();

      const result = order.cancel();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel order after shipping');
      expect(order.status).toBe('shipped');
    });

    it('cannot cancel delivered order', () => {
      const order = new OrderBuilder().withStatus('delivered').build();

      const result = order.cancel();

      expect(result.success).toBe(false);
      expect(order.status).toBe('delivered');
    });

    it('fails when already canceled', () => {
      const order = new OrderBuilder().withStatus('canceled').build();

      const result = order.cancel();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Order already canceled');
    });
  });
});
```

### OrderBuilder Test Helper

```typescript
// src/test/builders/OrderBuilder.ts
import { Order, type OrderItem, type OrderStatus } from '../../domain/Order';

export class OrderBuilder {
  private orderId = 'test-order-123';
  private customerId = 'test-customer';
  private orderItems: OrderItem[] = [{ productId: 'product-1', quantity: 1, price: 10 }];
  private orderStatus: OrderStatus = 'pending';

  withId(orderId: string): this {
    this.orderId = orderId;
    return this;
  }

  withCustomerId(customerId: string): this {
    this.customerId = customerId;
    return this;
  }

  withItems(items: OrderItem[]): this {
    this.orderItems = items;
    return this;
  }

  withStatus(status: OrderStatus): this {
    this.orderStatus = status;
    return this;
  }

  build(): Order {
    const order = new Order(this.orderId, this.customerId, this.orderItems, 'pending');

    // Apply state transitions to reach desired status
    if (this.orderStatus === 'confirmed') {
      order.confirm();
    } else if (this.orderStatus === 'shipped') {
      order.confirm();
      order.ship('TEST-TRACKING');
    } else if (this.orderStatus === 'delivered') {
      order.confirm();
      order.ship('TEST-TRACKING');
      order.deliver();
    } else if (this.orderStatus === 'canceled') {
      order.cancel();
    }

    return order;
  }
}
```

## Example 2: Service with Dependencies

Complete service implementation with mocked collaborators.

### Service Implementation

```typescript
// src/application/PlaceOrderService.ts
export interface PlaceOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface PlaceOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface OrderRepository {
  save(order: Order): Promise<void>;
}

export interface InventoryService {
  checkAvailability(items: Array<{ productId: string; quantity: number }>): Promise<{
    available: boolean;
    unavailableItems: string[];
  }>;
  reserveItems(items: Array<{ productId: string; quantity: number }>): Promise<void>;
}

export interface PaymentService {
  processPayment(params: { customerId: string; amount: number }): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }>;
}

export class PlaceOrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService
  ) {}

  async execute(request: PlaceOrderRequest): Promise<PlaceOrderResult> {
    // Check inventory
    const inventoryCheck = await this.inventoryService.checkAvailability(request.items);

    if (!inventoryCheck.available) {
      return {
        success: false,
        error: `Insufficient stock: ${inventoryCheck.unavailableItems.join(', ')}`,
      };
    }

    // Calculate total
    const total = request.items.reduce((sum, item) => sum + item.quantity * 10, 0);

    // Process payment
    const payment = await this.paymentService.processPayment({
      customerId: request.customerId,
      amount: total,
    });

    if (!payment.success) {
      return {
        success: false,
        error: payment.error || 'Payment failed',
      };
    }

    // Create and save order
    const order = new Order(
      `order-${Date.now()}`,
      request.customerId,
      request.items.map((item) => ({ ...item, price: 10 }))
    );

    order.confirm();
    await this.orderRepository.save(order);

    // Reserve inventory
    await this.inventoryService.reserveItems(request.items);

    return {
      success: true,
      orderId: order.orderId,
    };
  }
}
```

### Service Test Suite

```typescript
// src/application/PlaceOrderService.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceOrderService } from './PlaceOrderService';
import type { OrderRepository, InventoryService, PaymentService } from './PlaceOrderService';

describe('PlaceOrderService', () => {
  let service: PlaceOrderService;
  let mockOrderRepository: OrderRepository;
  let mockInventoryService: InventoryService;
  let mockPaymentService: PaymentService;

  beforeEach(() => {
    mockOrderRepository = {
      save: vi.fn(),
    };

    mockInventoryService = {
      checkAvailability: vi.fn(),
      reserveItems: vi.fn(),
    };

    mockPaymentService = {
      processPayment: vi.fn(),
    };

    service = new PlaceOrderService(mockOrderRepository, mockInventoryService, mockPaymentService);
  });

  describe('when all conditions are met', () => {
    beforeEach(() => {
      vi.mocked(mockInventoryService.checkAvailability).mockResolvedValue({
        available: true,
        unavailableItems: [],
      });

      vi.mocked(mockPaymentService.processPayment).mockResolvedValue({
        success: true,
        transactionId: 'txn-123',
      });
    });

    it('places order successfully', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      const result = await service.execute(request);

      expect(result.success).toBe(true);
      expect(result.orderId).toBeDefined();
    });

    it('checks inventory availability', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockInventoryService.checkAvailability).toHaveBeenCalledWith([
        { productId: 'product-1', quantity: 2 },
      ]);
    });

    it('processes payment', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockPaymentService.processPayment).toHaveBeenCalledWith({
        customerId: 'customer-1',
        amount: 20,
      });
    });

    it('saves order', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer-1',
          status: 'confirmed',
        })
      );
    });

    it('reserves inventory', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockInventoryService.reserveItems).toHaveBeenCalledWith([
        { productId: 'product-1', quantity: 2 },
      ]);
    });
  });

  describe('when inventory is unavailable', () => {
    beforeEach(() => {
      vi.mocked(mockInventoryService.checkAvailability).mockResolvedValue({
        available: false,
        unavailableItems: ['product-1'],
      });
    });

    it('fails with inventory error', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      const result = await service.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient stock');
    });

    it('does not process payment', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockPaymentService.processPayment).not.toHaveBeenCalled();
    });

    it('does not save order', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when payment fails', () => {
    beforeEach(() => {
      vi.mocked(mockInventoryService.checkAvailability).mockResolvedValue({
        available: true,
        unavailableItems: [],
      });

      vi.mocked(mockPaymentService.processPayment).mockResolvedValue({
        success: false,
        error: 'Card declined',
      });
    });

    it('fails with payment error', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      const result = await service.execute(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Card declined');
    });

    it('does not save order', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockOrderRepository.save).not.toHaveBeenCalled();
    });

    it('does not reserve inventory', async () => {
      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'product-1', quantity: 2 }],
      };

      await service.execute(request);

      expect(mockInventoryService.reserveItems).not.toHaveBeenCalled();
    });
  });
});
```

## Example 3: Type-Safe Mock Helpers

Reusable mock factories for consistency.

```typescript
// src/test/mocks.ts
import type { OrderRepository, InventoryService, PaymentService } from '../application/types';
import { vi } from 'vitest';

export function createMockOrderRepository(overrides?: Partial<OrderRepository>): OrderRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findByCustomerId: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

export function createMockInventoryService(
  overrides?: Partial<InventoryService>
): InventoryService {
  return {
    checkAvailability: vi.fn().mockResolvedValue({
      available: true,
      unavailableItems: [],
    }),
    reserveItems: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function createMockPaymentService(overrides?: Partial<PaymentService>): PaymentService {
  return {
    processPayment: vi.fn().mockResolvedValue({
      success: true,
      transactionId: 'txn-default',
    }),
    ...overrides,
  };
}

// Usage in tests
describe('PlaceOrderService', () => {
  it('handles payment failure', async () => {
    const mockPayment = createMockPaymentService({
      processPayment: vi.fn().mockResolvedValue({
        success: false,
        error: 'Declined',
      }),
    });

    const service = new PlaceOrderService(
      createMockOrderRepository(),
      createMockInventoryService(),
      mockPayment
    );

    const result = await service.execute(orderRequest);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Declined');
  });
});
```

These examples demonstrate:

- Complete TDD workflow
- State machine testing
- Service coordination with mocks
- Builder pattern for test data
- Type-safe mock helpers
- Proper test organization
- Given-When-Then structure
- Isolated, focused tests
