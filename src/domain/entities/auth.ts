/** The authenticated user as known to the domain layer. */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly emailVerified: boolean;
  /** ISO 8601 UTC timestamp of account creation. */
  readonly createdAt: string;
}

/** An active user session as known to the domain layer. */
export interface AuthSession {
  readonly id: string;
  /** Session token stored in the cookie; used for CSRF derivation. */
  readonly token: string;
  readonly userId: string;
  /** ISO 8601 UTC timestamp when the session expires. */
  readonly expiresAt: string;
  /** ISO 8601 UTC timestamp when the session was created. */
  readonly createdAt: string;
}
