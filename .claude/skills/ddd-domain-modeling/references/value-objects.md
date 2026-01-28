# Value Objects

Value objects are immutable, defined by their attributes, and have no identity.

## Table of Contents

- [Characteristics](#characteristics)
- [Patterns](#patterns)
- [Common Value Objects](#common-value-objects)
- [Equality and Comparison](#equality-and-comparison)
- [Testing Value Objects](#testing-value-objects)

## Characteristics

| Characteristic   | Description                                        |
| ---------------- | -------------------------------------------------- |
| Immutable        | State never changes after creation                 |
| No identity      | Two instances with same values are interchangeable |
| Self-validating  | Constructor rejects invalid values                 |
| Side-effect free | Methods return new instances                       |

## Patterns

### Basic Value Object

```typescript
export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Email {
    const normalized = value.toLowerCase().trim();
    if (!Email.isValid(normalized)) {
      throw new Error('Invalid email format');
    }
    return new Email(normalized);
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
```

### Enum-Style Value Object

```typescript
export class TaskStatus {
  private static readonly PENDING = new TaskStatus('pending');
  private static readonly IN_PROGRESS = new TaskStatus('in_progress');
  private static readonly COMPLETED = new TaskStatus('completed');

  private constructor(private readonly _value: string) {}

  static pending(): TaskStatus {
    return TaskStatus.PENDING;
  }
  static inProgress(): TaskStatus {
    return TaskStatus.IN_PROGRESS;
  }
  static completed(): TaskStatus {
    return TaskStatus.COMPLETED;
  }

  static fromString(value: string): TaskStatus {
    switch (value) {
      case 'pending':
        return TaskStatus.PENDING;
      case 'in_progress':
        return TaskStatus.IN_PROGRESS;
      case 'completed':
        return TaskStatus.COMPLETED;
      default:
        throw new Error(`Invalid status: ${value}`);
    }
  }

  get value(): string {
    return this._value;
  }
  get isPending(): boolean {
    return this === TaskStatus.PENDING;
  }
  get isCompleted(): boolean {
    return this === TaskStatus.COMPLETED;
  }

  canTransitionTo(target: TaskStatus): boolean {
    if (this === TaskStatus.PENDING) {
      return target === TaskStatus.IN_PROGRESS;
    }
    if (this === TaskStatus.IN_PROGRESS) {
      return target === TaskStatus.COMPLETED || target === TaskStatus.PENDING;
    }
    return false; // Completed is terminal
  }
}
```

### Composite Value Object

```typescript
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static of(amount: number, currency: string): Money {
    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be a finite number');
    }
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error('Currency must be 3-letter ISO code');
    }
    // Round to 2 decimal places
    return new Money(Math.round(amount * 100) / 100, currency);
  }

  static zero(currency: string): Money {
    return Money.of(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    if (other.amount > this.amount) {
      throw new Error('Cannot subtract: would result in negative amount');
    }
    return Money.of(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) throw new Error('Factor cannot be negative');
    return Money.of(this.amount * factor, this.currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
```

## Common Value Objects

### ID Value Object

```typescript
export class TaskId {
  private constructor(public readonly value: string) {}

  static create(): TaskId {
    return new TaskId(crypto.randomUUID());
  }

  static from(value: string): TaskId {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskId cannot be empty');
    }
    return new TaskId(value);
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}
```

### Date Range Value Object

```typescript
export class DateRange {
  private constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {}

  static create(start: Date, end: Date): DateRange {
    if (end < start) {
      throw new Error('End date must be after start date');
    }
    return new DateRange(start, end);
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  get durationInDays(): number {
    return Math.ceil((this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
```

### Address Value Object

```typescript
export class Address {
  private constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly postalCode: string,
    public readonly country: string
  ) {}

  static create(props: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }): Address {
    if (!props.street?.trim()) throw new Error('Street is required');
    if (!props.city?.trim()) throw new Error('City is required');
    if (!props.postalCode?.trim()) throw new Error('Postal code is required');
    if (!props.country?.trim()) throw new Error('Country is required');

    return new Address(
      props.street.trim(),
      props.city.trim(),
      props.postalCode.trim().toUpperCase(),
      props.country.trim()
    );
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.postalCode === other.postalCode &&
      this.country === other.country
    );
  }

  format(): string {
    return `${this.street}, ${this.city}, ${this.postalCode}, ${this.country}`;
  }
}
```

### Migration Table: Primitives → Value Objects

When refactoring existing code, identify primitives that should be value objects:

| Primitive Type       | Current Usage           | Value Object    | Validation                                          | Why Migrate                                                     |
| -------------------- | ----------------------- | --------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| `string`             | User ID / Task ID       | `UserId`        | UUID format, not empty                              | Type safety, prevents mixing IDs from different aggregates      |
| `string`             | Email address           | `Email`         | Email format, normalized (lowercase, trimmed)       | Consistent validation, normalization, domain queries            |
| `number`             | Money amount            | `Money`         | Non-negative, 2 decimal places, currency required   | Currency safety, arithmetic operations, display formatting      |
| `number`             | Percentage              | `Percentage`    | 0-100 range (or 0-1)                                | Range validation, consistent representation                     |
| `string`             | Phone number            | `PhoneNumber`   | Format validation, international format             | Consistent formatting, validation, comparison                   |
| `string`             | URL                     | `Url`           | Valid URL format, protocol required                 | Type safety, validation, manipulation methods                   |
| `string`             | Postal code             | `PostalCode`    | Format by country, normalized (uppercase)           | Country-specific validation, normalization                      |
| `number`             | Quantity                | `Quantity`      | Positive integer, unit of measure                   | Unit safety, arithmetic with units                              |
| `string`             | Color code              | `Color`         | Hex format (#RRGGBB), named colors                  | Validation, conversion to RGB/HSL                               |
| `Date`               | Date range              | `DateRange`     | Start before end, no overlap validation             | Domain logic encapsulation, range operations                    |
| `string`             | Timestamps (stored)     | **Keep string** | UTC ISO 8601 format                                 | Portable datetime, no Date object in domain (see below)         |
| `string[]` / `Set`   | Tags, categories        | `Tags`          | Unique, lowercase, no empty strings                 | Deduplication, normalization, domain operations                 |
| `object` (lat, long) | Geographic coordinates  | `Coordinates`   | Valid latitude (-90 to 90), longitude (-180 to 180) | Validation, distance calculations, boundary checks              |
| `string`             | Enum-like (status, etc) | Domain enum     | Allowlist of valid values                           | Type safety, exhaustive switch checks, state machine validation |

### When NOT to Create Value Objects

**DON'T create value objects for:**

- Simple labels or display text (e.g., `firstName`, `description`)
- Intermediate calculation results
- Framework/library types (e.g., `Date` for timestamps - use string instead)
- Data that has no invariants or business rules

**Example - Keep as primitives:**

```typescript
// ✅ CORRECT - Simple text, no business rules
interface TaskProps {
  title: string; // Just a label
  description: string; // Free text
}

// ❌ WRONG - Unnecessary value object
class Title {
  // Overkill for simple text
  constructor(private value: string) {}
}
```

### Refactoring Strategy

**Step 1: Identify primitives with business rules**

```typescript
// Before (primitive obsession)
interface User {
  id: string; // ❌ What kind of ID?
  email: string; // ❌ Is it validated?
  balance: number; // ❌ What currency?
}
```

**Step 2: Create value objects**

```typescript
// UserId value object
export class UserId {
  private constructor(private readonly value: string) {}

  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  static fromString(value: string): UserId {
    if (!this.isValidUUID(value)) {
      throw new ValidationError('Invalid UUID format');
    }
    return new UserId(value);
  }

  private static isValidUUID(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

// Email value object
export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.toLowerCase().trim();
    if (!this.isValid(normalized)) {
      throw new ValidationError('Invalid email format');
    }
    return new Email(normalized);
  }

  private static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Money value object
export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}

  static of(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new ValidationError('Amount cannot be negative');
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new ValidationError('Currency must be 3-letter ISO code');
    }
    // Round to 2 decimal places for currency
    const rounded = Math.round(amount * 100) / 100;
    return new Money(rounded, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new ValidationError('Cannot add different currencies');
    }
    return Money.of(this.amount + other.amount, this.currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
```

**Step 3: Update domain entity**

```typescript
// After (value objects)
interface User {
  id: UserId; // ✅ Self-documenting, validated
  email: Email; // ✅ Format enforced, normalized
  balance: Money; // ✅ Currency + amount, validated
}

export class User {
  private constructor(
    private readonly id: UserId,
    private email: Email,
    private balance: Money
  ) {}

  static create(props: { email: string; initialBalance?: number }): User {
    return new User(
      UserId.generate(),
      Email.create(props.email),
      Money.of(props.initialBalance ?? 0, 'USD')
    );
  }

  changeEmail(newEmail: string): void {
    this.email = Email.create(newEmail);
  }

  addFunds(amount: Money): void {
    this.balance = this.balance.add(amount);
  }

  getId(): UserId {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getBalance(): Money {
    return this.balance;
  }
}
```

**Step 4: Update repository mapping**

```typescript
// Repository handles string ↔ value object conversion
export class D1UserRepository implements UserRepository {
  async save(user: User): Promise<void> {
    const query = `
      INSERT INTO users (id, email, balance, currency)
      VALUES (?, ?, ?, ?)
    `;

    await this.db
      .prepare(query)
      .bind(
        user.getId().toString(), // UserId → string
        user.getEmail().toString(), // Email → string
        user.getBalance().getAmount(), // Money → number
        user.getBalance().getCurrency() // Money → string
      )
      .run();
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id.toString())
      .first<UserRow>();

    if (!row) {
      return null;
    }

    return User.reconstitute({
      id: UserId.fromString(row.id), // string → UserId
      email: Email.create(row.email), // string → Email
      balance: Money.of(row.balance, row.currency), // number + string → Money
    });
  }
}
```

### Special Case: Timestamps

**DON'T use Date objects in domain entities**. Use UTC ISO 8601 strings instead.

See [portable-datetime](../../portable-datetime/SKILL.md) skill for details.

```typescript
// ❌ WRONG - Date object in domain
export class Task {
  constructor(
    private readonly id: TaskId,
    private readonly createdAt: Date // ❌ Timezone issues
  ) {}
}

// ✅ CORRECT - UTC string in domain
export class Task {
  constructor(
    private readonly id: TaskId,
    private readonly createdAt: string // ✅ UTC ISO 8601
  ) {}

  static create(props: { title: string }): Task {
    return new Task(TaskId.generate(), new Date().toISOString());
  }

  getCreatedAt(): string {
    return this.createdAt;
  }
}
```

## Equality and Comparison

Always implement `equals()`:

```typescript
// By value comparison
equals(other: Money): boolean {
  return this.amount === other.amount && this.currency === other.currency;
}

// In collections
const prices = [Money.of(10, "USD"), Money.of(20, "USD")];
const target = Money.of(10, "USD");
const found = prices.find(p => p.equals(target)); // Works
```

## Testing Value Objects

```typescript
describe('Money', () => {
  describe('creation', () => {
    it('creates money with valid amount and currency', () => {
      const money = Money.of(100, 'USD');
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });

    it('rounds to 2 decimal places', () => {
      const money = Money.of(10.999, 'USD');
      expect(money.amount).toBe(11);
    });

    it('rejects negative amounts', () => {
      expect(() => Money.of(-10, 'USD')).toThrow('cannot be negative');
    });

    it('rejects invalid currency codes', () => {
      expect(() => Money.of(10, 'US')).toThrow('3-letter ISO');
    });
  });

  describe('operations', () => {
    it('adds same currency', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(20, 'USD');
      expect(a.add(b).amount).toBe(30);
    });

    it('rejects adding different currencies', () => {
      const usd = Money.of(10, 'USD');
      const eur = Money.of(10, 'EUR');
      expect(() => usd.add(eur)).toThrow('Currency mismatch');
    });
  });

  describe('equality', () => {
    it('equals same value', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(10, 'USD');
      expect(a.equals(b)).toBe(true);
    });

    it('not equals different amount', () => {
      const a = Money.of(10, 'USD');
      const b = Money.of(20, 'USD');
      expect(a.equals(b)).toBe(false);
    });
  });
});
```
