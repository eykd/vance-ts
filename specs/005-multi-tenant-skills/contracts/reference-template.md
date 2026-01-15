# Reference File Template Contract

This document defines the structure contract for reference files in the org-\* skill family.

## File Location

```
.claude/skills/org-{skill-name}/references/{reference-name}.md
```

## Required Sections

### 1. H1 Title (Required)

Title case version of filename without extension.

```markdown
# Core Types
```

### 2. Purpose Line (Required)

Single sentence starting with action verb.

```markdown
**Purpose**: Define the core types for authorization: Actor, Action, Resource, and PolicyContext.
```

### 3. When to Use Section (Required)

Context paragraph explaining triggers for using this reference.

```markdown
## When to Use

Use this reference when:

- Starting a new authorization implementation
- Adding a new actor type (e.g., API keys)
- Extending the action set
- Defining new resource types
```

### 4. Pattern Section (Required)

Complete, compilable TypeScript code.

```markdown
## Pattern

\`\`\`typescript
// src/domain/authorization/types.ts

/\*\*

- An Actor is the entity attempting to perform an action.
  \*/
  export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] };
  \`\`\`
```

### 5. Additional Sections (Optional)

- **Variations**: Alternative implementations
- **Edge Cases**: Boundary conditions
- **Anti-Patterns**: What to avoid
- **Testing**: Test patterns for this code

## Code Requirements

1. **Explicit return types** on all functions
2. **JSDoc comments** on exported types/functions
3. **File path comment** at top of code block
4. **Compilable standalone** (includes necessary imports)
5. **40-150 lines** typical range

## Example Reference File

```markdown
# Core Types

**Purpose**: Define the authorization type system: Actor, Action, Resource, and PolicyContext.

## When to Use

Use this reference when:

- Starting authorization implementation
- Adding new actor types (users, systems, API keys)
- Extending available actions
- Defining new resource types

## Pattern

\`\`\`typescript
// src/domain/authorization/types.ts

/\*\*

- An Actor is the entity attempting to perform an action.
- Actors can be users, system processes, or API keys.
  \*/
  export type Actor =
  | { type: 'user'; id: string }
  | { type: 'system'; reason: string }
  | { type: 'api_key'; id: string; scopes: string[] };

/\*\*

- Actions that can be performed on resources.
  \*/
  export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'remove'
  | 'transfer'
  | 'admin';

/\*\*

- Resource types in the system.
  \*/
  export type ResourceType = 'organization' | 'project' | 'document' | 'membership';

/\*\*

- A Resource identifies what the action targets.
  \*/
  export interface Resource {
  type: ResourceType;
  id: string;
  parent?: Resource;
  }

/\*\*

- The result of an authorization check.
  \*/
  export interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  effectiveRole?: string;
  }

/\*\*

- Context for policy evaluation.
  \*/
  export interface PolicyContext {
  organizationMembership?: {
  organizationId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  };
  resourceOwner?: string;
  resourceOrganizationId?: string;
  projectMembership?: {
  role: 'admin' | 'editor' | 'viewer';
  };
  }
  \`\`\`

## Extending Types

### Adding a New Actor Type

\`\`\`typescript
export type Actor =
| { type: 'user'; id: string }
| { type: 'system'; reason: string }
| { type: 'api_key'; id: string; scopes: string[] }
| { type: 'service_account'; id: string; service: string }; // New
\`\`\`

### Adding a New Resource Type

\`\`\`typescript
export type ResourceType =
| 'organization'
| 'project'
| 'document'
| 'membership'
| 'billing'; // New
\`\`\`
```
