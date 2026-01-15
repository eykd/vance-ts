# Feature Flags for Migration

**Purpose**: Gradual rollout of organization features using KV-based feature flags.

## When to Use

Use this pattern when:

- You want to test with a subset of users first
- You need ability to quickly rollback
- Different users should see different experiences
- You want percentage-based rollout

## Flag Storage with KV

```typescript
// src/application/services/FeatureFlags.ts

export interface FeatureFlag {
  enabled: boolean;
  rolloutPercentage?: number;
  enabledUserIds?: string[];
  disabledUserIds?: string[];
}

export class FeatureFlags {
  constructor(private kv: KVNamespace) {}

  async isEnabled(flagName: string, userId: string): Promise<boolean> {
    // Check user-level override first
    const userOverride = await this.kv.get(`feature:${flagName}:user:${userId}`);
    if (userOverride !== null) {
      return userOverride === 'true';
    }

    // Check flag configuration
    const flagData = await this.kv.get(`feature:${flagName}`);
    if (!flagData) {
      return false; // Flag doesn't exist = disabled
    }

    const flag: FeatureFlag = JSON.parse(flagData);

    // Check if globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check explicit user lists
    if (flag.disabledUserIds?.includes(userId)) {
      return false;
    }
    if (flag.enabledUserIds?.includes(userId)) {
      return true;
    }

    // Check percentage rollout
    if (flag.rolloutPercentage !== undefined) {
      const bucket = await this.getUserBucket(userId);
      return bucket < flag.rolloutPercentage;
    }

    return flag.enabled;
  }

  private async getUserBucket(userId: string): Promise<number> {
    // Deterministic bucket based on user ID
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return hashArray[0]! % 100;
  }

  async setFlag(flagName: string, config: FeatureFlag): Promise<void> {
    await this.kv.put(`feature:${flagName}`, JSON.stringify(config));
  }

  async setUserOverride(flagName: string, userId: string, enabled: boolean): Promise<void> {
    await this.kv.put(`feature:${flagName}:user:${userId}`, enabled.toString());
  }
}
```

## Organizations Feature Flag

```typescript
// Specific flag for organizations migration
const ORGS_FLAG = 'organizations';

export async function isOrganizationsEnabled(kv: KVNamespace, userId: string): Promise<boolean> {
  const flags = new FeatureFlags(kv);
  return flags.isEnabled(ORGS_FLAG, userId);
}
```

## Dual-Path Handler

```typescript
// src/presentation/handlers/ProjectHandlers.ts

export async function handleListProjects(c: Context): Promise<Response> {
  const session = c.get('session');
  const useOrgs = await isOrganizationsEnabled(c.env.KV, session.userId);

  if (useOrgs) {
    // New organization-based flow
    const org = await ensureUserHasOrganization(c.env.DB, session.userId);
    await migrateUserResourcesToOrg(c.env.DB, session.userId);

    const projects = await c.env.DB.prepare('SELECT * FROM projects WHERE organization_id = ?')
      .bind(org.id)
      .all();

    return renderProjectsWithOrg(c, projects.results, org);
  } else {
    // Legacy user-based flow
    const projects = await c.env.DB.prepare('SELECT * FROM projects WHERE owner_id = ?')
      .bind(session.userId)
      .all();

    return renderProjectsLegacy(c, projects.results);
  }
}
```

## Rollout Commands

```typescript
// scripts/rollout-organizations.ts

import { FeatureFlags } from '../src/application/services/FeatureFlags';

async function rollout(kv: KVNamespace, action: string): Promise<void> {
  const flags = new FeatureFlags(kv);

  switch (action) {
    case 'staff-only':
      await flags.setFlag('organizations', {
        enabled: true,
        enabledUserIds: ['staff-user-1', 'staff-user-2'],
      });
      break;

    case '10-percent':
      await flags.setFlag('organizations', {
        enabled: true,
        rolloutPercentage: 10,
      });
      break;

    case '50-percent':
      await flags.setFlag('organizations', {
        enabled: true,
        rolloutPercentage: 50,
      });
      break;

    case 'everyone':
      await flags.setFlag('organizations', {
        enabled: true,
        rolloutPercentage: 100,
      });
      break;

    case 'rollback':
      await flags.setFlag('organizations', {
        enabled: false,
      });
      break;

    case 'enable-user':
      const userId = process.argv[3];
      await flags.setUserOverride('organizations', userId!, true);
      break;
  }
}
```

## Monitoring

```typescript
// Track feature flag usage for metrics
export async function trackFeatureFlag(
  analytics: AnalyticsEngine,
  flagName: string,
  userId: string,
  enabled: boolean
): Promise<void> {
  analytics.writeDataPoint({
    blobs: [flagName, userId],
    doubles: [enabled ? 1 : 0],
    indexes: [flagName],
  });
}

// In handler
const useOrgs = await isOrganizationsEnabled(c.env.KV, session.userId);
await trackFeatureFlag(c.env.ANALYTICS, 'organizations', session.userId, useOrgs);
```

## Cleanup After Migration

```typescript
// After 100% rollout is stable, remove dual paths
export async function handleListProjects(c: Context): Promise<Response> {
  const session = c.get('session');

  // Only org-based flow remains
  const org = await ensureUserHasOrganization(c.env.DB, session.userId);
  const projects = await c.env.DB.prepare('SELECT * FROM projects WHERE organization_id = ?')
    .bind(org.id)
    .all();

  return renderProjectsWithOrg(c, projects.results, org);
}
```

## Rollout Timeline

| Week | Rollout    | Actions                       |
| ---- | ---------- | ----------------------------- |
| 1    | Staff only | Test internally               |
| 2    | 5%         | Monitor errors, user feedback |
| 3    | 25%        | Check performance             |
| 4    | 50%        | Verify edge cases             |
| 5    | 100%       | Full rollout                  |
| 6+   | Cleanup    | Remove legacy code            |
