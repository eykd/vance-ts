# Comprehensive Guide: Cron and Scheduled Tasks

**Building Reliable Time-Based Automation for Reports, Syncs, Notifications, and Cleanup**

_With Testing Strategies for Time-Dependent Logic and Clock vs Event-Driven Architecture Patterns_

---

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview: Clock vs Event-Driven](#architecture-overview)
3. [Core Use Cases](#core-use-cases)
4. [Project Structure](#project-structure)
5. [Implementation Patterns](#implementation-patterns)
6. [Testing Time-Dependent Logic](#testing-time-dependent-logic)
7. [Error Handling and Retry Strategies](#error-handling-and-retry-strategies)
8. [Monitoring and Observability](#monitoring-and-observability)
9. [Platform-Specific Implementations](#platform-specific-implementations)
10. [Distributed Scheduling Patterns](#distributed-scheduling-patterns)
11. [Complete Example Application](#complete-example-application)
12. [Best Practices and Anti-Patterns](#best-practices-and-anti-patterns)

---

## Introduction

Scheduled tasks are the silent workhorses of modern applications. They generate reports while teams sleep, synchronize data across systems, send timely notifications, and clean up resources that would otherwise accumulate indefinitely. Despite their critical role, scheduled tasks are often treated as afterthoughts—bolted on late in development with minimal testing and fragile time dependencies.

This guide presents a principled approach to building scheduled task systems that are testable, observable, and resilient.

### Why Scheduled Tasks Are Different

Scheduled tasks introduce unique challenges that don't exist in request-driven code:

**Invisible Failures**: A web endpoint that fails returns an error to the user. A scheduled task that fails at 3 AM might go unnoticed for days, silently accumulating data inconsistencies or missed notifications.

**Time as a Hidden Dependency**: Scheduled tasks depend on something that's constantly changing—the current time. This makes them notoriously difficult to test and debug. A task that works perfectly in development might fail in production due to timezone differences, daylight saving time transitions, or race conditions around midnight.

**Concurrency and Overlap**: What happens when a task takes longer to run than the interval between executions? Without careful design, you get overlapping executions, resource contention, and corrupted state.

**Distributed Coordination**: In horizontally scaled systems, how do you ensure a task runs exactly once across multiple nodes? How do you handle leader election when nodes fail?

### The Goals of Good Scheduled Task Design

| Goal                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Reliability**          | Tasks run when expected and complete successfully                |
| **Observability**        | Execution history, duration, and failures are visible            |
| **Testability**          | Time-dependent logic can be tested without waiting               |
| **Idempotency**          | Running a task twice produces the same result as running it once |
| **Graceful Degradation** | Partial failures don't cascade into complete outages             |
| **Auditability**         | What ran, when, and what it did is recorded                      |

---

## Quick Start

This guide presents a principled approach to building scheduled tasks that are testable, observable, and resilient. You'll learn when to use clock-driven (cron) vs event-driven patterns, how to test time-dependent logic without waiting, implement idempotent operations, handle distributed coordination, and build observable execution pipelines. Scheduled tasks introduce unique challenges—invisible failures, time as a hidden dependency, concurrency concerns—that require careful architectural design beyond simple cron syntax.

### Minimal Example: Idempotent Daily Report

```typescript
// functions/scheduled/daily-report.ts
export const onRequest: PagesFunction<Env> = async (context) => {
  const { event } = context.data.cron;
  const runDate = new Date(event.scheduledTime);
  const reportKey = `report:${runDate.toISOString().split('T')[0]}`;

  // Check if already ran today (idempotency)
  const existing = await context.env.KV.get(reportKey);
  if (existing) {
    return new Response(`Report already generated for ${reportKey}`);
  }

  // Generate report
  const data = await generateDailyReport(context.env.DB, runDate);

  // Store result
  await context.env.KV.put(
    reportKey,
    JSON.stringify({
      generated_at: new Date().toISOString(),
      data,
    }),
    { expirationTtl: 7 * 24 * 60 * 60 }
  ); // 7 days

  return new Response('Report generated successfully');
};

// Testing without waiting
import { describe, it, expect } from 'vitest';
it('generates report for specific date', async () => {
  const testDate = new Date('2025-01-01');
  const report = await generateDailyReport(mockDb, testDate);
  expect(report.date).toBe('2025-01-01');
});
```

**Learn more**:

- [Implementation Patterns](#implementation-patterns) - Idempotency, retries, and error handling
- [Testing Time-Dependent Logic](#testing-time-dependent-logic) - Making time testable
- [Monitoring and Observability](#monitoring-and-observability) - Tracking execution and failures
- [Distributed Scheduling Patterns](#distributed-scheduling-patterns) - Leader election and coordination

---

## Architecture Overview

The most fundamental architectural decision for scheduled work is choosing between clock-driven (cron-style) and event-driven patterns. This isn't a binary choice—most systems benefit from a hybrid approach.

### Clock-Driven (Cron) Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  System Clock   │────────►│  Cron Scheduler │
│  (Time Source)  │         │                 │
└─────────────────┘         └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
           ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
           │ Report Job    │ │ Sync Job      │ │ Cleanup Job   │
           │ "0 6 * * *"   │ │ "*/15 * * * *"│ │ "0 2 * * 0"   │
           │ (Daily 6 AM)  │ │ (Every 15min) │ │ (Weekly 2 AM) │
           └───────────────┘ └───────────────┘ └───────────────┘
```

Clock-driven scheduling runs tasks at predetermined times, regardless of system state. The schedule is the trigger.

**Characteristics**:

- **Predictable**: You know exactly when tasks will run
- **Simple**: Easy to understand and configure
- **Decoupled from events**: Runs whether or not anything "happened"
- **Batch-oriented**: Naturally groups work into periodic batches

**Best For**:

- Periodic reports (daily, weekly, monthly)
- Scheduled maintenance windows
- Regulatory compliance tasks with fixed deadlines
- Rate-limited external API calls
- Tasks that should run "about every X time" without strict timing

### Event-Driven Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Event Source   │─────►│  Message Queue  │─────►│  Task Worker    │
│  (User Action,  │      │  (SQS, RabbitMQ,│      │                 │
│   API Call,     │      │   Kafka)        │      │                 │
│   Webhook)      │      └─────────────────┘      └─────────────────┘
└─────────────────┘
```

Event-driven scheduling runs tasks in response to something happening. The event is the trigger.

**Characteristics**:

- **Responsive**: Reacts immediately when conditions are met
- **Efficient**: Only runs when there's work to do
- **Scalable**: Workers can scale based on queue depth
- **Exactly-once semantics**: With proper queue acknowledgment

**Best For**:

- User-triggered workflows (email after signup)
- Webhook processing
- Real-time data synchronization
- Fan-out operations (notify all subscribers)
- Work that must happen "after X occurs"

### Hybrid Architecture: Clock-Triggered Events

The most robust systems combine both approaches: clock-driven triggers that emit events to queues for reliable processing.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Cron Trigger   │────►│  Message Queue  │────►│  Task Worker    │
│  (Lightweight)  │     │  (Durable)      │     │  (Heavy Lifting)│
│                 │     │                 │     │                 │
│  - Emit event   │     │  - Retry logic  │     │  - Business     │
│  - No business  │     │  - At-least-    │     │    logic        │
│    logic        │     │    once         │     │  - Idempotent   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**This hybrid approach provides**:

- Clock predictability with queue durability
- Separation of scheduling from execution
- Natural retry and failure handling
- Ability to manually re-enqueue failed work
- Decoupled scaling (scheduler vs workers)

### Decision Matrix: When to Use Each Pattern

| Scenario                   | Clock-Driven | Event-Driven | Hybrid            |
| -------------------------- | ------------ | ------------ | ----------------- |
| Daily report generation    | ✅ Primary   |              | ✅ For durability |
| User welcome email         |              | ✅ Primary   |                   |
| Nightly database cleanup   | ✅ Primary   |              | ✅ For retries    |
| Order fulfillment workflow |              | ✅ Primary   |                   |
| Scheduled notifications    | ✅ Trigger   |              | ✅ Combined       |
| Real-time inventory sync   |              | ✅ Primary   |                   |
| Periodic cache warming     | ✅ Primary   |              |                   |
| Webhook delivery retry     |              | ✅ Primary   |                   |
| Monthly billing            | ✅ Trigger   |              | ✅ Combined       |

### The Time Boundary Pattern

A critical insight for testable scheduled task design is separating "what time is it?" from "what should happen at this time?"

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPURE (Time-Dependent)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Scheduler: "It's 6 AM, trigger the report job"          │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    PURE (Time-Independent)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Report Job: "Generate report for date range X to Y"     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

By passing time as a parameter rather than reading it inside the task, you make the business logic pure and testable.

---

## Core Use Cases

### 📊 Reports

Reports aggregate data over time periods and present it in consumable formats. They're typically the most straightforward scheduled task pattern.

**Common Report Types**:

- Daily/weekly/monthly summaries
- Audit logs and compliance reports
- Performance metrics exports
- Financial reconciliation reports
- Usage analytics

**Key Design Considerations**:

```typescript
// ❌ Fragile: Time dependency buried in business logic
class ReportGenerator {
  generate() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return this.queryData(startDate, endDate);
  }
}

// ✅ Robust: Time passed as explicit parameter
class ReportGenerator {
  generate(reportPeriod: DateRange) {
    return this.queryData(reportPeriod.start, reportPeriod.end);
  }
}

// The scheduler determines the time, the generator is pure
function scheduledReportJob(clock: Clock) {
  const period = DateRange.lastWeekEnding(clock.now());
  return reportGenerator.generate(period);
}
```

**Report-Specific Patterns**:

1. **Incremental Generation**: For large datasets, generate reports incrementally throughout the period rather than all at once at the deadline.

2. **Draft and Finalize**: Generate a "draft" report continuously, then "finalize" at the deadline. This catches data quality issues early.

3. **Idempotent Regeneration**: Store enough metadata to regenerate any historical report with identical results.

```typescript
interface ReportRun {
  id: string;
  reportType: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  dataSnapshot: {
    // Captures state for reproducibility
    queryTimestamp: Date;
    recordCount: number;
    checksum: string;
  };
  status: 'generating' | 'completed' | 'failed';
  outputLocation: string;
}
```

### 🔄 Syncs

Synchronization tasks keep data consistent across multiple systems. They're among the most complex scheduled tasks due to conflict resolution and partial failure handling.

**Common Sync Patterns**:

- CRM to marketing platform sync
- Inventory across warehouses
- User data to external services
- Configuration propagation
- Cache refresh and warming

**Key Design Considerations**:

```
┌─────────────────┐                    ┌─────────────────┐
│  Source System  │                    │  Target System  │
│                 │                    │                 │
│  ┌───────────┐  │      Sync Job      │  ┌───────────┐  │
│  │ Record A  │──┼───────────────────►│  │ Record A' │  │
│  │ Record B  │  │                    │  │ Record B' │  │
│  │ Record C  │  │    ┌─────────┐     │  │ Record C' │  │
│  └───────────┘  │    │ Cursor  │     │  └───────────┘  │
│                 │    │ State   │     │                 │
└─────────────────┘    └─────────┘     └─────────────────┘
```

**Sync Strategies**:

1. **Full Sync**: Replace entire target dataset. Simple but expensive.

```typescript
async function fullSync(source: DataSource, target: DataTarget) {
  const allRecords = await source.fetchAll();
  await target.replaceAll(allRecords);
}
```

2. **Incremental Sync**: Only sync changes since last run. Efficient but requires change tracking.

```typescript
interface SyncCursor {
  lastSyncedAt: Date;
  lastRecordId: string;
  lastModifiedTimestamp: Date;
}

async function incrementalSync(
  source: DataSource,
  target: DataTarget,
  cursor: SyncCursor
): Promise<SyncCursor> {
  const changes = await source.fetchChangesSince(cursor.lastModifiedTimestamp);

  for (const change of changes) {
    if (change.type === 'delete') {
      await target.delete(change.id);
    } else {
      await target.upsert(change.record);
    }
  }

  return {
    lastSyncedAt: new Date(),
    lastRecordId: changes.at(-1)?.id ?? cursor.lastRecordId,
    lastModifiedTimestamp: changes.at(-1)?.modifiedAt ?? cursor.lastModifiedTimestamp,
  };
}
```

3. **Bidirectional Sync**: Changes can originate from either system. Requires conflict resolution.

```typescript
type ConflictResolution = 'source-wins' | 'target-wins' | 'newest-wins' | 'manual';

interface SyncConflict {
  recordId: string;
  sourceVersion: Record;
  targetVersion: Record;
  resolution?: ConflictResolution;
}

async function bidirectionalSync(
  systemA: DataSource,
  systemB: DataSource,
  conflictStrategy: ConflictResolution
): Promise<SyncResult> {
  const changesA = await systemA.fetchChangesSince(lastSync);
  const changesB = await systemB.fetchChangesSince(lastSync);

  const conflicts = detectConflicts(changesA, changesB);
  const resolved = resolveConflicts(conflicts, conflictStrategy);

  await applyChanges(systemA, filterForSystem(resolved, 'A'));
  await applyChanges(systemB, filterForSystem(resolved, 'B'));

  return { synced: resolved.length, conflicts: conflicts.length };
}
```

### 🔔 Notifications

Notification tasks deliver messages at appropriate times. They bridge scheduled and event-driven patterns—often triggered by events but delivered on schedules (digest emails, batched alerts).

**Common Notification Patterns**:

- Reminder emails (appointment tomorrow)
- Digest notifications (daily summary)
- Scheduled announcements
- Expiration warnings
- Threshold alerts

**Key Design Considerations**:

```typescript
// Notification scheduling patterns

// 1. Future-scheduled notifications
interface ScheduledNotification {
  id: string;
  recipientId: string;
  channel: 'email' | 'sms' | 'push';
  content: NotificationContent;
  scheduledFor: Date; // When to send
  timezone: string; // Recipient's timezone
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

// 2. Digest aggregation
interface DigestConfig {
  userId: string;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  deliveryTime: string; // "09:00" in user's timezone
  timezone: string;
}

async function processDigests(currentTime: Date) {
  const users = await findUsersForDigestDelivery(currentTime);

  for (const user of users) {
    const events = await collectEventsSinceLastDigest(user.id);
    if (events.length > 0) {
      const digest = composeDigest(user, events);
      await sendNotification(user, digest);
      await markEventsAsDigested(events);
    }
  }
}

// 3. Smart notification timing
interface NotificationWindow {
  userId: string;
  timezone: string;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  preferredDeliveryTimes: string[];
}

function calculateDeliveryTime(
  notification: ScheduledNotification,
  window: NotificationWindow,
  currentTime: Date
): Date {
  const userLocalTime = toTimezone(currentTime, window.timezone);

  if (isInQuietHours(userLocalTime, window)) {
    return nextAvailableTime(window);
  }

  return currentTime;
}
```

**Timezone Handling** (critical for notifications):

```typescript
// Always store times in UTC, convert at display/delivery
interface TimezoneAwareSchedule {
  utcTime: Date; // Canonical time
  userTimezone: string; // IANA timezone (e.g., "America/New_York")
  localTimeIntent: string; // What user intended (e.g., "09:00 local")
}

// Handle DST transitions
function scheduleRecurringNotification(
  userId: string,
  localTime: string, // "09:00"
  timezone: string,
  recurrence: 'daily'
): Date[] {
  const dates: Date[] = [];

  for (let i = 0; i < 30; i++) {
    // Recalculate UTC for each day to handle DST
    const localDate = addDays(startDate, i);
    const utcTime = localTimeToUTC(localTime, localDate, timezone);
    dates.push(utcTime);
  }

  return dates;
}
```

### 🧹 Cleanup

Cleanup tasks maintain system hygiene by removing stale data, expired resources, and orphaned records. They're essential for long-running systems but often overlooked until storage costs or performance degrades.

**Common Cleanup Patterns**:

- Soft-deleted record purging
- Expired session cleanup
- Orphaned file removal
- Old log rotation
- Temporary data expiration
- Cache invalidation

**Key Design Considerations**:

```typescript
// Cleanup job design patterns

// 1. Soft delete with grace period
interface SoftDeletePolicy {
  tableName: string;
  softDeleteColumn: string; // e.g., "deleted_at"
  gracePeriodDays: number; // Days before permanent deletion
  batchSize: number; // Records per batch to avoid locks
}

async function purgeDeletedRecords(
  policy: SoftDeletePolicy,
  currentTime: Date
): Promise<CleanupResult> {
  const cutoffDate = subDays(currentTime, policy.gracePeriodDays);
  let totalPurged = 0;
  let hasMore = true;

  while (hasMore) {
    const purged = await db.execute(
      `
      DELETE FROM ${policy.tableName}
      WHERE ${policy.softDeleteColumn} < ?
      LIMIT ${policy.batchSize}
    `,
      [cutoffDate]
    );

    totalPurged += purged.rowCount;
    hasMore = purged.rowCount === policy.batchSize;

    // Yield to other operations between batches
    await sleep(100);
  }

  return { purged: totalPurged, cutoffDate };
}

// 2. Orphan detection and cleanup
interface OrphanCleanupConfig {
  childTable: string;
  parentTable: string;
  foreignKey: string;
  parentKey: string;
  action: 'delete' | 'nullify' | 'report';
}

async function cleanupOrphans(config: OrphanCleanupConfig): Promise<CleanupResult> {
  // Find orphaned records
  const orphans = await db.query(`
    SELECT c.id FROM ${config.childTable} c
    LEFT JOIN ${config.parentTable} p ON c.${config.foreignKey} = p.${config.parentKey}
    WHERE p.${config.parentKey} IS NULL
    LIMIT 1000
  `);

  if (config.action === 'report') {
    await alertOnOrphans(orphans);
    return { found: orphans.length, action: 'reported' };
  }

  // Process in batches
  for (const batch of chunk(orphans, 100)) {
    if (config.action === 'delete') {
      await db.delete(
        config.childTable,
        batch.map((r) => r.id)
      );
    } else {
      await db.update(
        config.childTable,
        batch.map((r) => r.id),
        {
          [config.foreignKey]: null,
        }
      );
    }
  }

  return { found: orphans.length, action: config.action };
}

// 3. Storage cleanup with safety checks
interface StorageCleanupPolicy {
  bucket: string;
  prefix: string;
  maxAgeHours: number;
  excludePatterns: string[];
  dryRun: boolean;
}

async function cleanupStorage(
  policy: StorageCleanupPolicy,
  currentTime: Date
): Promise<CleanupResult> {
  const cutoff = subHours(currentTime, policy.maxAgeHours);
  const candidates = await storage.list(policy.bucket, policy.prefix);

  const toDelete = candidates.filter(
    (file) =>
      file.lastModified < cutoff &&
      !policy.excludePatterns.some((pattern) => file.key.match(pattern))
  );

  if (policy.dryRun) {
    return { wouldDelete: toDelete.length, dryRun: true };
  }

  // Safety check: don't delete everything
  if (toDelete.length > candidates.length * 0.9) {
    throw new SafetyError('Cleanup would delete >90% of files');
  }

  await storage.deleteMany(
    policy.bucket,
    toDelete.map((f) => f.key)
  );
  return { deleted: toDelete.length };
}
```

**Cleanup Safety Patterns**:

1. **Dry Run Mode**: Always implement a dry-run flag that reports what would be deleted without actually deleting.

2. **Rate Limiting**: Delete in batches with pauses to avoid overwhelming the database or storage system.

3. **Guardrails**: Abort if cleanup would affect an unexpectedly large percentage of data.

4. **Audit Trail**: Log what was deleted, when, and why for forensic purposes.

---

## Project Structure

### Recommended Directory Layout

```
project-root/
├── src/
│   ├── jobs/                      # Scheduled job definitions
│   │   ├── reports/
│   │   │   ├── DailySummaryReport.ts
│   │   │   ├── DailySummaryReport.spec.ts
│   │   │   ├── MonthlyReconciliation.ts
│   │   │   └── MonthlyReconciliation.spec.ts
│   │   ├── syncs/
│   │   │   ├── CrmSync.ts
│   │   │   ├── CrmSync.spec.ts
│   │   │   ├── InventorySync.ts
│   │   │   └── InventorySync.spec.ts
│   │   ├── notifications/
│   │   │   ├── DigestEmailJob.ts
│   │   │   ├── DigestEmailJob.spec.ts
│   │   │   ├── ReminderJob.ts
│   │   │   └── ReminderJob.spec.ts
│   │   └── cleanup/
│   │       ├── SessionCleanup.ts
│   │       ├── SessionCleanup.spec.ts
│   │       ├── OrphanedFileCleanup.ts
│   │       └── OrphanedFileCleanup.spec.ts
│   │
│   ├── scheduling/                # Scheduling infrastructure
│   │   ├── Scheduler.ts           # Core scheduler interface
│   │   ├── CronParser.ts          # Cron expression handling
│   │   ├── CronParser.spec.ts
│   │   ├── JobRunner.ts           # Execution wrapper
│   │   ├── JobRunner.spec.ts
│   │   ├── LockManager.ts         # Distributed locking
│   │   └── LockManager.spec.ts
│   │
│   ├── time/                      # Time abstraction layer
│   │   ├── Clock.ts               # Clock interface
│   │   ├── SystemClock.ts         # Real clock implementation
│   │   ├── TestClock.ts           # Controllable test clock
│   │   ├── DateRange.ts           # Date range utilities
│   │   └── DateRange.spec.ts
│   │
│   ├── domain/                    # Business logic (time-independent)
│   │   ├── reports/
│   │   │   ├── ReportGenerator.ts
│   │   │   └── ReportGenerator.spec.ts
│   │   ├── sync/
│   │   │   ├── SyncEngine.ts
│   │   │   ├── ConflictResolver.ts
│   │   │   └── SyncEngine.spec.ts
│   │   └── notifications/
│   │       ├── DigestComposer.ts
│   │       └── DigestComposer.spec.ts
│   │
│   ├── infrastructure/            # External integrations
│   │   ├── queues/
│   │   │   ├── QueueClient.ts
│   │   │   └── SQSQueueClient.ts
│   │   ├── storage/
│   │   │   ├── ReportStorage.ts
│   │   │   └── S3ReportStorage.ts
│   │   ├── locks/
│   │   │   ├── DistributedLock.ts
│   │   │   └── RedisDistributedLock.ts
│   │   └── metrics/
│   │       ├── MetricsClient.ts
│   │       └── DatadogMetricsClient.ts
│   │
│   ├── config/
│   │   ├── schedules.ts           # Job schedule definitions
│   │   └── jobConfig.ts           # Per-job configuration
│   │
│   └── index.ts                   # Entry point
│
├── tests/
│   ├── integration/
│   │   ├── reportGeneration.integration.test.ts
│   │   └── syncExecution.integration.test.ts
│   ├── acceptance/
│   │   ├── dailyReportWorkflow.acceptance.test.ts
│   │   └── notificationDelivery.acceptance.test.ts
│   ├── fixtures/
│   │   ├── ClockFixture.ts
│   │   └── JobContextBuilder.ts
│   └── helpers/
│       ├── timeTravel.ts
│       └── jobTestHarness.ts
│
├── migrations/
│   ├── 0001_job_runs_table.sql
│   ├── 0002_job_locks_table.sql
│   └── 0003_scheduled_notifications.sql
│
├── scripts/
│   ├── run-job.ts                 # Manual job execution
│   └── backfill-report.ts         # Historical regeneration
│
└── package.json
```

### Key Structural Principles

1. **Jobs as First-Class Citizens**: Each job is a distinct module with its own tests, not scattered logic buried in a scheduler config file.

2. **Time Abstraction Layer**: The `time/` directory provides injectable clock interfaces, enabling tests to control time explicitly.

3. **Separation of Schedule from Logic**: Job schedule configuration lives in `config/schedules.ts`, while job implementation lives in `jobs/`. This allows schedule changes without code changes.

4. **Infrastructure Independence**: Domain logic in `domain/` has no knowledge of how it's triggered (cron, manual, queue).

---

## Implementation Patterns

### The Job Interface

Define a consistent interface for all scheduled jobs:

```typescript
// src/scheduling/Job.ts

export interface JobContext {
  jobId: string;
  runId: string;
  scheduledTime: Date;
  actualStartTime: Date;
  clock: Clock;
  logger: Logger;
  metrics: MetricsClient;
}

export interface JobResult {
  status: 'success' | 'partial' | 'failed';
  recordsProcessed?: number;
  errors?: JobError[];
  metadata?: Record<string, unknown>;
}

export interface Job {
  name: string;
  execute(context: JobContext): Promise<JobResult>;
}

// Type for schedule configuration
export interface JobSchedule {
  job: Job;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  timeout: Duration;
  retryPolicy: RetryPolicy;
  lockDuration: Duration;
}
```

### Job Implementation Template

```typescript
// src/jobs/reports/DailySummaryReport.ts

import { Job, JobContext, JobResult } from '../../scheduling/Job';
import { ReportGenerator } from '../../domain/reports/ReportGenerator';
import { ReportStorage } from '../../infrastructure/storage/ReportStorage';
import { DateRange } from '../../time/DateRange';

export class DailySummaryReportJob implements Job {
  readonly name = 'daily-summary-report';

  constructor(
    private readonly reportGenerator: ReportGenerator,
    private readonly storage: ReportStorage
  ) {}

  async execute(context: JobContext): Promise<JobResult> {
    const { clock, logger, metrics } = context;

    // Calculate report period (yesterday in this case)
    const reportDate = clock.now();
    const period = DateRange.forPreviousDay(reportDate);

    logger.info('Generating daily summary report', {
      periodStart: period.start.toISOString(),
      periodEnd: period.end.toISOString(),
    });

    try {
      // Generate the report (business logic is time-independent)
      const report = await this.reportGenerator.generateSummary(period);

      // Store the output
      const location = await this.storage.store(report, {
        type: 'daily-summary',
        date: period.start,
        generatedAt: clock.now(),
      });

      metrics.increment('reports.generated', { type: 'daily-summary' });
      metrics.gauge('reports.record_count', report.recordCount);

      return {
        status: 'success',
        recordsProcessed: report.recordCount,
        metadata: { outputLocation: location },
      };
    } catch (error) {
      logger.error('Report generation failed', { error });
      metrics.increment('reports.failed', { type: 'daily-summary' });

      return {
        status: 'failed',
        errors: [{ message: error.message, code: 'GENERATION_FAILED' }],
      };
    }
  }
}
```

### The Job Runner (Execution Wrapper)

The job runner handles cross-cutting concerns like locking, timing, and error handling:

```typescript
// src/scheduling/JobRunner.ts

export class JobRunner {
  constructor(
    private readonly lockManager: LockManager,
    private readonly metrics: MetricsClient,
    private readonly logger: Logger,
    private readonly clock: Clock
  ) {}

  async run(schedule: JobSchedule, scheduledTime: Date): Promise<JobRunRecord> {
    const runId = generateRunId();
    const startTime = this.clock.now();

    // Attempt to acquire distributed lock
    const lock = await this.lockManager.acquire(`job:${schedule.job.name}`, schedule.lockDuration);

    if (!lock.acquired) {
      this.logger.info('Job already running, skipping', {
        job: schedule.job.name,
        runId,
      });
      return { status: 'skipped', reason: 'lock_not_acquired' };
    }

    try {
      const context: JobContext = {
        jobId: schedule.job.name,
        runId,
        scheduledTime,
        actualStartTime: startTime,
        clock: this.clock,
        logger: this.logger.child({ job: schedule.job.name, runId }),
        metrics: this.metrics,
      };

      // Execute with timeout
      const result = await withTimeout(schedule.job.execute(context), schedule.timeout);

      const duration = this.clock.now().getTime() - startTime.getTime();

      this.metrics.timing(`jobs.${schedule.job.name}.duration`, duration);
      this.metrics.increment(`jobs.${schedule.job.name}.${result.status}`);

      return {
        runId,
        job: schedule.job.name,
        scheduledTime,
        startTime,
        endTime: this.clock.now(),
        duration,
        result,
      };
    } catch (error) {
      if (error instanceof TimeoutError) {
        this.logger.error('Job timed out', {
          job: schedule.job.name,
          timeout: schedule.timeout,
        });
        return { status: 'timeout', error };
      }
      throw error;
    } finally {
      await lock.release();
    }
  }
}
```

### Schedule Configuration

Centralize schedule definitions for visibility and maintenance:

```typescript
// src/config/schedules.ts

import { JobSchedule } from '../scheduling/Job';
import { Duration } from '../time/Duration';

// Factory function to create schedules with injected dependencies
export function createSchedules(deps: Dependencies): JobSchedule[] {
  return [
    {
      job: new DailySummaryReportJob(deps.reportGenerator, deps.storage),
      cronExpression: '0 6 * * *', // 6 AM daily
      timezone: 'America/New_York',
      enabled: true,
      timeout: Duration.minutes(30),
      retryPolicy: { maxAttempts: 3, backoff: 'exponential' },
      lockDuration: Duration.minutes(35),
    },
    {
      job: new InventorySyncJob(deps.inventoryService, deps.externalApi),
      cronExpression: '*/15 * * * *', // Every 15 minutes
      timezone: 'UTC',
      enabled: true,
      timeout: Duration.minutes(10),
      retryPolicy: { maxAttempts: 2, backoff: 'linear' },
      lockDuration: Duration.minutes(12),
    },
    {
      job: new SessionCleanupJob(deps.sessionStore),
      cronExpression: '0 3 * * *', // 3 AM daily
      timezone: 'UTC',
      enabled: true,
      timeout: Duration.hours(1),
      retryPolicy: { maxAttempts: 1 }, // No retry, will run tomorrow
      lockDuration: Duration.hours(1),
    },
    {
      job: new DigestEmailJob(deps.digestComposer, deps.emailService),
      cronExpression: '0 9 * * 1-5', // 9 AM weekdays
      timezone: 'America/Los_Angeles',
      enabled: process.env.ENABLE_DIGESTS === 'true',
      timeout: Duration.minutes(45),
      retryPolicy: { maxAttempts: 3, backoff: 'exponential' },
      lockDuration: Duration.minutes(50),
    },
  ];
}
```

### Cron Expression Reference

For clarity, here's a reference for cron expressions used throughout this guide:

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *

Examples:
0 6 * * *       Every day at 6:00 AM
*/15 * * * *    Every 15 minutes
0 0 1 * *       First day of every month at midnight
0 9 * * 1-5     Weekdays at 9:00 AM
30 4 * * 0      Sundays at 4:30 AM
0 */2 * * *     Every 2 hours at the top of the hour
0 0 * * 0       Weekly on Sunday at midnight
```

---

## Testing Time-Dependent Logic

Testing scheduled tasks is notoriously difficult because they depend on something that's constantly changing—time. This section presents patterns for making time-dependent code reliably testable.

### The Clock Abstraction

The foundation of testable time-dependent code is abstracting the clock:

```typescript
// src/time/Clock.ts

export interface Clock {
  now(): Date;
}

// src/time/SystemClock.ts
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

// src/time/TestClock.ts
export class TestClock implements Clock {
  private currentTime: Date;

  constructor(initialTime: Date | string = '2024-01-15T10:00:00Z') {
    this.currentTime = typeof initialTime === 'string' ? new Date(initialTime) : initialTime;
  }

  now(): Date {
    return new Date(this.currentTime);
  }

  // Time travel methods
  advanceBy(duration: Duration): void {
    this.currentTime = new Date(this.currentTime.getTime() + duration.toMilliseconds());
  }

  advanceTo(time: Date | string): void {
    this.currentTime = typeof time === 'string' ? new Date(time) : time;
  }

  // Convenience methods
  advanceMinutes(n: number): void {
    this.advanceBy(Duration.minutes(n));
  }

  advanceHours(n: number): void {
    this.advanceBy(Duration.hours(n));
  }

  advanceDays(n: number): void {
    this.advanceBy(Duration.days(n));
  }
}
```

### Testing Job Execution at Specific Times

```typescript
// src/jobs/reports/DailySummaryReport.spec.ts

describe('DailySummaryReportJob', () => {
  let clock: TestClock;
  let job: DailySummaryReportJob;
  let reportGenerator: MockReportGenerator;
  let storage: MockReportStorage;

  beforeEach(() => {
    clock = new TestClock('2024-03-15T06:00:00Z'); // 6 AM UTC
    reportGenerator = new MockReportGenerator();
    storage = new MockReportStorage();
    job = new DailySummaryReportJob(reportGenerator, storage);
  });

  it('generates report for the previous day', async () => {
    const context = createJobContext({ clock });

    await job.execute(context);

    // Verify the report covers yesterday (March 14)
    expect(reportGenerator.lastPeriod).toEqual({
      start: new Date('2024-03-14T00:00:00Z'),
      end: new Date('2024-03-14T23:59:59.999Z'),
    });
  });

  it('handles month boundary correctly', async () => {
    clock.advanceTo('2024-04-01T06:00:00Z'); // April 1st
    const context = createJobContext({ clock });

    await job.execute(context);

    // Should generate for March 31st
    expect(reportGenerator.lastPeriod.start.getMonth()).toBe(2); // March
    expect(reportGenerator.lastPeriod.start.getDate()).toBe(31);
  });

  it('handles year boundary correctly', async () => {
    clock.advanceTo('2024-01-01T06:00:00Z'); // January 1st
    const context = createJobContext({ clock });

    await job.execute(context);

    // Should generate for December 31st of previous year
    expect(reportGenerator.lastPeriod.start.getFullYear()).toBe(2023);
    expect(reportGenerator.lastPeriod.start.getMonth()).toBe(11); // December
    expect(reportGenerator.lastPeriod.start.getDate()).toBe(31);
  });
});
```

### Testing Timezone-Sensitive Logic

```typescript
// src/jobs/notifications/DigestEmailJob.spec.ts

describe('DigestEmailJob timezone handling', () => {
  let clock: TestClock;
  let job: DigestEmailJob;

  it('sends digest at 9 AM in user timezone', async () => {
    // It's 2 PM UTC, which is 9 AM Eastern (during EST)
    clock = new TestClock('2024-01-15T14:00:00Z');

    const user = UserBuilder.aUser()
      .withTimezone('America/New_York')
      .withDigestTime('09:00')
      .build();

    const result = await job.processUser(user, clock.now());

    expect(result.sent).toBe(true);
  });

  it('respects daylight saving time transitions', async () => {
    // March 10, 2024: DST begins in US (clocks spring forward)
    // At 2 AM, clocks move to 3 AM

    // Test the day before DST
    clock = new TestClock('2024-03-09T14:00:00Z'); // 9 AM EST
    const user = UserBuilder.aUser()
      .withTimezone('America/New_York')
      .withDigestTime('09:00')
      .build();

    let result = await job.processUser(user, clock.now());
    expect(result.sent).toBe(true);

    // Test the day of DST transition
    // 9 AM EDT = 1 PM UTC (one hour earlier than EST)
    clock = new TestClock('2024-03-10T13:00:00Z');
    result = await job.processUser(user, clock.now());
    expect(result.sent).toBe(true);
  });
});
```

### Testing Job Scheduling Logic

```typescript
// src/scheduling/Scheduler.spec.ts

describe('Scheduler', () => {
  let clock: TestClock;
  let scheduler: Scheduler;
  let executedJobs: string[];

  beforeEach(() => {
    clock = new TestClock('2024-01-15T00:00:00Z'); // Monday midnight
    executedJobs = [];
    scheduler = new Scheduler(clock, {
      onJobExecuted: (name) => executedJobs.push(name),
    });
  });

  it('runs daily job at scheduled time', async () => {
    scheduler.register({
      name: 'daily-report',
      cronExpression: '0 6 * * *', // 6 AM daily
      timezone: 'UTC',
      handler: async () => {},
    });

    // Advance to just before scheduled time
    clock.advanceTo('2024-01-15T05:59:00Z');
    await scheduler.tick();
    expect(executedJobs).toEqual([]);

    // Advance to scheduled time
    clock.advanceTo('2024-01-15T06:00:00Z');
    await scheduler.tick();
    expect(executedJobs).toEqual(['daily-report']);

    // Job shouldn't run again in same hour
    clock.advanceTo('2024-01-15T06:30:00Z');
    await scheduler.tick();
    expect(executedJobs).toEqual(['daily-report']);

    // But should run next day
    clock.advanceTo('2024-01-16T06:00:00Z');
    await scheduler.tick();
    expect(executedJobs).toEqual(['daily-report', 'daily-report']);
  });

  it('handles multiple jobs with different schedules', async () => {
    scheduler.register({
      name: 'every-15-min',
      cronExpression: '*/15 * * * *',
      handler: async () => {},
    });
    scheduler.register({
      name: 'hourly',
      cronExpression: '0 * * * *',
      handler: async () => {},
    });

    clock.advanceTo('2024-01-15T06:00:00Z');
    await scheduler.tick();
    // Both should run at the top of the hour
    expect(executedJobs).toContain('every-15-min');
    expect(executedJobs).toContain('hourly');

    executedJobs = [];
    clock.advanceTo('2024-01-15T06:15:00Z');
    await scheduler.tick();
    // Only the 15-min job should run
    expect(executedJobs).toEqual(['every-15-min']);
  });
});
```

### Testing Timeout and Retry Logic

```typescript
// src/scheduling/JobRunner.spec.ts

describe('JobRunner', () => {
  let clock: TestClock;
  let runner: JobRunner;

  describe('timeout handling', () => {
    it('terminates job that exceeds timeout', async () => {
      clock = new TestClock();
      const slowJob: Job = {
        name: 'slow-job',
        async execute() {
          await sleep(Duration.minutes(10).toMilliseconds());
          return { status: 'success' };
        },
      };

      const schedule: JobSchedule = {
        job: slowJob,
        timeout: Duration.seconds(5),
        // ...
      };

      const result = await runner.run(schedule, clock.now());

      expect(result.status).toBe('timeout');
    });
  });

  describe('retry logic', () => {
    it('retries failed jobs according to policy', async () => {
      let attempts = 0;
      const flakyJob: Job = {
        name: 'flaky-job',
        async execute() {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return { status: 'success' };
        },
      };

      const schedule: JobSchedule = {
        job: flakyJob,
        retryPolicy: { maxAttempts: 3, backoff: 'exponential' },
        // ...
      };

      const result = await runner.run(schedule, clock.now());

      expect(result.status).toBe('success');
      expect(attempts).toBe(3);
    });

    it('applies exponential backoff between retries', async () => {
      const attemptTimes: Date[] = [];
      const failingJob: Job = {
        name: 'failing-job',
        async execute(context) {
          attemptTimes.push(context.clock.now());
          throw new Error('Always fails');
        },
      };

      const schedule: JobSchedule = {
        job: failingJob,
        retryPolicy: {
          maxAttempts: 4,
          backoff: 'exponential',
          initialDelay: Duration.seconds(1),
        },
        // ...
      };

      await runner.run(schedule, clock.now());

      // Verify exponential backoff: 1s, 2s, 4s
      const delays = [];
      for (let i = 1; i < attemptTimes.length; i++) {
        delays.push(attemptTimes[i].getTime() - attemptTimes[i - 1].getTime());
      }

      expect(delays[0]).toBeCloseTo(1000, -2); // ~1 second
      expect(delays[1]).toBeCloseTo(2000, -2); // ~2 seconds
      expect(delays[2]).toBeCloseTo(4000, -2); // ~4 seconds
    });
  });
});
```

### Testing Date Edge Cases

```typescript
// src/time/DateRange.spec.ts

describe('DateRange', () => {
  describe('forPreviousDay', () => {
    it('handles typical case', () => {
      const range = DateRange.forPreviousDay(new Date('2024-03-15T10:00:00Z'));

      expect(range.start).toEqual(new Date('2024-03-14T00:00:00Z'));
      expect(range.end).toEqual(new Date('2024-03-14T23:59:59.999Z'));
    });

    it('handles first day of month', () => {
      const range = DateRange.forPreviousDay(new Date('2024-03-01T10:00:00Z'));

      expect(range.start).toEqual(new Date('2024-02-29T00:00:00Z')); // Leap year!
      expect(range.end).toEqual(new Date('2024-02-29T23:59:59.999Z'));
    });

    it('handles leap year February 29', () => {
      const range = DateRange.forPreviousDay(new Date('2024-03-01T00:00:00Z'));

      expect(range.start.getDate()).toBe(29);
      expect(range.start.getMonth()).toBe(1); // February
    });

    it('handles non-leap year correctly', () => {
      const range = DateRange.forPreviousDay(new Date('2023-03-01T00:00:00Z'));

      expect(range.start.getDate()).toBe(28); // No Feb 29 in 2023
    });

    it('handles year boundary', () => {
      const range = DateRange.forPreviousDay(new Date('2024-01-01T10:00:00Z'));

      expect(range.start).toEqual(new Date('2023-12-31T00:00:00Z'));
      expect(range.start.getFullYear()).toBe(2023);
    });
  });

  describe('forPreviousWeek', () => {
    it('returns Monday through Sunday of previous week', () => {
      // March 15, 2024 is a Friday
      const range = DateRange.forPreviousWeek(new Date('2024-03-15T10:00:00Z'));

      // Previous week: Monday March 4 through Sunday March 10
      expect(range.start).toEqual(new Date('2024-03-04T00:00:00Z'));
      expect(range.end).toEqual(new Date('2024-03-10T23:59:59.999Z'));
      expect(range.start.getDay()).toBe(1); // Monday
    });
  });
});
```

### Integration Tests with Time Control

```typescript
// tests/integration/reportGeneration.integration.test.ts

describe('Report Generation (Integration)', () => {
  let clock: TestClock;
  let database: TestDatabase;

  beforeEach(async () => {
    clock = new TestClock('2024-03-15T06:00:00Z');
    database = await TestDatabase.create();

    // Seed data with specific dates
    await database.seedOrders([
      { id: '1', createdAt: '2024-03-14T10:00:00Z', amount: 100 },
      { id: '2', createdAt: '2024-03-14T15:00:00Z', amount: 200 },
      { id: '3', createdAt: '2024-03-13T12:00:00Z', amount: 150 }, // Day before
    ]);
  });

  afterEach(async () => {
    await database.cleanup();
  });

  it('generates accurate daily summary from database', async () => {
    const reportGenerator = new ReportGenerator(database);
    const period = DateRange.forPreviousDay(clock.now());

    const report = await reportGenerator.generateSummary(period);

    // Only orders from March 14th
    expect(report.orderCount).toBe(2);
    expect(report.totalRevenue).toBe(300);
    expect(report.periodStart).toEqual(new Date('2024-03-14T00:00:00Z'));
    expect(report.periodEnd).toEqual(new Date('2024-03-14T23:59:59.999Z'));
  });

  it('handles empty periods gracefully', async () => {
    // Move to a day with no data
    clock.advanceTo('2024-03-20T06:00:00Z');
    const reportGenerator = new ReportGenerator(database);
    const period = DateRange.forPreviousDay(clock.now());

    const report = await reportGenerator.generateSummary(period);

    expect(report.orderCount).toBe(0);
    expect(report.totalRevenue).toBe(0);
    expect(report.isEmpty).toBe(true);
  });
});
```

### Property-Based Testing for Time Logic

```typescript
// Using fast-check for property-based testing
import fc from 'fast-check';

describe('DateRange properties', () => {
  it('forPreviousDay always returns exactly 24 hours', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), (date) => {
        const range = DateRange.forPreviousDay(date);
        const durationMs = range.end.getTime() - range.start.getTime();
        const expectedMs = 24 * 60 * 60 * 1000 - 1; // 24h minus 1ms

        return Math.abs(durationMs - expectedMs) < 1000; // Within 1 second
      })
    );
  });

  it('forPreviousDay end is always before input date', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), (date) => {
        const range = DateRange.forPreviousDay(date);
        return range.end < date;
      })
    );
  });

  it('consecutive forPreviousDay calls cover adjacent days', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date('2020-01-02'), max: new Date('2030-12-31') }), (date) => {
        const today = DateRange.forPreviousDay(date);
        const yesterday = DateRange.forPreviousDay(today.start);

        // Yesterday's end should be just before today's start
        const gap = today.start.getTime() - yesterday.end.getTime();
        return gap === 1; // 1 millisecond gap
      })
    );
  });
});
```

---

## Error Handling and Retry Strategies

### Failure Classification

Not all failures are equal. Classify failures to determine the appropriate response:

```typescript
// src/scheduling/errors.ts

export enum FailureType {
  TRANSIENT = 'transient', // Retry likely to succeed
  PERMANENT = 'permanent', // Retry will not help
  RESOURCE = 'resource', // Rate limit, quota, capacity
  PARTIAL = 'partial', // Some records processed
  UNKNOWN = 'unknown', // Couldn't determine cause
}

export class JobFailure extends Error {
  constructor(
    message: string,
    public readonly type: FailureType,
    public readonly retryable: boolean,
    public readonly cause?: Error
  ) {
    super(message);
  }
}

// Classify common errors
export function classifyError(error: Error): FailureType {
  if (
    error.message.includes('ECONNRESET') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('503')
  ) {
    return FailureType.TRANSIENT;
  }

  if (
    error.message.includes('429') ||
    error.message.includes('rate limit') ||
    error.message.includes('quota exceeded')
  ) {
    return FailureType.RESOURCE;
  }

  if (
    error.message.includes('404') ||
    error.message.includes('invalid') ||
    error.message.includes('malformed')
  ) {
    return FailureType.PERMANENT;
  }

  return FailureType.UNKNOWN;
}
```

### Retry Policies

Implement configurable retry strategies:

```typescript
// src/scheduling/RetryPolicy.ts

export interface RetryPolicy {
  maxAttempts: number;
  backoff: 'none' | 'linear' | 'exponential';
  initialDelay?: Duration;
  maxDelay?: Duration;
  retryableErrors?: FailureType[];
}

export class RetryExecutor {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    policy: RetryPolicy,
    context: { logger: Logger; clock: Clock }
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const failureType = classifyError(error);

        // Don't retry permanent failures
        if (failureType === FailureType.PERMANENT) {
          throw error;
        }

        // Check if this failure type is retryable
        if (policy.retryableErrors && !policy.retryableErrors.includes(failureType)) {
          throw error;
        }

        // Last attempt, don't delay
        if (attempt === policy.maxAttempts) {
          break;
        }

        const delay = this.calculateDelay(attempt, policy);
        context.logger.warn('Retrying after failure', {
          attempt,
          maxAttempts: policy.maxAttempts,
          delay: delay.toMilliseconds(),
          error: error.message,
        });

        await sleep(delay.toMilliseconds());
      }
    }

    throw lastError;
  }

  private calculateDelay(attempt: number, policy: RetryPolicy): Duration {
    const initial = policy.initialDelay ?? Duration.seconds(1);
    const max = policy.maxDelay ?? Duration.minutes(5);

    let delay: Duration;

    switch (policy.backoff) {
      case 'none':
        delay = initial;
        break;
      case 'linear':
        delay = Duration.milliseconds(initial.toMilliseconds() * attempt);
        break;
      case 'exponential':
        delay = Duration.milliseconds(initial.toMilliseconds() * Math.pow(2, attempt - 1));
        break;
    }

    // Apply jitter to prevent thundering herd
    const jitter = 0.8 + Math.random() * 0.4; // 80-120%
    delay = Duration.milliseconds(delay.toMilliseconds() * jitter);

    // Clamp to max
    return delay.toMilliseconds() > max.toMilliseconds() ? max : delay;
  }
}
```

### Partial Failure Handling

For batch operations, handle partial failures gracefully:

```typescript
// src/scheduling/BatchProcessor.ts

export interface BatchResult<T> {
  successful: T[];
  failed: Array<{ item: T; error: Error }>;
  totalProcessed: number;
  totalFailed: number;
}

export class BatchProcessor<T> {
  constructor(
    private readonly processor: (item: T) => Promise<void>,
    private readonly options: {
      batchSize: number;
      continueOnError: boolean;
      maxFailures?: number;
    }
  ) {}

  async process(items: T[]): Promise<BatchResult<T>> {
    const result: BatchResult<T> = {
      successful: [],
      failed: [],
      totalProcessed: 0,
      totalFailed: 0,
    };

    for (const batch of chunk(items, this.options.batchSize)) {
      for (const item of batch) {
        try {
          await this.processor(item);
          result.successful.push(item);
          result.totalProcessed++;
        } catch (error) {
          result.failed.push({ item, error });
          result.totalFailed++;

          // Check failure threshold
          if (this.options.maxFailures && result.totalFailed >= this.options.maxFailures) {
            throw new TooManyFailuresError(`Exceeded max failures: ${result.totalFailed}`, result);
          }

          if (!this.options.continueOnError) {
            throw error;
          }
        }
      }
    }

    return result;
  }
}

// Usage in a sync job
async function syncRecords(records: Record[]): Promise<JobResult> {
  const processor = new BatchProcessor((record) => externalApi.upsert(record), {
    batchSize: 100,
    continueOnError: true,
    maxFailures: Math.ceil(records.length * 0.1), // Fail if >10% fail
  });

  const result = await processor.process(records);

  if (result.totalFailed > 0) {
    return {
      status: 'partial',
      recordsProcessed: result.totalProcessed,
      errors: result.failed.map((f) => ({
        recordId: f.item.id,
        message: f.error.message,
      })),
    };
  }

  return { status: 'success', recordsProcessed: result.totalProcessed };
}
```

### Dead Letter Queue Pattern

For failures that need manual intervention:

```typescript
// src/infrastructure/DeadLetterQueue.ts

export interface DeadLetterEntry {
  id: string;
  originalJob: string;
  payload: unknown;
  error: string;
  failedAt: Date;
  attempts: number;
  lastAttempt: Date;
  metadata: Record<string, unknown>;
}

export class DeadLetterQueue {
  constructor(private readonly storage: DLQStorage) {}

  async enqueue(entry: Omit<DeadLetterEntry, 'id'>): Promise<string> {
    const id = generateId();
    await this.storage.insert({ ...entry, id });

    // Alert on DLQ entry
    await this.notifyOnNewEntry(entry);

    return id;
  }

  async retry(id: string): Promise<boolean> {
    const entry = await this.storage.find(id);
    if (!entry) return false;

    // Re-enqueue to original job queue
    await jobQueue.enqueue(entry.originalJob, entry.payload);
    await this.storage.markRetried(id);

    return true;
  }

  async getPending(): Promise<DeadLetterEntry[]> {
    return this.storage.findPending();
  }
}

// Integration with job runner
class JobRunnerWithDLQ {
  async run(schedule: JobSchedule, scheduledTime: Date): Promise<JobRunRecord> {
    try {
      return await this.executeJob(schedule, scheduledTime);
    } catch (error) {
      if (this.shouldMoveToDeadLetter(error, schedule)) {
        await this.dlq.enqueue({
          originalJob: schedule.job.name,
          payload: { scheduledTime },
          error: error.message,
          failedAt: this.clock.now(),
          attempts: schedule.retryPolicy.maxAttempts,
          lastAttempt: this.clock.now(),
          metadata: { schedule: schedule.cronExpression },
        });
      }
      throw error;
    }
  }
}
```

---

## Monitoring and Observability

### Essential Metrics

Every scheduled task system should track these metrics:

```typescript
// src/infrastructure/metrics/JobMetrics.ts

export interface JobMetrics {
  // Execution metrics
  jobExecutionTotal: Counter; // Total executions by job, status
  jobDurationSeconds: Histogram; // Execution time distribution
  jobLastRunTimestamp: Gauge; // When job last ran
  jobNextRunTimestamp: Gauge; // When job will next run

  // Health metrics
  jobQueueDepth: Gauge; // Items waiting to process
  jobActiveExecutions: Gauge; // Currently running jobs
  jobLockAcquisitionTotal: Counter; // Lock attempts by outcome

  // Business metrics (per-job specific)
  jobRecordsProcessed: Counter; // Records handled
  jobErrorsTotal: Counter; // Errors by type
}

export class JobMetricsCollector {
  recordExecution(job: string, result: JobResult, duration: number) {
    this.metrics.jobExecutionTotal.labels({ job, status: result.status }).inc();

    this.metrics.jobDurationSeconds.labels({ job }).observe(duration / 1000);

    this.metrics.jobLastRunTimestamp.labels({ job }).set(Date.now() / 1000);

    if (result.recordsProcessed) {
      this.metrics.jobRecordsProcessed.labels({ job }).inc(result.recordsProcessed);
    }

    if (result.errors) {
      for (const error of result.errors) {
        this.metrics.jobErrorsTotal.labels({ job, error_type: error.code }).inc();
      }
    }
  }
}
```

### Structured Logging

```typescript
// src/infrastructure/logging/JobLogger.ts

export interface JobLogContext {
  job: string;
  runId: string;
  scheduledTime: string;
  startTime: string;
}

export class JobLogger {
  private readonly context: JobLogContext;

  constructor(
    context: JobLogContext,
    private readonly logger: Logger
  ) {
    this.context = context;
  }

  info(message: string, data?: Record<string, unknown>) {
    this.logger.info({
      ...this.context,
      message,
      ...data,
    });
  }

  error(message: string, error: Error, data?: Record<string, unknown>) {
    this.logger.error({
      ...this.context,
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...data,
    });
  }

  // Structured lifecycle events
  logStarted() {
    this.info('Job started');
  }

  logCompleted(result: JobResult, durationMs: number) {
    this.info('Job completed', {
      status: result.status,
      duration_ms: durationMs,
      records_processed: result.recordsProcessed,
    });
  }

  logFailed(error: Error, durationMs: number) {
    this.error('Job failed', error, { duration_ms: durationMs });
  }
}
```

### Health Checks

```typescript
// src/scheduling/HealthCheck.ts

export interface JobHealthStatus {
  job: string;
  healthy: boolean;
  lastRun?: Date;
  lastStatus?: 'success' | 'failed';
  nextScheduledRun: Date;
  consecutiveFailures: number;
  averageDuration: number;
  issues: string[];
}

export class SchedulerHealthCheck {
  constructor(
    private readonly scheduler: Scheduler,
    private readonly runHistory: JobRunRepository
  ) {}

  async checkHealth(): Promise<SchedulerHealth> {
    const schedules = this.scheduler.getSchedules();
    const results: JobHealthStatus[] = [];

    for (const schedule of schedules) {
      const status = await this.checkJobHealth(schedule);
      results.push(status);
    }

    return {
      healthy: results.every((r) => r.healthy),
      jobs: results,
      overallIssues: this.aggregateIssues(results),
    };
  }

  private async checkJobHealth(schedule: JobSchedule): Promise<JobHealthStatus> {
    const recentRuns = await this.runHistory.getRecent(schedule.job.name, 10);
    const issues: string[] = [];

    // Check if job is running on schedule
    const lastRun = recentRuns[0];
    const expectedInterval = this.getExpectedInterval(schedule.cronExpression);

    if (lastRun) {
      const timeSinceLastRun = Date.now() - lastRun.endTime.getTime();
      if (timeSinceLastRun > expectedInterval * 2) {
        issues.push(`Job hasn't run in ${formatDuration(timeSinceLastRun)}`);
      }
    } else {
      issues.push('Job has never run');
    }

    // Check consecutive failures
    const consecutiveFailures = this.countConsecutiveFailures(recentRuns);
    if (consecutiveFailures >= 3) {
      issues.push(`${consecutiveFailures} consecutive failures`);
    }

    // Check duration trends
    const avgDuration = this.calculateAverageDuration(recentRuns);
    const lastDuration = lastRun?.duration ?? 0;
    if (lastDuration > avgDuration * 3) {
      issues.push('Last run took 3x longer than average');
    }

    return {
      job: schedule.job.name,
      healthy: issues.length === 0,
      lastRun: lastRun?.startTime,
      lastStatus: lastRun?.result.status,
      nextScheduledRun: this.getNextRun(schedule),
      consecutiveFailures,
      averageDuration: avgDuration,
      issues,
    };
  }
}
```

### Alerting Rules

```yaml
# Example Prometheus alerting rules

groups:
  - name: scheduled_jobs
    rules:
      - alert: JobFailedRepeatedly
        expr: |
          increase(job_execution_total{status="failed"}[1h]) >= 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Job {{ $labels.job }} has failed 3+ times in the last hour'

      - alert: JobNotRunning
        expr: |
          time() - job_last_run_timestamp > 2 * job_expected_interval_seconds
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Job {{ $labels.job }} hasn't run when expected"

      - alert: JobDurationAnomaly
        expr: |
          job_duration_seconds > job_duration_seconds:avg_over_time_1h * 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'Job {{ $labels.job }} is taking 3x longer than normal'

      - alert: DeadLetterQueueGrowing
        expr: |
          dead_letter_queue_depth > 10
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: 'Dead letter queue has {{ $value }} items waiting'
```

### Audit Trail

```typescript
// src/infrastructure/audit/JobAuditLog.ts

export interface JobAuditEntry {
  id: string;
  timestamp: Date;
  job: string;
  runId: string;
  event: 'started' | 'completed' | 'failed' | 'retried' | 'skipped';
  details: {
    scheduledTime?: Date;
    duration?: number;
    recordsProcessed?: number;
    error?: string;
    skipReason?: string;
  };
  metadata: {
    nodeId: string;
    version: string;
    environment: string;
  };
}

export class JobAuditLogger {
  async log(entry: Omit<JobAuditEntry, 'id' | 'metadata'>): Promise<void> {
    const fullEntry: JobAuditEntry = {
      id: generateId(),
      ...entry,
      metadata: {
        nodeId: process.env.NODE_ID,
        version: process.env.VERSION,
        environment: process.env.ENVIRONMENT,
      },
    };

    await this.storage.append(fullEntry);

    // Also emit as structured log for real-time processing
    this.logger.info('Job audit event', fullEntry);
  }

  async getHistory(
    job: string,
    options: { from: Date; to: Date; limit: number }
  ): Promise<JobAuditEntry[]> {
    return this.storage.query({
      job,
      timestamp: { $gte: options.from, $lte: options.to },
      limit: options.limit,
    });
  }
}
```

---

## Platform-Specific Implementations

### Cloudflare Workers (Cron Triggers)

Cloudflare Workers support native cron triggers through the `scheduled` event:

```typescript
// src/index.ts (Cloudflare Worker)

import { Scheduler } from './scheduling/Scheduler';
import { createSchedules } from './config/schedules';

export default {
  // Handle cron triggers
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const scheduler = new Scheduler(env);
    const schedules = createSchedules(env);

    // Find which job(s) should run based on cron
    const matchingJobs = schedules.filter(s =>
      matchesCron(s.cronExpression, new Date(event.scheduledTime))
    );

    // Execute jobs (waitUntil prevents early termination)
    for (const schedule of matchingJobs) {
      ctx.waitUntil(
        scheduler.runJob(schedule, new Date(event.scheduledTime))
      );
    }
  },

  // Also handle HTTP for manual triggers
  async fetch(request: Request, env: Env): Promise<Response> {
    // Manual job trigger endpoint (admin only)
    const url = new URL(request.url);
    if (url.pathname.startsWith('/admin/jobs/')) {
      return handleManualTrigger(request, env);
    }
    return new Response('Not found', { status: 404 });
  }
};

// wrangler.jsonc configuration
/*
{
  "name": "scheduled-jobs",
  "triggers": {
    "crons": [
      "0 6 * * *",      // Daily report at 6 AM UTC
      "*/15 * * * *",   // Sync every 15 minutes
      "0 3 * * *"       // Cleanup at 3 AM UTC
    ]
  }
}
*/
```

### Node.js with node-cron

```typescript
// src/index.ts (Node.js)

import cron from 'node-cron';
import { Scheduler } from './scheduling/Scheduler';
import { SystemClock } from './time/SystemClock';
import { createSchedules } from './config/schedules';

async function main() {
  const clock = new SystemClock();
  const scheduler = new Scheduler(clock, dependencies);
  const schedules = createSchedules(dependencies);

  for (const schedule of schedules) {
    if (!schedule.enabled) continue;

    cron.schedule(
      schedule.cronExpression,
      async () => {
        try {
          await scheduler.runJob(schedule, clock.now());
        } catch (error) {
          console.error(`Job ${schedule.job.name} failed:`, error);
        }
      },
      {
        timezone: schedule.timezone,
        scheduled: true,
      }
    );

    console.log(`Scheduled: ${schedule.job.name} [${schedule.cronExpression}]`);
  }

  console.log('Scheduler started');

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('Shutting down scheduler...');
    process.exit(0);
  });
}

main().catch(console.error);
```

### AWS Lambda with EventBridge

```typescript
// src/handler.ts (AWS Lambda)

import { ScheduledHandler } from 'aws-lambda';
import { Scheduler } from './scheduling/Scheduler';

// Each job gets its own Lambda function triggered by EventBridge
export const dailyReportHandler: ScheduledHandler = async (event) => {
  const scheduler = new Scheduler(await createDependencies());
  const job = new DailySummaryReportJob(/* deps */);

  const result = await scheduler.runJob(
    { job, timeout: Duration.minutes(10) },
    new Date(event.time)
  );

  if (result.status === 'failed') {
    // Throw to trigger Lambda retry and DLQ
    throw new Error(`Job failed: ${result.errors?.[0]?.message}`);
  }

  return result;
};

// terraform configuration
/*
resource "aws_cloudwatch_event_rule" "daily_report" {
  name                = "daily-report-schedule"
  schedule_expression = "cron(0 6 * * ? *)"  # 6 AM UTC daily
}

resource "aws_cloudwatch_event_target" "daily_report" {
  rule      = aws_cloudwatch_event_rule.daily_report.name
  target_id = "daily-report-lambda"
  arn       = aws_lambda_function.daily_report.arn
}
*/
```

### Kubernetes CronJobs

```yaml
# k8s/cronjobs/daily-report.yaml

apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-report
spec:
  schedule: '0 6 * * *'
  timeZone: 'America/New_York'
  concurrencyPolicy: Forbid # Don't overlap runs
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      activeDeadlineSeconds: 1800 # 30 min timeout
      backoffLimit: 2
      template:
        spec:
          restartPolicy: Never
          containers:
            - name: job
              image: myapp/jobs:latest
              command: ['node', 'dist/jobs/daily-report.js']
              env:
                - name: NODE_ENV
                  value: 'production'
                - name: DATABASE_URL
                  valueFrom:
                    secretKeyRef:
                      name: db-credentials
                      key: url
              resources:
                requests:
                  memory: '256Mi'
                  cpu: '100m'
                limits:
                  memory: '512Mi'
                  cpu: '500m'
```

---

## Distributed Scheduling Patterns

### Leader Election

In distributed systems, ensure only one node runs scheduled jobs:

```typescript
// src/scheduling/LeaderElection.ts

export interface LeaderElector {
  isLeader(): boolean;
  waitForLeadership(): Promise<void>;
  releaseLeadership(): Promise<void>;
}

// Redis-based implementation
export class RedisLeaderElector implements LeaderElector {
  private leaderId: string | null = null;
  private readonly nodeId = generateNodeId();
  private renewalInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly redis: Redis,
    private readonly key: string,
    private readonly ttl: number = 30000 // 30 seconds
  ) {}

  async tryAcquireLeadership(): Promise<boolean> {
    // SET NX with TTL - only succeeds if key doesn't exist
    const result = await this.redis.set(this.key, this.nodeId, 'PX', this.ttl, 'NX');

    if (result === 'OK') {
      this.leaderId = this.nodeId;
      this.startRenewal();
      return true;
    }

    // Check if we already hold leadership
    const current = await this.redis.get(this.key);
    return current === this.nodeId;
  }

  isLeader(): boolean {
    return this.leaderId === this.nodeId;
  }

  private startRenewal() {
    this.renewalInterval = setInterval(async () => {
      // Extend TTL if still leader
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("pexpire", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;

      const renewed = await this.redis.eval(script, 1, this.key, this.nodeId, this.ttl.toString());

      if (!renewed) {
        this.leaderId = null;
        this.stopRenewal();
      }
    }, this.ttl / 3); // Renew at 1/3 TTL
  }

  async releaseLeadership(): Promise<void> {
    this.stopRenewal();

    // Only delete if we're the current leader
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    await this.redis.eval(script, 1, this.key, this.nodeId);
    this.leaderId = null;
  }

  private stopRenewal() {
    if (this.renewalInterval) {
      clearInterval(this.renewalInterval);
      this.renewalInterval = null;
    }
  }
}
```

### Distributed Locking for Jobs

```typescript
// src/scheduling/DistributedLock.ts

export interface DistributedLock {
  acquired: boolean;
  release(): Promise<void>;
}

export class RedisDistributedLock {
  constructor(
    private readonly redis: Redis,
    private readonly lockPrefix: string = 'job-lock:'
  ) {}

  async acquire(jobName: string, duration: Duration): Promise<DistributedLock> {
    const lockKey = `${this.lockPrefix}${jobName}`;
    const lockValue = generateLockValue();
    const ttl = duration.toMilliseconds();

    const acquired = (await this.redis.set(lockKey, lockValue, 'PX', ttl, 'NX')) === 'OK';

    return {
      acquired,
      release: async () => {
        if (!acquired) return;

        // Release only if we hold the lock
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        await this.redis.eval(script, 1, lockKey, lockValue);
      },
    };
  }
}
```

### Sharded Scheduling

For high-volume jobs that can process data in parallel:

```typescript
// src/scheduling/ShardedJob.ts

export interface ShardConfig {
  totalShards: number;
  shardId: number;
}

export abstract class ShardedJob implements Job {
  abstract name: string;

  async execute(context: JobContext): Promise<JobResult> {
    // Determine this instance's shard
    const shardConfig = await this.getShardConfig(context);

    context.logger.info('Processing shard', {
      shardId: shardConfig.shardId,
      totalShards: shardConfig.totalShards,
    });

    // Process only records for this shard
    const records = await this.getRecordsForShard(shardConfig);
    return this.processRecords(records, context);
  }

  protected abstract getRecordsForShard(config: ShardConfig): Promise<any[]>;
  protected abstract processRecords(records: any[], context: JobContext): Promise<JobResult>;

  private async getShardConfig(context: JobContext): Promise<ShardConfig> {
    // Use consistent hashing or round-robin assignment
    const totalNodes = await this.getActiveNodeCount();
    const nodeIndex = await this.getNodeIndex(context.nodeId);

    return {
      totalShards: totalNodes,
      shardId: nodeIndex,
    };
  }
}

// Example implementation
class ShardedEmailDigestJob extends ShardedJob {
  name = 'email-digest';

  protected async getRecordsForShard(config: ShardConfig): Promise<User[]> {
    // Use modulo to assign users to shards
    return this.db.query(
      `
      SELECT * FROM users 
      WHERE digest_enabled = true 
        AND MOD(id, ?) = ?
    `,
      [config.totalShards, config.shardId]
    );
  }

  protected async processRecords(users: User[], context: JobContext): Promise<JobResult> {
    let processed = 0;

    for (const user of users) {
      await this.sendDigest(user);
      processed++;
    }

    return { status: 'success', recordsProcessed: processed };
  }
}
```

---

## Complete Example Application

### Notification Reminder System

This example implements a complete reminder notification system with scheduled delivery:

```typescript
// src/domain/notifications/Reminder.ts

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  message: string;
  scheduledFor: Date; // When to send (UTC)
  timezone: string; // User's timezone for display
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: Date;
  sentAt?: Date;
  attempts: number;
}

// src/domain/notifications/ReminderScheduler.ts

export class ReminderScheduler {
  /**
   * Calculate the next delivery time respecting user preferences
   */
  calculateDeliveryTime(requestedTime: Date, userPrefs: UserNotificationPrefs, now: Date): Date {
    // Convert to user's local time
    const localTime = toTimezone(requestedTime, userPrefs.timezone);

    // Check quiet hours
    if (this.isInQuietHours(localTime, userPrefs)) {
      return this.nextAvailableTime(localTime, userPrefs);
    }

    // Ensure it's in the future
    if (requestedTime <= now) {
      throw new ReminderInPastError('Cannot schedule reminder in the past');
    }

    return requestedTime;
  }

  private isInQuietHours(time: Date, prefs: UserNotificationPrefs): boolean {
    const hour = time.getHours();
    const quietStart = parseInt(prefs.quietHoursStart.split(':')[0]);
    const quietEnd = parseInt(prefs.quietHoursEnd.split(':')[0]);

    if (quietStart < quietEnd) {
      return hour >= quietStart && hour < quietEnd;
    } else {
      // Quiet hours span midnight
      return hour >= quietStart || hour < quietEnd;
    }
  }

  private nextAvailableTime(current: Date, prefs: UserNotificationPrefs): Date {
    const quietEnd = parseInt(prefs.quietHoursEnd.split(':')[0]);
    const next = new Date(current);

    if (current.getHours() >= quietEnd) {
      next.setDate(next.getDate() + 1);
    }

    next.setHours(quietEnd, 0, 0, 0);
    return next;
  }
}

// src/jobs/notifications/ReminderDeliveryJob.ts

export class ReminderDeliveryJob implements Job {
  readonly name = 'reminder-delivery';

  constructor(
    private readonly reminderRepo: ReminderRepository,
    private readonly notificationService: NotificationService,
    private readonly userRepo: UserRepository
  ) {}

  async execute(context: JobContext): Promise<JobResult> {
    const { clock, logger, metrics } = context;
    const now = clock.now();

    // Find reminders due for delivery
    // Look slightly ahead to account for job execution time
    const windowEnd = new Date(now.getTime() + 60000); // +1 minute

    const dueReminders = await this.reminderRepo.findPending({
      scheduledBefore: windowEnd,
    });

    logger.info('Processing due reminders', { count: dueReminders.length });

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as JobError[],
    };

    for (const reminder of dueReminders) {
      try {
        const user = await this.userRepo.findById(reminder.userId);
        if (!user) {
          await this.reminderRepo.markFailed(reminder.id, 'User not found');
          results.failed++;
          continue;
        }

        await this.notificationService.send({
          userId: user.id,
          channel: user.preferredChannel,
          title: reminder.title,
          body: reminder.message,
        });

        await this.reminderRepo.markSent(reminder.id, now);
        results.sent++;

        metrics.increment('reminders.sent', { channel: user.preferredChannel });
      } catch (error) {
        logger.error('Failed to send reminder', error, {
          reminderId: reminder.id,
        });

        await this.reminderRepo.incrementAttempts(reminder.id);

        if (reminder.attempts >= 3) {
          await this.reminderRepo.markFailed(reminder.id, error.message);
        }

        results.failed++;
        results.errors.push({
          code: 'DELIVERY_FAILED',
          message: error.message,
          context: { reminderId: reminder.id },
        });
      }
    }

    return {
      status: results.failed > 0 ? 'partial' : 'success',
      recordsProcessed: results.sent,
      errors: results.errors.length > 0 ? results.errors : undefined,
    };
  }
}

// src/jobs/notifications/ReminderDeliveryJob.spec.ts

describe('ReminderDeliveryJob', () => {
  let clock: TestClock;
  let job: ReminderDeliveryJob;
  let reminderRepo: MockReminderRepository;
  let notificationService: MockNotificationService;
  let userRepo: MockUserRepository;

  beforeEach(() => {
    clock = new TestClock('2024-03-15T10:00:00Z');
    reminderRepo = new MockReminderRepository();
    notificationService = new MockNotificationService();
    userRepo = new MockUserRepository();

    job = new ReminderDeliveryJob(reminderRepo, notificationService, userRepo);
  });

  describe('delivery window', () => {
    it('delivers reminders scheduled before current time', async () => {
      const reminder = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T09:55:00Z')) // 5 min ago
        .build();
      reminderRepo.add(reminder);
      userRepo.add(UserBuilder.aUser().withId(reminder.userId).build());

      const context = createJobContext({ clock });
      await job.execute(context);

      expect(notificationService.sentNotifications).toHaveLength(1);
      expect(reminderRepo.getSentReminders()).toContain(reminder.id);
    });

    it('delivers reminders scheduled within next minute', async () => {
      const reminder = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T10:00:30Z')) // 30 sec from now
        .build();
      reminderRepo.add(reminder);
      userRepo.add(UserBuilder.aUser().withId(reminder.userId).build());

      const context = createJobContext({ clock });
      await job.execute(context);

      expect(notificationService.sentNotifications).toHaveLength(1);
    });

    it('does not deliver reminders scheduled far in future', async () => {
      const reminder = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T12:00:00Z')) // 2 hours from now
        .build();
      reminderRepo.add(reminder);

      const context = createJobContext({ clock });
      await job.execute(context);

      expect(notificationService.sentNotifications).toHaveLength(0);
    });
  });

  describe('failure handling', () => {
    it('marks reminder as failed after 3 attempts', async () => {
      const reminder = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T09:55:00Z'))
        .withAttempts(2) // Already tried twice
        .build();
      reminderRepo.add(reminder);
      userRepo.add(UserBuilder.aUser().withId(reminder.userId).build());
      notificationService.simulateFailure(new Error('Service unavailable'));

      const context = createJobContext({ clock });
      await job.execute(context);

      expect(reminderRepo.getFailedReminders()).toContain(reminder.id);
    });

    it('continues processing after individual failure', async () => {
      const reminder1 = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T09:55:00Z'))
        .withUserId('user-1')
        .build();
      const reminder2 = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T09:56:00Z'))
        .withUserId('user-2')
        .build();

      reminderRepo.add(reminder1, reminder2);
      userRepo.add(
        UserBuilder.aUser().withId('user-1').build(),
        UserBuilder.aUser().withId('user-2').build()
      );

      // First reminder fails, second succeeds
      notificationService.failForUser('user-1');

      const context = createJobContext({ clock });
      const result = await job.execute(context);

      expect(result.status).toBe('partial');
      expect(result.recordsProcessed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('user preferences', () => {
    it('uses user preferred notification channel', async () => {
      const reminder = ReminderBuilder.aReminder()
        .scheduledFor(new Date('2024-03-15T09:55:00Z'))
        .build();
      const user = UserBuilder.aUser().withId(reminder.userId).withPreferredChannel('sms').build();

      reminderRepo.add(reminder);
      userRepo.add(user);

      const context = createJobContext({ clock });
      await job.execute(context);

      expect(notificationService.sentNotifications[0].channel).toBe('sms');
    });
  });
});
```

### Schedule Configuration

```typescript
// src/config/schedules.ts

import { ReminderDeliveryJob } from '../jobs/notifications/ReminderDeliveryJob';
import { DigestEmailJob } from '../jobs/notifications/DigestEmailJob';
import { SessionCleanupJob } from '../jobs/cleanup/SessionCleanupJob';
import { AnalyticsSyncJob } from '../jobs/syncs/AnalyticsSyncJob';

export function createSchedules(deps: Dependencies): JobSchedule[] {
  return [
    // Reminders: Check every minute for due reminders
    {
      job: new ReminderDeliveryJob(deps.reminderRepo, deps.notificationService, deps.userRepo),
      cronExpression: '* * * * *', // Every minute
      timezone: 'UTC',
      enabled: true,
      timeout: Duration.seconds(45),
      retryPolicy: { maxAttempts: 1 }, // Will pick up on next run
      lockDuration: Duration.seconds(50),
    },

    // Digest emails: 9 AM in each major timezone
    {
      job: new DigestEmailJob(deps.digestComposer, deps.emailService),
      cronExpression: '0 9 * * 1-5', // 9 AM weekdays
      timezone: 'America/New_York',
      enabled: true,
      timeout: Duration.minutes(30),
      retryPolicy: { maxAttempts: 3, backoff: 'exponential' },
      lockDuration: Duration.minutes(35),
    },
    {
      job: new DigestEmailJob(deps.digestComposer, deps.emailService),
      cronExpression: '0 9 * * 1-5',
      timezone: 'Europe/London',
      enabled: true,
      timeout: Duration.minutes(30),
      retryPolicy: { maxAttempts: 3, backoff: 'exponential' },
      lockDuration: Duration.minutes(35),
    },

    // Session cleanup: Daily at 3 AM UTC
    {
      job: new SessionCleanupJob(deps.sessionStore),
      cronExpression: '0 3 * * *',
      timezone: 'UTC',
      enabled: true,
      timeout: Duration.hours(1),
      retryPolicy: { maxAttempts: 1 },
      lockDuration: Duration.hours(1),
    },

    // Analytics sync: Every 15 minutes
    {
      job: new AnalyticsSyncJob(deps.analyticsClient, deps.dataWarehouse),
      cronExpression: '*/15 * * * *',
      timezone: 'UTC',
      enabled: true,
      timeout: Duration.minutes(10),
      retryPolicy: { maxAttempts: 2, backoff: 'linear' },
      lockDuration: Duration.minutes(12),
    },
  ];
}
```

---

## Best Practices and Anti-Patterns

### Do: Make Jobs Idempotent

Jobs may run multiple times due to retries, clock skew, or operational errors. Design for this.

```typescript
// ❌ Anti-pattern: Not idempotent
async function processNewOrders(since: Date) {
  const orders = await db.query('SELECT * FROM orders WHERE created_at > ?', [since]);
  for (const order of orders) {
    await emailService.send(order.userId, 'Order confirmation');
    // Running twice sends duplicate emails!
  }
}

// ✅ Pattern: Idempotent with tracking
async function processNewOrders(since: Date) {
  const orders = await db.query(
    `
    SELECT * FROM orders 
    WHERE created_at > ? 
      AND confirmation_sent_at IS NULL
  `,
    [since]
  );

  for (const order of orders) {
    await emailService.send(order.userId, 'Order confirmation');
    await db.update('UPDATE orders SET confirmation_sent_at = ? WHERE id = ?', [
      new Date(),
      order.id,
    ]);
  }
}
```

### Do: Pass Time as a Parameter

Never call `new Date()` or `Date.now()` inside business logic. Pass time from the caller.

```typescript
// ❌ Anti-pattern: Hidden time dependency
class ReportGenerator {
  generate() {
    const now = new Date(); // Untestable!
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    return this.query(yesterday, now);
  }
}

// ✅ Pattern: Time as parameter
class ReportGenerator {
  generate(period: DateRange) {
    return this.query(period.start, period.end);
  }
}

// Caller (job) determines the time
function dailyReportJob(clock: Clock) {
  const period = DateRange.forPreviousDay(clock.now());
  return reportGenerator.generate(period);
}
```

### Do: Use Distributed Locks

Prevent multiple instances from running the same job simultaneously.

```typescript
// ❌ Anti-pattern: No coordination
cron.schedule('0 6 * * *', async () => {
  await generateDailyReport(); // Runs on every node!
});

// ✅ Pattern: Distributed lock
cron.schedule('0 6 * * *', async () => {
  const lock = await lockManager.acquire('daily-report', Duration.minutes(30));
  if (!lock.acquired) {
    logger.info('Job already running on another node');
    return;
  }

  try {
    await generateDailyReport();
  } finally {
    await lock.release();
  }
});
```

### Do: Set Appropriate Timeouts

Jobs that run forever cause cascading problems.

```typescript
// ❌ Anti-pattern: No timeout
async function syncAllRecords() {
  const records = await fetchRecords(); // What if there are millions?
  for (const record of records) {
    await processRecord(record); // Could run for hours
  }
}

// ✅ Pattern: Timeout with batching
async function syncAllRecords(context: JobContext) {
  const timeout = Duration.minutes(10);
  const deadline = context.clock.now().getTime() + timeout.toMilliseconds();

  let cursor: string | undefined;

  while (context.clock.now().getTime() < deadline) {
    const batch = await fetchRecordsBatch(cursor, 100);
    if (batch.records.length === 0) break;

    await processBatch(batch.records);
    cursor = batch.nextCursor;

    // Save progress for next run
    await saveCheckpoint(cursor);
  }

  if (cursor) {
    context.logger.info('Job will continue from checkpoint on next run');
  }
}
```

### Do: Log Meaningfully

Structured logs make debugging scheduled tasks possible.

```typescript
// ❌ Anti-pattern: Poor logging
console.log('Starting job');
// ... processing ...
console.log('Done');

// ✅ Pattern: Structured contextual logging
logger.info('Job started', {
  job: 'daily-report',
  runId,
  scheduledTime: context.scheduledTime.toISOString(),
  actualStartTime: context.startTime.toISOString(),
});

logger.info('Processing batch', {
  job: 'daily-report',
  runId,
  batchNumber: 3,
  recordCount: 100,
});

logger.info('Job completed', {
  job: 'daily-report',
  runId,
  duration: durationMs,
  recordsProcessed: 1523,
  status: 'success',
});
```

### Don't: Hardcode Schedules in Code

Schedules change. Make them configurable.

```typescript
// ❌ Anti-pattern: Hardcoded
cron.schedule('0 6 * * *', dailyReport); // Change requires deployment

// ✅ Pattern: Configurable
const schedules = loadSchedulesFromConfig();
for (const schedule of schedules) {
  cron.schedule(schedule.cron, () => runJob(schedule.job));
}
```

### Don't: Ignore Timezone Complexity

Timezones and DST cause subtle, hard-to-debug issues.

```typescript
// ❌ Anti-pattern: Ignoring timezones
const schedule = '0 9 * * *'; // 9 AM... in what timezone?

// ✅ Pattern: Explicit timezone handling
const schedule = {
  cron: '0 9 * * *',
  timezone: 'America/New_York', // Explicit
  description: '9 AM Eastern (adjusts for DST)',
};
```

### Don't: Skip Monitoring

Scheduled tasks fail silently. Proactive monitoring catches issues early.

```typescript
// ❌ Anti-pattern: Hope it works
cron.schedule('0 6 * * *', dailyReport);

// ✅ Pattern: Comprehensive monitoring
cron.schedule('0 6 * * *', async () => {
  const startTime = Date.now();
  metrics.increment('job.started', { job: 'daily-report' });

  try {
    const result = await dailyReport();

    metrics.increment('job.completed', { job: 'daily-report', status: 'success' });
    metrics.timing('job.duration', Date.now() - startTime, { job: 'daily-report' });
    metrics.gauge('job.records_processed', result.recordCount, { job: 'daily-report' });
  } catch (error) {
    metrics.increment('job.completed', { job: 'daily-report', status: 'failed' });
    alerting.sendAlert('daily-report-failed', { error: error.message });
    throw error;
  }
});
```

### Don't: Process Unbounded Data

Always limit the scope of what a single job run processes.

```typescript
// ❌ Anti-pattern: Unbounded query
const allPendingItems = await db.query('SELECT * FROM items WHERE status = "pending"');
// Could be millions of rows!

// ✅ Pattern: Bounded with cursor
const BATCH_SIZE = 1000;
let processed = 0;
let cursor: string | undefined;

do {
  const batch = await db.query(
    `
    SELECT * FROM items 
    WHERE status = 'pending' 
      AND id > COALESCE(?, '')
    ORDER BY id
    LIMIT ?
  `,
    [cursor, BATCH_SIZE]
  );

  if (batch.length === 0) break;

  await processBatch(batch);
  cursor = batch[batch.length - 1].id;
  processed += batch.length;
} while (processed < MAX_PER_RUN); // Safety limit
```

---

## Conclusion

Scheduled tasks are critical infrastructure that deserve the same care and rigor as user-facing features. This guide has presented patterns for:

1. **Architectural clarity**: Understanding when to use clock-driven vs event-driven patterns, and how to combine them effectively.

2. **Robust implementations**: Using job interfaces, configuration-driven schedules, and proper error handling.

3. **Testable time logic**: Abstracting the clock, controlling time in tests, and handling edge cases like timezone transitions.

4. **Operational excellence**: Comprehensive monitoring, structured logging, and distributed coordination.

5. **Common use cases**: Reports, syncs, notifications, and cleanup with practical implementation patterns.

The key insight is that scheduled tasks benefit from the same principles that make all software maintainable: separation of concerns, dependency injection, comprehensive testing, and observable operations. By treating scheduled tasks as first-class components rather than afterthoughts, you build systems that are reliable, debuggable, and evolvable.

---

_This guide reflects best practices as of January 2026. For the latest documentation on specific platforms, consult the official Cloudflare Workers, AWS Lambda, Kubernetes, or Node.js documentation._
