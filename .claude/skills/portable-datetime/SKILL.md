---
name: portable-datetime
description: 'Write portable datetime handling code that stores in UTC, calculates in UTC, and displays in a configurable timezone. Use when: (1) Working with dates/times that must work across timezones, (2) Storing timestamps in databases, (3) Displaying times to users in their locale, (4) Scheduling future events, (5) Writing timezone-independent tests, or (6) Converting between UTC and local time.'
---

# Portable Datetime Handling

Handle datetimes correctly across timezones using UTC storage, UTC calculation, and boundary-only display conversion.

## Core Philosophy

**The UTC Sandwich Pattern:**

1. **Input Boundary**: Convert user/external input to UTC immediately
2. **Domain Logic**: All storage, calculation, and comparison in UTC
3. **Output Boundary**: Convert to display timezone only when presenting to users

```
┌─────────────────────────────────────────────────────────────┐
│                    System Boundary                          │
│  ┌─────────────┐                          ┌─────────────┐  │
│  │   INPUT     │    ┌──────────────┐      │   OUTPUT    │  │
│  │  (any tz)   │───▶│  DOMAIN      │─────▶│  (display   │  │
│  │             │    │  (UTC only)  │      │   tz)       │  │
│  │  Convert    │    │              │      │  Convert    │  │
│  │  to UTC     │    │  Store UTC   │      │  from UTC   │  │
│  └─────────────┘    │  Calc UTC    │      └─────────────┘  │
│                     │  Compare UTC │                        │
│                     └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Why This Matters:**

- Tests run identically on any machine, any timezone
- Database queries work without timezone math
- Comparisons are simple numeric operations
- DST transitions don't corrupt logic
- Scheduling is unambiguous

## Quick Reference

| Operation            | Approach                                 |
| -------------------- | ---------------------------------------- |
| Store timestamp      | ISO 8601 UTC: `2025-01-15T16:00:00.000Z` |
| Current time         | `new Date().toISOString()`               |
| Compare times        | Compare ISO strings or UTC milliseconds  |
| Add duration         | Work with UTC milliseconds, convert back |
| Display to user      | Convert at presentation layer only       |
| Parse user input     | Convert to UTC immediately               |
| Test with fixed time | Inject time as dependency                |

## Decision Framework

### Step 1: Identify the operation type

```typescript
// STORAGE - always UTC ISO string
interface NextAction {
  resurfaceAt: string; // "2025-01-15T16:00:00.000Z"
  createdAt: string; // "2025-01-15T08:30:00.000Z"
}

// CALCULATION - use UTC methods or milliseconds
const tomorrow = new Date(now);
tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
tomorrow.setUTCHours(8, 0, 0, 0);

// DISPLAY - convert at boundary only
const displayTime = formatForTimezone(utcIsoString, 'America/Los_Angeles');
```

### Step 2: Choose the right tool

- **Storing**: Use ISO 8601 strings with `Z` suffix
- **Calculating**: Use `Date` object with UTC methods
- **Displaying**: Use `Intl.DateTimeFormat` with explicit timezone
- **Testing**: Inject fixed UTC timestamps

See reference documents for detailed patterns:

- [references/utc-storage.md](references/utc-storage.md) - Storage patterns
- [references/timezone-conversion.md](references/timezone-conversion.md) - Display conversion
- [references/testing-time.md](references/testing-time.md) - Deterministic testing
- [references/common-operations.md](references/common-operations.md) - Recipes

## Essential Patterns

### UTC Storage Pattern

Always store timestamps as ISO 8601 UTC strings:

```typescript
// Entity with timestamps
interface Session {
  id: string;
  startedAt: string; // "2025-01-15T16:00:00.000Z"
  expiresAt: string; // "2025-01-15T17:00:00.000Z"
}

// Creating with current time
function createSession(id: string): Session {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour

  return {
    id,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
```

### UTC Calculation Pattern

Use UTC methods for all date math:

```typescript
// Calculate "tomorrow at 8am PT" as UTC
function getTomorrowMorning(nowUtc: Date, displayTz: string): string {
  // Get tomorrow's date in display timezone
  const tomorrow = new Date(nowUtc);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // Get the date components in display timezone
  const components = getDateComponentsInTimezone(tomorrow, displayTz);

  // Create 8am in display timezone, return as UTC
  return createUtcFromTimezoneComponents(
    components.year,
    components.month,
    components.day,
    8, // 8am in display timezone
    displayTz
  );
}
```

### Display Conversion Pattern

Convert to display timezone only at system boundaries:

```typescript
// Presentation layer only!
function formatForDisplay(utcIsoString: string, timezone: string): string {
  const date = new Date(utcIsoString);

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

// Usage in adapter/presenter
const displayText = formatForDisplay(action.resurfaceAt, 'America/Los_Angeles');
// "Jan 15, 8:00 AM"
```

### Testable Time Pattern

Inject time as a dependency for deterministic tests:

```typescript
// Domain function accepts time as parameter
function computeResurfaceAt(
  option: DeferOption,
  currentTimeUtc: Date // Injected, not created internally
): string {
  // All calculation based on injected time
  const pt = getComponentsInTimezone(currentTimeUtc, 'America/Los_Angeles');
  // ...
}

// Test with fixed time
it('computes tomorrow as 8am PT', () => {
  // Fixed UTC time: Jan 15, 2025 at 5pm UTC = 9am PT
  const now = new Date('2025-01-15T17:00:00.000Z');

  const result = computeResurfaceAt({ type: 'TOMORROW' }, now);

  // Jan 16 at 8am PT = 4pm UTC
  expect(result).toBe('2025-01-16T16:00:00.000Z');
});
```

## Anti-Patterns

### Don't use local time methods in domain logic

```typescript
// ❌ BAD - Uses local timezone
function getTomorrow(now: Date): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);
  return tomorrow.toISOString();
}

// ✅ GOOD - Uses UTC explicitly
function getTomorrow(nowUtc: Date): string {
  const tomorrow = new Date(nowUtc);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(16, 0, 0, 0); // 8am PT = 4pm UTC (winter)
  return tomorrow.toISOString();
}
```

### Don't convert timezone in domain logic

```typescript
// ❌ BAD - Timezone conversion in domain
class ReviewSession {
  getDisplayTime(): string {
    return formatInPT(this.startedAt); // Don't do this!
  }
}

// ✅ GOOD - Return UTC, convert at boundary
class ReviewSession {
  getStartedAt(): string {
    return this.startedAt; // UTC ISO string
  }
}

// In presenter/adapter
const displayTime = formatForTimezone(session.getStartedAt(), userTimezone);
```

### Don't rely on system timezone

```typescript
// ❌ BAD - Depends on server timezone
const now = new Date();
const hour = now.getHours(); // Different on different servers!

// ✅ GOOD - Explicit timezone
const now = new Date();
const hour = getHourInTimezone(now, 'America/Los_Angeles');
```

### Don't create Date objects from timezone-ambiguous strings

```typescript
// ❌ BAD - Ambiguous parsing
const date = new Date('2025-01-15 08:00:00'); // What timezone?

// ✅ GOOD - Explicit UTC
const date = new Date('2025-01-15T08:00:00.000Z');

// ✅ GOOD - Or create from explicit components
const date = createUtcFromTimezoneComponents(2025, 1, 15, 8, 'America/Los_Angeles');
```

## Timezone Utilities

### Core Helper Functions

```typescript
const DISPLAY_TIMEZONE = 'America/Los_Angeles';

/**
 * Get date/time components in a specific timezone.
 */
function getComponentsInTimezone(
  date: Date,
  timezone: string
): { year: number; month: number; day: number; hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string): number =>
    parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

/**
 * Get day of week in a specific timezone (0=Sunday, 6=Saturday).
 */
function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });
  const weekday = formatter.format(date);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return weekdays.indexOf(weekday);
}

/**
 * Create a UTC Date from components in a specific timezone.
 */
function createUtcFromTimezoneComponents(
  year: number,
  month: number,
  day: number,
  hour: number,
  timezone: string
): Date {
  // Create a date string and parse it
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`;

  // Parse as UTC to get a reference point
  const tempDate = new Date(dateStr + 'Z');

  // Get what hour this UTC time shows in the target timezone
  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    hour12: false,
  });
  const tzHour = parseInt(tzFormatter.format(tempDate), 10);

  // Calculate offset and adjust
  let offsetHours = tzHour - hour;
  if (offsetHours > 12) offsetHours -= 24;
  if (offsetHours < -12) offsetHours += 24;

  const result = new Date(tempDate);
  result.setUTCHours(result.getUTCHours() - offsetHours);
  return result;
}
```

## Architecture Integration

### Ports and Adapters Boundary

```
┌─────────────────────────────────────────────────────────────┐
│                      ADAPTERS                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SlackAdapter │  │ HTTPAdapter  │  │  CronAdapter │      │
│  │              │  │              │  │              │      │
│  │ formatPT()   │  │ formatPT()   │  │ parseUTC()   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    DOMAIN                            │   │
│  │                                                      │   │
│  │   All timestamps: UTC ISO strings                    │   │
│  │   All calculations: UTC methods                      │   │
│  │   All comparisons: string or millisecond             │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ D1Repository │  │ KVStore      │  │ QueueAdapter │      │
│  │              │  │              │  │              │      │
│  │ store UTC    │  │ store UTC    │  │ send UTC     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Example: Presentation Adapter

```typescript
// src/adapters/slack-presenter.ts
import { formatForTimezone } from '../utils/timezone.js';

const USER_TIMEZONE = 'America/Los_Angeles';

export function formatActionCard(action: NextAction): SlackBlock {
  // Convert UTC to display timezone at the boundary
  const resurfaceDisplay = action.resurfaceAt
    ? formatForTimezone(action.resurfaceAt, USER_TIMEZONE)
    : null;

  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${action.text}*\n_Resurfaces: ${resurfaceDisplay}_`,
    },
  };
}
```

## Testing Strategy

### Deterministic Test Data

```typescript
// Fixed UTC timestamps for tests
const TEST_TIMES = {
  // Wednesday Jan 15, 2025 at 5pm UTC = 9am PT
  WEDNESDAY_MORNING_PT: '2025-01-15T17:00:00.000Z',

  // Saturday Jan 18, 2025 at 4pm UTC = 8am PT
  SATURDAY_MORNING_PT: '2025-01-18T16:00:00.000Z',

  // Monday Jan 20, 2025 at 4pm UTC = 8am PT
  MONDAY_MORNING_PT: '2025-01-20T16:00:00.000Z',
};

it('defers to Saturday 8am PT', () => {
  const now = new Date(TEST_TIMES.WEDNESDAY_MORNING_PT);

  const result = computeResurfaceAt({ type: 'THIS_WEEKEND' }, now);

  expect(result).toBe(TEST_TIMES.SATURDAY_MORNING_PT);
});
```

### Testing Timezone Conversions

```typescript
it('formats UTC as PT display time', () => {
  // 4pm UTC = 8am PT (winter, PST = UTC-8)
  const utc = '2025-01-15T16:00:00.000Z';

  const display = formatForTimezone(utc, 'America/Los_Angeles');

  expect(display).toBe('Jan 15, 8:00 AM');
});

it('handles DST correctly', () => {
  // 3pm UTC = 8am PT (summer, PDT = UTC-7)
  const utc = '2025-07-15T15:00:00.000Z';

  const display = formatForTimezone(utc, 'America/Los_Angeles');

  expect(display).toBe('Jul 15, 8:00 AM');
});
```

## Summary

**Rules for portable datetime code:**

1. **Store UTC**: All persisted timestamps are ISO 8601 UTC strings
2. **Calculate UTC**: Use `setUTC*` and `getUTC*` methods for date math
3. **Compare UTC**: Compare ISO strings or milliseconds directly
4. **Convert at boundaries**: Only use timezone conversion in adapters/presenters
5. **Inject time**: Pass `currentTimeUtc: Date` as a parameter, don't call `new Date()` in domain
6. **Test with fixed UTC**: Use known UTC timestamps, assert UTC outputs
7. **Use Intl.DateTimeFormat**: For reliable timezone conversion with DST support
