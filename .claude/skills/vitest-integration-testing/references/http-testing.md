# HTTP Testing Patterns

## Acceptance Testing with Supertest

### Basic Setup

```typescript
// src/test/helpers/app.ts
import { createApp } from '../../app';
import { createTestDatabase } from './database';

export async function createTestApp() {
  const database = await createTestDatabase();
  const app = createApp({ database });

  return {
    app,
    database,
    async cleanup() {
      await database.close();
    },
  };
}
```

### Complete Acceptance Test Example

```typescript
// src/api/orders.acceptance.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test/helpers/app';
import { cleanDatabase } from '../test/helpers/database';

describe('Orders API Acceptance', () => {
  let app: Express.Application;
  let database: Database;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    database = testApp.database;
    cleanup = testApp.cleanup;
  });

  afterAll(async () => {
    await cleanup();
  });

  beforeEach(async () => {
    await cleanDatabase(database);
  });

  describe('POST /api/orders', () => {
    it('creates order and returns confirmation', async () => {
      // Given: Customer and product exist
      await database.insert('customers', {
        id: 'cust-1',
        email: 'john@example.com',
        name: 'John Doe',
      });

      await database.insert('products', {
        id: 'prod-1',
        name: 'Widget',
        price: 29.99,
        stock: 100,
      });

      // When: Placing an order
      const response = await request(app)
        .post('/api/orders')
        .set('Content-Type', 'application/json')
        .send({
          customerId: 'cust-1',
          items: [{ productId: 'prod-1', quantity: 3 }],
        });

      // Then: Returns 201 with order details
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        orderId: expect.stringMatching(/^order-[a-z0-9]+$/),
        customerId: 'cust-1',
        status: 'confirmed',
        items: [
          {
            productId: 'prod-1',
            quantity: 3,
            unitPrice: 29.99,
            subtotal: 89.97,
          },
        ],
        total: 89.97,
      });

      // And: Order persisted correctly
      const savedOrder = await database.findOne('orders', {
        id: response.body.orderId,
      });
      expect(savedOrder).toBeDefined();
      expect(savedOrder.status).toBe('confirmed');
    });

    it('returns 400 for missing customer', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'non-existent',
          items: [{ productId: 'prod-1', quantity: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        error: 'ValidationError',
        message: expect.stringContaining('Customer not found'),
      });
    });

    it('returns 400 for insufficient stock', async () => {
      await database.insert('customers', { id: 'cust-1' });
      await database.insert('products', {
        id: 'prod-1',
        stock: 2,
        price: 10,
      });

      const response = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'cust-1',
          items: [{ productId: 'prod-1', quantity: 10 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('retrieves existing order', async () => {
      // Given: Order exists
      const orderId = 'order-test-123';
      await database.insert('orders', {
        id: orderId,
        customerId: 'cust-1',
        status: 'confirmed',
        total: 50.0,
        createdAt: new Date('2024-01-15'),
      });

      // When: Fetching by ID
      const response = await request(app).get(`/api/orders/${orderId}`).expect(200);

      // Then: Returns order details
      expect(response.body).toMatchObject({
        orderId,
        customerId: 'cust-1',
        status: 'confirmed',
        total: 50.0,
      });
    });

    it('returns 404 for non-existent order', async () => {
      await request(app)
        .get('/api/orders/non-existent')
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBe('NotFound');
        });
    });
  });
});
```

## HTTP Client Integration Testing

### Mock Server Pattern

```typescript
// src/test/helpers/mockServer.ts
import express from 'express';
import type { Server } from 'http';

interface ExpectedRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  response: {
    status: number;
    body: unknown;
    headers?: Record<string, string>;
  };
}

export class MockServer {
  private app = express();
  private server: Server | null = null;
  private expectations: ExpectedRequest[] = [];
  public requests: Array<{
    path: string;
    method: string;
    body: unknown;
    headers: Record<string, string>;
  }> = [];

  constructor(private port: number) {
    this.app.use(express.json());
    this.app.use((req, res) => {
      this.requests.push({
        path: req.path,
        method: req.method,
        body: req.body,
        headers: req.headers as Record<string, string>,
      });

      const expectation = this.expectations.shift();
      if (expectation) {
        if (expectation.response.headers) {
          res.set(expectation.response.headers);
        }
        res.status(expectation.response.status).json(expectation.response.body);
      } else {
        res.status(500).json({ error: 'Unexpected request' });
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, resolve);
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => (err ? reject(err) : resolve()));
      } else {
        resolve();
      }
    });
  }

  expectPost(
    path: string,
    config: { body?: unknown; response: ExpectedRequest['response'] }
  ): void {
    this.expectations.push({ method: 'POST', path, ...config });
  }

  expectGet(path: string, response: ExpectedRequest['response']): void {
    this.expectations.push({ method: 'GET', path, response });
  }

  reset(): void {
    this.expectations = [];
    this.requests = [];
  }
}

export async function createMockServer(port: number): Promise<MockServer> {
  const server = new MockServer(port);
  await server.start();
  return server;
}
```

### HTTP Adapter Integration Test

```typescript
// src/adapters/PaymentGatewayClient.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PaymentGatewayClient } from './PaymentGatewayClient';
import { createMockServer, MockServer } from '../test/helpers/mockServer';

describe('PaymentGatewayClient Integration', () => {
  let client: PaymentGatewayClient;
  let mockServer: MockServer;

  beforeAll(async () => {
    mockServer = await createMockServer(3099);
    client = new PaymentGatewayClient({
      baseUrl: 'http://localhost:3099',
      apiKey: 'test-api-key',
      timeout: 5000,
    });
  });

  afterAll(async () => {
    await mockServer.close();
  });

  beforeEach(() => {
    mockServer.reset();
  });

  describe('charge', () => {
    it('sends correct request format', async () => {
      mockServer.expectPost('/v1/charges', {
        response: {
          status: 200,
          body: { id: 'ch_123', status: 'succeeded', amount: 5000 },
        },
      });

      await client.charge({
        amount: 5000,
        currency: 'usd',
        source: 'tok_visa',
        description: 'Test charge',
      });

      expect(mockServer.requests).toHaveLength(1);
      expect(mockServer.requests[0]).toMatchObject({
        method: 'POST',
        path: '/v1/charges',
        body: {
          amount: 5000,
          currency: 'usd',
          source: 'tok_visa',
          description: 'Test charge',
        },
      });
      expect(mockServer.requests[0].headers['authorization']).toBe('Bearer test-api-key');
    });

    it('returns success result on 200', async () => {
      mockServer.expectPost('/v1/charges', {
        response: {
          status: 200,
          body: { id: 'ch_abc123', status: 'succeeded', amount: 2500 },
        },
      });

      const result = await client.charge({ amount: 2500, currency: 'usd', source: 'tok_visa' });

      expect(result).toEqual({
        success: true,
        transactionId: 'ch_abc123',
        amount: 2500,
      });
    });

    it('returns failure for declined card', async () => {
      mockServer.expectPost('/v1/charges', {
        response: {
          status: 402,
          body: {
            error: {
              type: 'card_error',
              code: 'card_declined',
              message: 'Your card was declined.',
            },
          },
        },
      });

      const result = await client.charge({ amount: 5000, currency: 'usd', source: 'tok_declined' });

      expect(result).toEqual({
        success: false,
        error: 'Your card was declined.',
        code: 'card_declined',
      });
    });

    it('handles network timeout', async () => {
      // Don't set up any expectation - request will timeout
      const timeoutClient = new PaymentGatewayClient({
        baseUrl: 'http://localhost:9999', // Non-existent server
        apiKey: 'test',
        timeout: 100,
      });

      const result = await timeoutClient.charge({
        amount: 1000,
        currency: 'usd',
        source: 'tok_visa',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('refund', () => {
    it('creates refund for existing charge', async () => {
      mockServer.expectPost('/v1/refunds', {
        response: {
          status: 200,
          body: { id: 'ref_123', charge: 'ch_original', amount: 1000, status: 'succeeded' },
        },
      });

      const result = await client.refund({ chargeId: 'ch_original', amount: 1000 });

      expect(result).toEqual({
        success: true,
        refundId: 'ref_123',
        amount: 1000,
      });
    });
  });
});
```

## Testing with nock (Alternative)

```typescript
import nock from 'nock';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ExternalApiClient with nock', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('fetches user data', async () => {
    nock('https://api.example.com')
      .get('/users/123')
      .reply(200, { id: '123', name: 'John Doe', email: 'john@example.com' });

    const client = new ExternalApiClient({ baseUrl: 'https://api.example.com' });
    const user = await client.getUser('123');

    expect(user).toEqual({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('handles rate limiting', async () => {
    nock('https://api.example.com')
      .get('/users/123')
      .reply(429, { error: 'Rate limit exceeded' }, { 'Retry-After': '60' });

    const client = new ExternalApiClient({ baseUrl: 'https://api.example.com' });

    await expect(client.getUser('123')).rejects.toThrow('Rate limit exceeded');
  });
});
```

## Authentication in Acceptance Tests

```typescript
// src/test/helpers/auth.ts
import jwt from 'jsonwebtoken';

export function createTestToken(userId: string, roles: string[] = ['user']): string {
  return jwt.sign({ sub: userId, roles }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  });
}

export function authenticatedRequest(app: Express.Application, userId: string) {
  const token = createTestToken(userId);

  return {
    get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

// Usage
describe('Protected endpoints', () => {
  it('allows authenticated user to access orders', async () => {
    const auth = authenticatedRequest(app, 'user-123');

    const response = await auth.get('/api/orders').expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });

  it('rejects unauthenticated requests', async () => {
    await request(app).get('/api/orders').expect(401);
  });
});
```

## Testing File Uploads

```typescript
describe('File upload acceptance', () => {
  it('uploads profile picture', async () => {
    const auth = authenticatedRequest(app, 'user-123');

    const response = await auth
      .post('/api/users/profile-picture')
      .attach('file', Buffer.from('fake-image-data'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      url: expect.stringContaining('avatar'),
      size: expect.any(Number),
    });
  });

  it('rejects oversized files', async () => {
    const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB

    await request(app)
      .post('/api/users/profile-picture')
      .attach('file', largeBuffer, 'large.png')
      .expect(413);
  });
});
```

## Testing WebSocket Endpoints

```typescript
import { WebSocket } from 'ws';

describe('WebSocket acceptance', () => {
  let wsClient: WebSocket;

  afterEach(() => {
    if (wsClient) {
      wsClient.close();
    }
  });

  it('receives real-time order updates', async () => {
    // Given: Connected to WebSocket
    wsClient = new WebSocket(`ws://localhost:${port}/ws/orders`);

    const messages: unknown[] = [];
    wsClient.on('message', (data) => {
      messages.push(JSON.parse(data.toString()));
    });

    await new Promise((resolve) => wsClient.on('open', resolve));

    // When: Order is created via HTTP
    await request(app).post('/api/orders').send({ customerId: 'cust-1', items: [] }).expect(201);

    // Then: WebSocket receives notification
    await vi.waitFor(() => {
      expect(messages).toContainEqual(
        expect.objectContaining({
          type: 'ORDER_CREATED',
          payload: expect.objectContaining({ customerId: 'cust-1' }),
        })
      );
    });
  });
});
```

## Testing GraphQL Endpoints

```typescript
describe('GraphQL acceptance', () => {
  const query = `
    query GetOrder($id: ID!) {
      order(id: $id) {
        id
        status
        items {
          productId
          quantity
        }
      }
    }
  `;

  it('fetches order by ID', async () => {
    // Given: Order exists
    await database.insert('orders', { id: 'order-1', status: 'confirmed' });
    await database.insert('order_items', [
      { orderId: 'order-1', productId: 'prod-1', quantity: 2 },
    ]);

    // When: GraphQL query
    const response = await request(app)
      .post('/graphql')
      .send({
        query,
        variables: { id: 'order-1' },
      })
      .expect(200);

    // Then: Returns order data
    expect(response.body.data.order).toEqual({
      id: 'order-1',
      status: 'confirmed',
      items: [{ productId: 'prod-1', quantity: 2 }],
    });
  });

  it('returns null for non-existent order', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query,
        variables: { id: 'non-existent' },
      })
      .expect(200);

    expect(response.body.data.order).toBeNull();
  });
});
```

## Response Matchers

```typescript
// src/test/helpers/matchers.ts
import { expect } from 'vitest';

expect.extend({
  toBeValidApiResponse(received: Response) {
    const hasContentType = received.headers['content-type']?.includes('application/json');
    const hasRequestId = !!received.headers['x-request-id'];

    if (!hasContentType || !hasRequestId) {
      return {
        pass: false,
        message: () => `Expected valid API response with JSON content-type and request ID`,
      };
    }

    return { pass: true, message: () => '' };
  },

  toBePagedResponse(received: unknown) {
    const isValid =
      typeof received === 'object' &&
      received !== null &&
      'data' in received &&
      'pagination' in received &&
      Array.isArray((received as any).data);

    return {
      pass: isValid,
      message: () => `Expected paged response with data array and pagination`,
    };
  },
});

// Usage
it('returns paged results', async () => {
  const response = await request(app).get('/api/orders').expect(200);

  expect(response).toBeValidApiResponse();
  expect(response.body).toBePagedResponse();
});
```
