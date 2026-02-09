import type { Email } from '../../domain/value-objects/Email';
import type { UserId } from '../../domain/value-objects/UserId';

/** Response DTO representing user profile data. */
export interface UserResponse {
  readonly id: UserId;
  readonly email: Email;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
}
