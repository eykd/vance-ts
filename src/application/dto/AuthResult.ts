/** Result DTO returned after successful authentication. */
export interface AuthResult {
  readonly userId: string;
  readonly sessionId: string;
  readonly csrfToken: string;
  readonly redirectTo: string;
}
