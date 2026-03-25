/**
 * Forgot password page template.
 *
 * Renders an email input form for requesting a password reset link.
 * On submission, the user always sees a success message regardless of
 * whether the email exists (anti-enumeration, FR-007).
 *
 * @module
 */

import { escapeHtml, html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the forgot password page template. */
interface ForgotPasswordPageProps {
  /** CSRF token rendered in a hidden form field. */
  readonly csrfToken: string;
  /** Optional error message displayed above the form. */
  readonly error?: string;
  /** Optional pre-filled email address after a failed attempt. */
  readonly email?: string;
  /** When true, shows a success banner confirming the reset email was sent. */
  readonly success?: boolean;
}

/** ID for the error container, referenced by aria-describedby. */
const ERROR_ID = 'forgot-password-error';

/**
 * Renders the forgot password page as a complete HTML document.
 *
 * All user-supplied values are escaped via {@link escapeHtml} to prevent XSS.
 *
 * @param props - The forgot password page properties
 * @returns A complete HTML document string
 */
export function forgotPasswordPage(props: ForgotPasswordPageProps): string {
  const successBanner =
    props.success === true
      ? safe(
          '<div role="alert" class="alert alert-success mb-4">If an account with that email exists, a password reset link has been sent.</div>'
        )
      : safe('');

  const errorBanner =
    props.error !== undefined
      ? safe(
          `<div role="alert" class="alert alert-error mb-4" id="${ERROR_ID}">${escapeHtml(props.error)}</div>`
        )
      : safe('');

  const ariaDescribedby =
    props.error !== undefined ? safe(`aria-describedby="${ERROR_ID}"`) : safe('');

  const content = html`
    <h1 class="card-title text-2xl font-bold mb-6">Forgot Password</h1>
    ${successBanner} ${errorBanner}
    <p class="text-base-content/70 mb-4">
      Enter your email address and we'll send you a link to reset your password.
    </p>
    <form
      method="POST"
      action="/auth/forgot-password"
      aria-label="Forgot password"
      x-data="{ submitting: false }"
      @submit="submitting = true"
    >
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      <div class="form-control mb-6">
        <label for="email" class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value="${props.email ?? ''}"
          autocomplete="email"
          ${ariaDescribedby}
          class="input input-bordered w-full"
          required
        />
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary w-full" :disabled="submitting">
          Send Reset Link
        </button>
      </div>
    </form>
    <div class="mt-4 text-center">
      <a href="/auth/sign-in" class="link link-primary">Back to Sign In</a>
    </div>
  `;

  return authLayout({ title: 'Forgot Password', content });
}
