/**
 * The better-auth session cookie name, derived from `cookiePrefix: '__Host-better-auth'`
 * and better-auth's default session token suffix. Single source of truth consumed by
 * both the infrastructure layer (BetterAuthService) and the presentation layer
 * (cookieBuilder).
 */
export const SESSION_COOKIE_NAME = '__Host-better-auth.session_token';
