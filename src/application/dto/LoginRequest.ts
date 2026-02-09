/** Request DTO for user login. */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly redirectTo?: string;
  readonly ipAddress: string;
  readonly userAgent: string;
}
