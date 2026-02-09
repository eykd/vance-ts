/** Request DTO for user registration. */
export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
}
