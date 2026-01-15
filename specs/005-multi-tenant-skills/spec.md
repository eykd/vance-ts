# Feature Specification: Multi-Tenant Boundary Skills

**Feature Branch**: `005-multi-tenant-skills`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Consider the guide at @docs/multi-tenant-boundaries-guide.md. Consider if we are missing any Claude Skills that could further guide and direct the evolution of this codebase according to the principles in this guide."

## Clarifications

### Session 2026-01-14

- Q: Should skill naming use "tenant" or "organization" prefix consistently? → A: Use "organization" prefix consistently (org-authorization, org-isolation, org-data-model, org-membership, org-testing, org-migration) to align with the guide's terminology where "organization" is the concrete implementation.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Authorization Policy Implementation (Priority: P1)

A developer needs to implement authorization checks for a multi-tenant application. They want guidance on the "Can User X do Action Y on Resource Z" pattern, including Actor types, Action definitions, Resource modeling, and PolicyContext loading.

**Why this priority**: Authorization is the foundational pattern that all other multi-tenant functionality depends on. Without proper authorization, tenant isolation cannot be guaranteed.

**Independent Test**: Can be fully tested by implementing a simple authorization check for a single resource type (e.g., Project) and verifying correct allow/deny decisions across different actor/action/resource combinations.

**Acceptance Scenarios**:

1. **Given** a developer implementing project access control, **When** they invoke the org-authorization skill, **Then** they receive a decision tree guiding Actor/Action/Resource modeling and a complete AuthorizationService implementation pattern.
2. **Given** a developer unsure whether to use role-based or resource-based authorization, **When** they follow the skill's decision tree, **Then** they can determine the appropriate pattern for their use case.
3. **Given** an authorization service implementation, **When** a developer needs to add a new resource type, **Then** the skill provides extension patterns that maintain consistency.

---

### User Story 2 - Tenant Isolation Implementation (Priority: P1)

A developer needs to ensure that users from one organization cannot access data from another organization. They need patterns for query scoping, tenant context management, and cross-tenant access prevention.

**Why this priority**: Tenant isolation is a critical security requirement. Data leakage between tenants is a severe vulnerability that must be prevented at the infrastructure level.

**Independent Test**: Can be fully tested by writing integration tests that attempt cross-tenant data access and verify that all attempts are blocked.

**Acceptance Scenarios**:

1. **Given** a developer writing database queries, **When** they invoke the org-isolation skill, **Then** they receive patterns for automatically scoping all queries to the current organization.
2. **Given** a multi-tenant application, **When** a developer needs to audit tenant isolation, **Then** the skill provides a checklist and testing patterns for verification.
3. **Given** a repository implementation, **When** querying for resources, **Then** the skill guides adding organization_id filters to prevent cross-tenant access.

---

### User Story 3 - Data Model Evolution (Priority: P2)

A developer needs to evolve their application from single-user to multi-tenant. They need guidance on the canonical migration path: single-user ownership, resource-level sharing (collaborators), organizations with memberships, and resource-level permissions within organizations.

**Why this priority**: Most applications start simple and evolve toward multi-tenancy. Understanding the evolution stages prevents over-engineering early and under-engineering late.

**Independent Test**: Can be fully tested by implementing a data model at any stage and verifying it correctly supports the intended access patterns.

**Acceptance Scenarios**:

1. **Given** a single-user application, **When** a developer needs to add resource sharing, **Then** the skill provides Stage 2 collaborators schema and authorization patterns.
2. **Given** an application with collaborators, **When** organizational boundaries are needed, **Then** the skill provides Stage 3 organizations migration guidance.
3. **Given** a developer unsure which stage to implement, **When** they follow the decision tree, **Then** they can determine the appropriate complexity level.

---

### User Story 4 - Organization Membership Roles (Priority: P2)

A developer needs to implement organization membership with role hierarchies (owner, admin, member, viewer). They need patterns for role-based permission checks, privilege escalation prevention, and membership management.

**Why this priority**: Role hierarchies are the primary mechanism for differentiating access levels within an organization. Incorrect implementation leads to privilege escalation vulnerabilities.

**Independent Test**: Can be fully tested by implementing membership management for a single organization and verifying role-based access control works correctly.

**Acceptance Scenarios**:

1. **Given** an organization with multiple members, **When** checking permissions, **Then** the skill provides role hierarchy patterns (owner > admin > member > viewer).
2. **Given** a member trying to modify their own role, **When** the action is attempted, **Then** the skill provides privilege escalation prevention patterns.
3. **Given** an admin inviting a new member, **When** assigning a role, **Then** the skill ensures the assigned role does not exceed the grantor's permissions.

---

### User Story 5 - Authorization Testing (Priority: P2)

A developer needs to test authorization logic thoroughly, including unit tests for policies, integration tests for authorization flows, and acceptance tests for tenant isolation.

**Why this priority**: Authorization bugs are security vulnerabilities. Comprehensive testing is essential to catch regressions and validate correct behavior.

**Independent Test**: Can be fully tested by writing tests for a single authorization policy and verifying all edge cases are covered.

**Acceptance Scenarios**:

1. **Given** a CorePolicy implementation, **When** a developer needs to test it, **Then** the skill provides unit test patterns covering all actor types and role combinations.
2. **Given** a multi-tenant application, **When** testing tenant isolation, **Then** the skill provides integration test patterns that attempt cross-tenant access.
3. **Given** a membership management feature, **When** testing privilege escalation, **Then** the skill provides acceptance test patterns verifying prevention.

---

### User Story 6 - Multi-Tenant Migration (Priority: P3)

A developer needs to migrate an existing single-user application to multi-tenancy without breaking existing users. They need strategies for shadow organizations, feature flags, and database backfill.

**Why this priority**: Migration is a one-time operation but must be done correctly. Incorrect migration can cause data loss or service disruption.

**Independent Test**: Can be fully tested by migrating a test database and verifying all existing data is correctly associated with new organizational structures.

**Acceptance Scenarios**:

1. **Given** an existing single-user application, **When** migrating to organizations, **Then** the skill provides shadow organization strategy patterns.
2. **Given** a gradual rollout requirement, **When** implementing feature flags, **Then** the skill provides patterns for opt-in organization features.
3. **Given** existing user data, **When** running database backfill, **Then** the skill provides migration scripts that preserve data integrity.

---

### Edge Cases

- What happens when a user belongs to multiple organizations?
- How does system handle orphaned resources after organization deletion?
- What happens when transferring organization ownership?
- How does system handle role changes for users with active sessions?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide an org-authorization skill guiding Actor/Action/Resource modeling with decision tree and code examples
- **FR-002**: System MUST provide an org-isolation skill with query scoping patterns and cross-organization prevention mechanisms
- **FR-003**: System MUST provide an org-data-model skill covering the four-stage evolution (single-user, collaborators, organizations, resource permissions)
- **FR-004**: System MUST provide an org-membership skill with role hierarchy patterns and privilege escalation prevention
- **FR-005**: System MUST provide an org-testing skill with unit, integration, and acceptance test patterns
- **FR-006**: System MUST provide an org-migration skill with shadow organization, feature flag, and backfill strategies
- **FR-007**: Each skill MUST follow progressive disclosure structure (SKILL.md decision tree + references/ detailed guides)
- **FR-008**: Each skill MUST be concise and token-efficient with SKILL.md under 150 lines
- **FR-009**: Skills MUST cross-reference related skills to form implementation chains
- **FR-010**: Skills MUST align with existing project patterns (Clean Architecture, TDD, Cloudflare Workers)

### Key Entities

- **Skill**: A Claude Code skill with SKILL.md decision tree and references/ directory
- **Actor**: Entity attempting an action (user, system, api_key) - documented in org-authorization skill
- **Resource**: Target of an action with type and id - documented in org-authorization skill
- **PolicyContext**: Additional context for policy evaluation (memberships, ownership) - documented in org-authorization skill
- **Organization**: Tenant boundary containing members and resources - documented in org-membership skill
- **Membership**: Association between user and organization with role - documented in org-membership skill

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can implement a complete authorization system by following skill chain in under 4 hours
- **SC-002**: All skills follow progressive disclosure with SKILL.md under 150 lines
- **SC-003**: 100% of authorization patterns from multi-tenant-boundaries-guide.md are covered by skills
- **SC-004**: Skills reduce implementation errors by providing copy-paste code patterns that require only customization
- **SC-005**: Each skill can be used independently while also supporting skill chain workflows
- **SC-006**: Developers unfamiliar with multi-tenancy can determine the appropriate complexity level by following decision trees

## Assumptions

- Developers have read the multi-tenant-boundaries-guide.md and understand the conceptual framework
- The existing skill structure (SKILL.md + references/) is the correct format for new skills
- Cloudflare Workers with D1 is the target runtime environment
- TypeScript with strict typing is required for all code examples
- Clean Architecture patterns (domain/application/infrastructure layers) are followed
