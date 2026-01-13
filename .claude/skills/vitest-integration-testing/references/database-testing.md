# Database Integration Testing Patterns

## Transaction Rollback Pattern

Ensures test isolation by wrapping each test in a transaction that gets rolled back:

```typescript
// src/test/helpers/database.ts
import { beforeEach, afterEach } from 'vitest';

export function useTransactionRollback(getConnection: () => Connection) {
  let transaction: Transaction;

  beforeEach(async () => {
    const connection = getConnection();
    transaction = await connection.beginTransaction();
  });

  afterEach(async () => {
    await transaction.rollback();
  });

  return () => transaction;
}

// Usage in tests
describe('OrderRepository', () => {
  const getTransaction = useTransactionRollback(() => database.connection);

  it('saves order', async () => {
    const repo = new OrderRepository(getTransaction());
    await repo.save(order);
    // Transaction rolls back automatically - no cleanup needed
  });
});
```

## Test Database Setup

### Docker Compose for Test DB

```yaml
# docker-compose.test.yml
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: test_db
    ports:
      - '5433:5432'
    tmpfs:
      - /var/lib/postgresql/data # RAM disk for speed
```

### Programmatic Test Database

```typescript
// src/test/helpers/database.ts
import { Pool } from 'pg';

let testPool: Pool | null = null;

export async function createTestDatabase(): Promise<Database> {
  if (!testPool) {
    testPool = new Pool({
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5433'),
      user: 'test',
      password: 'test',
      database: 'test_db',
      max: 10,
    });
  }
  return new Database(testPool);
}

export async function cleanDatabase(db: Database): Promise<void> {
  // Truncate all tables in dependency order
  await db.query(`
    TRUNCATE TABLE order_items, orders, products, customers 
    RESTART IDENTITY CASCADE
  `);
}

export async function closeTestDatabase(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}
```

## Prisma Integration Testing

```typescript
// src/test/helpers/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanPrismaDatabase(): Promise<void> {
  const tablenames = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
}

// Usage
describe('UserRepository Integration', () => {
  beforeEach(async () => {
    await cleanPrismaDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates user with profile', async () => {
    const repo = new PrismaUserRepository(prisma);

    const user = await repo.create({
      email: 'test@example.com',
      profile: { name: 'Test User' },
    });

    expect(user.id).toBeDefined();
    expect(user.profile.name).toBe('Test User');
  });
});
```

## TypeORM Integration Testing

```typescript
// src/test/helpers/typeorm.ts
import { DataSource } from 'typeorm';
import { Order, Customer, Product } from '../entities';

let dataSource: DataSource | null = null;

export async function getTestDataSource(): Promise<DataSource> {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'test',
      password: 'test',
      database: 'test_db',
      entities: [Order, Customer, Product],
      synchronize: true, // Only for tests!
      dropSchema: true, // Fresh schema each run
    });
    await dataSource.initialize();
  }
  return dataSource;
}

export async function cleanTypeOrmDatabase(ds: DataSource): Promise<void> {
  const entities = ds.entityMetadatas;
  for (const entity of entities) {
    const repository = ds.getRepository(entity.name);
    await repository.clear();
  }
}
```

## Drizzle Integration Testing

```typescript
// src/test/helpers/drizzle.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '../db/schema';

export async function createTestDrizzle() {
  const pool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  // Run migrations
  await migrate(db, { migrationsFolder: './drizzle' });

  return { db, pool };
}

export async function cleanDrizzleDatabase(db: ReturnType<typeof drizzle>) {
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.products);
  await db.delete(schema.customers);
}
```

## Testing Complex Queries

```typescript
describe('OrderRepository complex queries', () => {
  beforeEach(async () => {
    // Seed test data
    await database.insert('customers', [
      { id: 'cust-1', name: 'Alice', tier: 'gold' },
      { id: 'cust-2', name: 'Bob', tier: 'silver' },
    ]);

    await database.insert('orders', [
      { id: 'order-1', customerId: 'cust-1', total: 100, createdAt: '2024-01-15' },
      { id: 'order-2', customerId: 'cust-1', total: 200, createdAt: '2024-01-20' },
      { id: 'order-3', customerId: 'cust-2', total: 50, createdAt: '2024-01-18' },
    ]);
  });

  it('finds orders by date range', async () => {
    const orders = await repository.findByDateRange(new Date('2024-01-16'), new Date('2024-01-19'));

    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe('order-3');
  });

  it('calculates customer totals', async () => {
    const totals = await repository.getCustomerTotals();

    expect(totals).toEqual([
      { customerId: 'cust-1', total: 300 },
      { customerId: 'cust-2', total: 50 },
    ]);
  });

  it('finds top customers by spend', async () => {
    const top = await repository.findTopCustomers(1);

    expect(top).toHaveLength(1);
    expect(top[0].customerId).toBe('cust-1');
  });
});
```

## Testing Transactions

```typescript
describe('OrderService transactions', () => {
  it('rolls back on payment failure', async () => {
    // Given
    const customer = await createTestCustomer(database);
    const product = await createTestProduct(database, { stock: 10 });

    mockPaymentGateway.charge.mockRejectedValue(new Error('Payment failed'));

    // When
    await expect(
      orderService.placeOrder({
        customerId: customer.id,
        items: [{ productId: product.id, quantity: 5 }],
      })
    ).rejects.toThrow('Payment failed');

    // Then: Stock should NOT be decremented (rolled back)
    const updatedProduct = await database.findOne('products', { id: product.id });
    expect(updatedProduct.stock).toBe(10);

    // And: No order should exist
    const orders = await database.find('orders', { customerId: customer.id });
    expect(orders).toHaveLength(0);
  });
});
```

## Parallel Test Safety

```typescript
// Use unique identifiers per test to avoid collisions
function uniqueId(prefix: string): string {
  return `${prefix}-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

describe('OrderRepository parallel-safe', () => {
  it('test A creates unique order', async () => {
    const orderId = uniqueId('order');
    await repository.save(Order.create({ orderId, customerId: 'cust-1' }));

    const found = await repository.findById(orderId);
    expect(found).toBeDefined();
  });

  it('test B creates different unique order', async () => {
    const orderId = uniqueId('order');
    await repository.save(Order.create({ orderId, customerId: 'cust-2' }));

    const found = await repository.findById(orderId);
    expect(found).toBeDefined();
  });
});
```

## In-Memory Database Alternative

For faster tests when real DB behavior isn't critical:

```typescript
// src/test/helpers/inMemoryDb.ts
export class InMemoryDatabase implements Database {
  private tables = new Map<string, Map<string, unknown>>();

  async insert(table: string, data: Record<string, unknown>): Promise<void> {
    if (!this.tables.has(table)) {
      this.tables.set(table, new Map());
    }
    const id = data.id as string;
    this.tables.get(table)!.set(id, { ...data });
  }

  async findOne(table: string, query: Record<string, unknown>): Promise<unknown | null> {
    const tableData = this.tables.get(table);
    if (!tableData) return null;

    for (const record of tableData.values()) {
      if (this.matches(record as Record<string, unknown>, query)) {
        return record;
      }
    }
    return null;
  }

  async clear(): Promise<void> {
    this.tables.clear();
  }

  private matches(record: Record<string, unknown>, query: Record<string, unknown>): boolean {
    return Object.entries(query).every(([key, value]) => record[key] === value);
  }
}
```

## Migration Testing

```typescript
describe('Database Migrations', () => {
  it('applies all migrations successfully', async () => {
    const freshDb = await createEmptyDatabase();

    await expect(freshDb.runMigrations()).resolves.not.toThrow();

    // Verify expected tables exist
    const tables = await freshDb.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `);

    expect(tables.map((t) => t.tablename)).toContain('orders');
    expect(tables.map((t) => t.tablename)).toContain('customers');
  });

  it('migrations are idempotent', async () => {
    const db = await createTestDatabase();

    // Run migrations twice
    await db.runMigrations();
    await expect(db.runMigrations()).resolves.not.toThrow();
  });
});
```
