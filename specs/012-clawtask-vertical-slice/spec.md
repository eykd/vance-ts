# Feature Specification: ClawTask Vertical Slice — Inbox Capture to Completed Action

**Feature Branch**: `012-clawtask-vertical-slice`
**Created**: 2026-03-02
**Status**: Draft
**Beads Epic**: `tb-0mt`

**Beads Phase Tasks**:

- clarify: `tb-0mt.1`
- plan: `tb-0mt.2`
- red-team: `tb-0mt.3`
- tasks: `tb-0mt.4`
- analyze: `tb-0mt.5`
- implement: `tb-0mt.6`
- security-review: `tb-0mt.7`
- architecture-review: `tb-0mt.8`
- code-quality-review: `tb-0mt.9`

---

## User Scenarios & Testing _(mandatory)_

### User Story US03 — Capture to Inbox (Priority: P1)

A user can instantly capture a thought, task, or commitment to their inbox without any upfront categorisation. The inbox is a trusted "everything goes here first" container.

**Why this priority**: Capture is the first step in any GTD-style workflow. Without it, nothing else has data to work with.

**Independent Test**: Can be fully tested by creating an account, submitting a title via the API, and confirming the inbox item exists with status `inbox`.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** I POST `/api/v1/inbox` with `{ "title": "Buy groceries" }`, **Then** I receive 201 with the created inbox item (id, title, status=`inbox`, timestamps) and an audit event is recorded.
2. **Given** I am authenticated, **When** I POST `/api/v1/inbox` with an empty title, **Then** I receive 400 with a descriptive error.
3. **Given** I am authenticated, **When** I GET `/api/v1/inbox`, **Then** I receive a list of my workspace's inbox items.

---

### User Story US04 — Clarify Inbox Item into Standalone Action (Priority: P1)

A user can process an inbox item and turn it into a concrete, actionable task by assigning it an Area and a Context. The inbox item becomes `clarified` and a new Action is created in `ready` status.

**Why this priority**: Clarification is the bridge between "captured raw input" and "things I can actually do". This is the core GTD processing step.

**Independent Test**: Given an existing inbox item, POST to the clarify endpoint with area and context IDs, then verify inbox item status=`clarified` and a new action exists with status=`ready`.

**Acceptance Scenarios**:

1. **Given** I have an inbox item in `inbox` status, **When** I POST `/api/v1/inbox/:id/clarify` with `{ "title": "Buy groceries", "areaId": "<uuid>", "contextId": "<uuid>" }`, **Then** the inbox item status becomes `clarified`, a new action exists with status `ready`, and audit events are recorded for both entities.
2. **Given** I have an inbox item already in `clarified` status, **When** I attempt to clarify it again, **Then** I receive 422 with an error indicating invalid status transition.
3. **Given** I supply a non-existent or archived area, **When** I clarify an inbox item, **Then** I receive 422 with a descriptive error.
4. **Given** I supply a non-existent context, **When** I clarify an inbox item, **Then** I receive 422 with a descriptive error.

---

### User Story US05 — Activate and Complete a Standalone Action (Priority: P1)

A user can move an action through its lifecycle: `ready` → `active` → `done`. Each transition is recorded as an audit event.

**Why this priority**: Without completing the full lifecycle, the system is just a capture tool — it never closes the loop.

**Independent Test**: Given a `ready` action, POST activate then POST complete, and verify the final status is `done` with audit events for each transition.

**Acceptance Scenarios**:

1. **Given** I have an action in `ready` status, **When** I POST `/api/v1/actions/:id/activate`, **Then** the action status becomes `active` and an audit event is recorded.
2. **Given** I have an action in `active` status, **When** I POST `/api/v1/actions/:id/complete`, **Then** the action status becomes `done` and an audit event is recorded.
3. **Given** I have an action in `done` status, **When** I attempt to activate it, **Then** I receive 422 with an invalid status transition error.
4. **Given** I have an action in `ready` status, **When** I attempt to complete it directly (without activating), **Then** I receive 422 with an invalid status transition error.

---

### User Story US01 — Workspace Auto-Provisioning on Signup (Priority: P1)

When a new user signs up, their workspace, actor identity, and default seed data (Areas and Contexts) are automatically created before the user ever reaches the application.

**Why this priority**: Every other story depends on a workspace existing. Without auto-provisioning, new users hit 403 errors on all workspace-scoped endpoints.

**Independent Test**: Register a new account, immediately hit any authenticated endpoint, and verify the workspace, actor, areas, and contexts all exist.

**Acceptance Scenarios**:

1. **Given** I sign up with a new account, **When** my registration completes, **Then** a workspace, a human actor, 3 default areas (Work, Personal, Admin), and 5 default contexts (computer, calls, home, errands, office) are created for my account.
2. **Given** my workspace is provisioned, **When** I GET `/api/v1/areas`, **Then** I receive the 3 seeded areas.
3. **Given** my workspace is provisioned, **When** I GET `/api/v1/contexts`, **Then** I receive the 5 seeded contexts.

---

### User Story US02 — HTMX Web UI (Priority: P2)

Users can perform the full inbox → clarify → activate → complete flow through a web interface without writing any API calls by hand. The UI consists of three pages: Dashboard, Inbox, and Actions.

**Why this priority**: The API makes the system functional; the UI makes it usable for non-technical users. Depends on all P1 stories.

**Independent Test**: Log in via the web, capture an item on the Dashboard, navigate to Inbox, clarify it, navigate to Actions, activate it, then complete it — all through the browser.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I visit `/app`, **Then** I see a Dashboard with inbox count, active action count, and a Quick Capture form.
2. **Given** I submit a title in the Quick Capture form, **When** the form submits, **Then** the item is added to my inbox and the dashboard count updates without a full page reload.
3. **Given** I visit `/app/inbox`, **When** I click "Clarify" on an inbox item, **Then** an inline form expands with Area and Context selects pre-populated with my workspace data.
4. **Given** I submit the clarify form, **When** the action succeeds, **Then** the inbox item disappears from the list and the action appears on the Actions page.
5. **Given** I visit `/app/actions`, **When** I click "Activate" on a `ready` action, **Then** the action row updates to show a "Complete" button in place of "Activate".
6. **Given** I click "Complete" on an `active` action, **When** the action succeeds, **Then** the action row updates to show a "Done" badge.

---

### Edge Cases

- What happens if a user's workspace provisioning fails mid-signup? (The user is created but has no workspace — subsequent requests return 503 or redirect to an error page explaining the issue.)
- What happens if two browser tabs simultaneously try to clarify the same inbox item? (The second request receives 422 — status is already `clarified`.)
- What if an area is archived after an action that references it is created? (The action remains valid; only new clarifications are blocked from using archived areas.)
- What if a request arrives for an entity belonging to a different workspace? (Returns 404 — resources are invisible across workspace boundaries, not just forbidden.)

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST auto-provision a workspace, actor, 3 default areas, and 5 default contexts when a new user signs up.
- **FR-002**: System MUST allow authenticated users to capture items to their workspace inbox with a title (required) and optional description.
- **FR-003**: System MUST allow users to clarify an `inbox` status item into a standalone action by supplying a title, area (active), and context.
- **FR-004**: System MUST atomically transition the inbox item to `clarified` and create the action in `ready` status — both succeed or neither persists.
- **FR-005**: System MUST allow users to activate a `ready` action, transitioning it to `active`.
- **FR-006**: System MUST allow users to complete an `active` action, transitioning it to `done`.
- **FR-007**: System MUST reject invalid status transitions with a descriptive error.
- **FR-008**: System MUST record an immutable audit event for every state-changing mutation, capturing: entity type, entity ID, event type, actor ID, timestamp, and payload snapshot.
- **FR-009**: System MUST scope all workspace data — inbox items, actions, areas, contexts, audit events — to the owning workspace. Cross-workspace access MUST return 404.
- **FR-010**: System MUST serve a JSON API under `/api/v1` for all entity operations.
- **FR-011**: System MUST serve an HTMX-driven web UI under `/app` implementing the same operations as the API.
- **FR-012**: System MUST validate that areas referenced during clarification exist and are in `active` status.
- **FR-013**: System MUST validate that contexts referenced during clarification exist within the workspace.
- **FR-014**: System MUST return consistent error envelopes (`{ "error": { "code": "...", "message": "..." } }`) for all error conditions.

### Key Entities

- **Workspace**: Top-level tenant boundary. Each user account owns exactly one workspace. Contains all their data.
- **Actor**: An identity within a workspace that can author mutations. In this slice, always a human actor linked to the user account. Agents are reserved for future use.
- **InboxItem**: A raw captured thought. Has a lifecycle of `inbox` → `clarified`. When clarified, records what it was clarified into (`clarified_into_type`, `clarified_into_id`).
- **Area**: A sphere of responsibility (e.g. Work, Personal). Has `active` or `archived` status. Required when creating actions.
- **Context**: A situational tag indicating where/how an action can be done (e.g. computer, calls). Required when creating actions.
- **Action**: A concrete, single next step. In this slice, always standalone (not attached to a project). Lifecycle: `ready` → `active` → `done`. Also supports `waiting`, `scheduled`, `archived` for future slices.
- **AuditEvent**: Immutable append-only record of every state-changing mutation. Records who did what to which entity and when.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can sign up and reach a functional dashboard with seed data in one flow, with no manual setup required.
- **SC-002**: A user can capture an inbox item, clarify it into an action, activate it, and complete it — all in under 60 seconds via the API.
- **SC-003**: Every mutation that changes entity state produces exactly one audit event per entity affected (e.g. clarify produces 2 audit events).
- **SC-004**: All workspace-scoped queries return only data belonging to the requesting user's workspace — zero cross-tenant data leakage.
- **SC-005**: Invalid status transitions are rejected 100% of the time with a machine-readable error code.
- **SC-006**: The HTMX UI completes the full inbox → clarify → activate → complete flow without a full page reload at any step.
- **SC-007**: Unit test coverage at 100% for domain logic (status transitions, factory invariants) and application commands.

---

## Assumptions

- Each user account maps to exactly one workspace (one-to-one). Multi-workspace support is out of scope for this slice.
- All IDs are UUIDs generated server-side; clients never supply IDs.
- Authentication uses the existing better-auth session mechanism; this slice does not modify auth flows beyond hooking into the signup event.
- Atomic transactions for `ClarifyInboxItemToAction` are implemented using D1 batch operations.
- The `project_id` column on the `action` table is reserved for future use; this slice always leaves it NULL.
- The JSON API and HTMX UI share the same application layer (commands and queries) — no duplicate business logic.

---

## Interview

### Open Questions

*(none — the implementation plan is fully specified)*

### Answer Log

*(empty — no interview questions were needed given the detailed input)*
