/**
 * WorkspaceProvisioningService — provisions the full workspace scaffold for a new user.
 *
 * Uses a single D1 batch of 20 parameterized statements for atomic, low-latency signup.
 * Batch order: [0] workspace, [1] actor, [2..4] area x3, [5..9] context x5,
 * [10..19] audit_event x10 — audit events MUST be last.
 *
 * FK ordering invariant: audit_event.actor_id references actor(id). All audit event
 * INSERTs appear at batch positions 10-19, after the actor row at position 1.
 *
 * SQL parameterization: userId and email are bound via D1's .bind() API, never
 * string-interpolated. Hardcoded seed data may appear as SQL literals.
 *
 * @module
 */

/** Default area names provisioned for every new workspace. */
const SEED_AREAS = ['Work', 'Personal', 'Admin'] as const;

/** Default context names provisioned for every new workspace. */
const SEED_CONTEXTS = ['computer', 'calls', 'home', 'errands', 'office'] as const;

/** SQL template for workspace insertion. */
const INSERT_WORKSPACE_SQL =
  'INSERT INTO workspace (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)';

/** SQL template for actor insertion. */
const INSERT_ACTOR_SQL =
  'INSERT INTO actor (id, workspace_id, user_id, type, created_at) VALUES (?, ?, ?, ?, ?)';

/** SQL template for area insertion. */
const INSERT_AREA_SQL =
  'INSERT INTO area (id, workspace_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';

/** SQL template for context insertion. */
const INSERT_CONTEXT_SQL =
  'INSERT INTO context (id, workspace_id, name, created_at) VALUES (?, ?, ?, ?)';

/** SQL template for audit event insertion. */
const INSERT_AUDIT_EVENT_SQL =
  'INSERT INTO audit_event (id, workspace_id, entity_type, entity_id, event_type, actor_id, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

/**
 * Provisions the full workspace scaffold for a new user in a single D1 batch.
 *
 * Wired into `getAuth(env)` via `databaseHooks.user.create.after`. Accepts the
 * raw D1Database binding (not Drizzle) to use the batch API directly.
 */
export class WorkspaceProvisioningService {
  /**
   * Creates a new WorkspaceProvisioningService.
   *
   * @param db - Raw D1Database binding for direct batch API access.
   */
  constructor(private readonly db: D1Database) {}

  /**
   * Provisions a workspace, actor, seed areas, seed contexts, and audit events
   * for the given user in a single atomic D1 batch.
   *
   * Idempotent: if a workspace for this userId already exists (UNIQUE constraint
   * on workspace.user_id), the error is silently swallowed and the method returns
   * without further action.
   *
   * ## External values bound via .bind() (never interpolated):
   * - `userId` — UUID from better-auth (user-supplied indirectly via registration)
   * - `email`  — email address from sign-up form
   *
   * @param userId - The better-auth user ID for the new account.
   * @param email - The user's email address (included in audit event payload).
   */
  async provisionForUser(userId: string, email: string): Promise<void> {
    const now = new Date().toISOString();

    // Generate all IDs upfront so audit events can reference them correctly.
    const workspaceId = crypto.randomUUID();
    const actorId = crypto.randomUUID();

    const areaIds = SEED_AREAS.map(() => crypto.randomUUID());
    const contextIds = SEED_CONTEXTS.map(() => crypto.randomUUID());

    // ── 1. Workspace ────────────────────────────────────────────────────────
    // External values: userId (bound, not interpolated)
    const insertWorkspace = this.db
      .prepare(INSERT_WORKSPACE_SQL)
      .bind(workspaceId, userId, now, now);

    // ── 2. Actor ─────────────────────────────────────────────────────────────
    // External values: userId (bound, not interpolated)
    const insertActor = this.db
      .prepare(INSERT_ACTOR_SQL)
      .bind(actorId, workspaceId, userId, 'human', now);

    // ── 3. Areas (3 rows) ────────────────────────────────────────────────────
    const insertAreas = SEED_AREAS.map((name, i) =>
      this.db.prepare(INSERT_AREA_SQL).bind(areaIds[i], workspaceId, name, 'active', now, now)
    );

    // ── 4. Contexts (5 rows) ─────────────────────────────────────────────────
    const insertContexts = SEED_CONTEXTS.map((name, i) =>
      this.db.prepare(INSERT_CONTEXT_SQL).bind(contextIds[i], workspaceId, name, now)
    );

    // ── 5. Audit events (10 rows) — MUST come after workspace, actor, areas, contexts ──
    //
    // audit_event.actor_id references actor(id).
    // All audit event INSERTs are placed last in the batch so the actor row
    // at position 1 is guaranteed to exist when D1 evaluates FK constraints.
    //
    // External values in payload: email (bound as JSON string parameter, not interpolated)
    const workspacePayload = JSON.stringify({ workspaceId, userId, email });
    const actorPayload = JSON.stringify({ actorId, workspaceId, userId, email });

    const insertAuditEvents: D1PreparedStatement[] = [
      // workspace.provisioned
      this.db
        .prepare(INSERT_AUDIT_EVENT_SQL)
        .bind(
          crypto.randomUUID(),
          workspaceId,
          'workspace',
          workspaceId,
          'workspace.provisioned',
          actorId,
          workspacePayload,
          now
        ),
      // actor.created
      this.db
        .prepare(INSERT_AUDIT_EVENT_SQL)
        .bind(
          crypto.randomUUID(),
          workspaceId,
          'actor',
          actorId,
          'actor.created',
          actorId,
          actorPayload,
          now
        ),
      // area.created × 3
      ...SEED_AREAS.map((name, i) =>
        this.db
          .prepare(INSERT_AUDIT_EVENT_SQL)
          .bind(
            crypto.randomUUID(),
            workspaceId,
            'area',
            areaIds[i],
            'area.created',
            actorId,
            JSON.stringify({ areaId: areaIds[i], workspaceId, name }),
            now
          )
      ),
      // context.created × 5
      ...SEED_CONTEXTS.map((name, i) =>
        this.db
          .prepare(INSERT_AUDIT_EVENT_SQL)
          .bind(
            crypto.randomUUID(),
            workspaceId,
            'context',
            contextIds[i],
            'context.created',
            actorId,
            JSON.stringify({ contextId: contextIds[i], workspaceId, name }),
            now
          )
      ),
    ];

    // Batch order: workspace → actor → areas → contexts → audit events (LAST)
    // This ordering satisfies FK constraints: audit_event.actor_id → actor(id)
    try {
      await this.db.batch([
        insertWorkspace,
        insertActor,
        ...insertAreas,
        ...insertContexts,
        ...insertAuditEvents,
      ]);
    } catch (err: unknown) {
      // Idempotency: a concurrent provisioning attempt or hook retry may race
      // to create the same workspace. Treat UNIQUE constraint failure as success.
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        return;
      }
      throw err;
    }
  }
}
