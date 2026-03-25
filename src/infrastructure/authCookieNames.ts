/**
 * Auth cookie name resolution for better-auth framework.
 *
 * Resolves environment-aware cookie names for session, CSRF, and auth
 * indicator cookies. On plain-HTTP localhost the `__Host-` prefix is dropped
 * because it requires `Secure: true` — a constraint that cannot be satisfied
 * on plain HTTP.
 *
 * Lives in `infrastructure/` because the cookie name literals are
 * framework-specific (better-auth) and should not leak into the shared layer.
 *
 * @module
 */

import { isPlainHttpLocalhost } from '../shared/authCookieNames';

/**
 * Returns the better-auth session cookie name for the given auth URL.
 *
 * On localhost (plain HTTP), the `__Host-` prefix is dropped because it
 * requires `Secure: true` — a constraint that cannot be satisfied on
 * plain HTTP. This mirrors the `cookiePrefix` logic in `infrastructure/auth.ts`.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The session cookie name matching better-auth's configured cookie prefix.
 */
export function getSessionCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl)
    ? 'better-auth.session_token'
    : '__Host-better-auth.session_token';
}

/**
 * Returns the CSRF cookie name for the given auth URL.
 *
 * On localhost (plain HTTP), the `__Host-` prefix is dropped because it
 * requires `Secure: true` — a constraint that cannot be satisfied on
 * plain HTTP. Firefox and Safari may silently drop `__Host-` cookies
 * on plain HTTP, causing CSRF validation failures.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The CSRF cookie name (`__Host-csrf` or `csrf`).
 */
export function getCsrfCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'csrf' : '__Host-csrf';
}

/**
 * Returns the auth indicator cookie name for the given auth URL.
 *
 * On localhost (plain HTTP), the `__Host-` prefix is dropped because it
 * requires `Secure: true` — a constraint that cannot be satisfied on
 * plain HTTP. Firefox and Safari may silently drop `__Host-` cookies
 * on plain HTTP, causing the client-side auth store to miss the indicator.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The auth indicator cookie name (`__Host-auth_status` or `auth_status`).
 */
export function getAuthIndicatorCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'auth_status' : '__Host-auth_status';
}

/**
 * Returns the flash registered cookie name for the given auth URL.
 *
 * This short-lived cookie replaces the spoofable `?registered=true` query
 * parameter. On localhost (plain HTTP), the `__Host-` prefix is dropped.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The flash cookie name (`__Host-flash_registered` or `flash_registered`).
 */
export function getFlashRegisteredCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'flash_registered' : '__Host-flash_registered';
}

/**
 * Returns the flash reset cookie name for the given auth URL.
 *
 * This short-lived cookie replaces the spoofable `?reset=true` query
 * parameter. On localhost (plain HTTP), the `__Host-` prefix is dropped.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The flash cookie name (`__Host-flash_reset` or `flash_reset`).
 */
export function getFlashResetCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'flash_reset' : '__Host-flash_reset';
}

/**
 * Returns the flash forgot-password cookie name for the given auth URL.
 *
 * This short-lived cookie replaces the spoofable `?success=true` query
 * parameter on the forgot-password page. On localhost (plain HTTP), the
 * `__Host-` prefix is dropped.
 *
 * @param authUrl - The BETTER_AUTH_URL value from the Workers env.
 * @returns The flash cookie name (`__Host-flash_forgot` or `flash_forgot`).
 */
export function getFlashForgotCookieName(authUrl: string): string {
  return isPlainHttpLocalhost(authUrl) ? 'flash_forgot' : '__Host-flash_forgot';
}
