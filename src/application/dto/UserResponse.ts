import type { UserId } from '../../domain/value-objects/UserId';

/** Response DTO representing user profile data. */
export interface UserResponse {
  readonly id: UserId;
  readonly email: string;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
}
