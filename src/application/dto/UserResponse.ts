/** Response DTO representing user profile data. */
export interface UserResponse {
  readonly id: string;
  readonly email: string;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
}
