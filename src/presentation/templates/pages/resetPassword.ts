/**
 * Reset password page template.
 *
 * Renders a new-password form for users who clicked a password reset link.
 * The verification token is carried in a hidden field.
 *
 * @module
 */

import { escapeHtml, html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the reset password page template. */
interface ResetPasswordPageProps {
  /** CSRF token rendered in a hidden form field. */
  readonly csrfToken: string;
  /** The password-reset verification token from the URL. */
  readonly token: string;
  /** Optional error message displayed above the form. */
  readonly error?: string;
  /** Optional per-field error for the password input. */
  readonly passwordError?: string;
  /** Optional per-field error for the confirm password input. */
  readonly passwordConfirmError?: string;
}

/** ID for the general error container, referenced by aria-describedby. */
const ERROR_ID = 'reset-password-error';

/** ID for the password field error, referenced by aria-describedby. */
const PASSWORD_ERROR_ID = 'password-error';

/** ID for the password requirements hint element, referenced by aria-describedby. */
const PASSWORD_HINT_ID = 'password-hint';

/** ID for the confirm-password field error element, referenced by aria-describedby. */
const PASSWORD_CONFIRM_ERROR_ID = 'password_confirm-error';

/**
 * Renders the reset password page as a complete HTML document.
 *
 * All user-supplied values are escaped via {@link escapeHtml} to prevent XSS.
 *
 * @param props - The reset password page properties
 * @returns A complete HTML document string
 */
export function resetPasswordPage(props: ResetPasswordPageProps): string {
  const errorBanner =
    props.error !== undefined
      ? safe(
          `<div role="alert" class="alert alert-error mb-4" id="${ERROR_ID}">${escapeHtml(props.error)}</div>`
        )
      : safe('');

  const passwordErrorEl =
    props.passwordError !== undefined
      ? safe(
          `<p id="${PASSWORD_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(props.passwordError)}</p>`
        )
      : safe('');

  const passwordConfirmErrorEl =
    props.passwordConfirmError !== undefined
      ? safe(
          `<p id="${PASSWORD_CONFIRM_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(props.passwordConfirmError)}</p>`
        )
      : safe('');

  // Compute aria-describedby for the password input (always includes hint).
  const passwordParts: string[] = [];
  if (props.error !== undefined) passwordParts.push(ERROR_ID);
  passwordParts.push(PASSWORD_HINT_ID);
  if (props.passwordError !== undefined) passwordParts.push(PASSWORD_ERROR_ID);
  const passwordDescribedby = safe(`aria-describedby="${passwordParts.join(' ')}"`);

  // Compute aria-describedby for the confirm-password input.
  const passwordConfirmParts: string[] = [];
  if (props.error !== undefined) passwordConfirmParts.push(ERROR_ID);
  if (props.passwordConfirmError !== undefined)
    passwordConfirmParts.push(PASSWORD_CONFIRM_ERROR_ID);
  const passwordConfirmDescribedby =
    passwordConfirmParts.length > 0
      ? safe(`aria-describedby="${passwordConfirmParts.join(' ')}"`)
      : safe('');

  const content = html`
    <h1 class="card-title text-2xl font-bold mb-6">Reset Password</h1>
    ${errorBanner}
    <form
      method="POST"
      action="/auth/reset-password"
      aria-label="Reset password"
      x-data="{ submitting: false }"
      @submit="submitting = true"
    >
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      <input type="hidden" name="token" value="${props.token}" />
      <div class="form-control mb-4">
        <label for="password" class="label">
          <span class="label-text">New Password</span>
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="new-password"
          ${passwordDescribedby}
          class="input input-bordered w-full"
          required
          minlength="12"
        />
        <p id="${PASSWORD_HINT_ID}" class="text-base-content/60 text-sm mt-1">
          Must be at least 12 characters
        </p>
        ${passwordErrorEl}
      </div>
      <div class="form-control mb-6">
        <label for="password_confirm" class="label">
          <span class="label-text">Confirm New Password</span>
        </label>
        <input
          id="password_confirm"
          type="password"
          name="password_confirm"
          autocomplete="new-password"
          ${passwordConfirmDescribedby}
          class="input input-bordered w-full"
          required
          minlength="12"
        />
        ${passwordConfirmErrorEl}
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary w-full" :disabled="submitting">
          Reset Password
        </button>
      </div>
    </form>
    <div class="mt-4 text-center">
      <a href="/auth/sign-in" class="link link-primary">Back to Sign In</a>
    </div>
  `;

  return authLayout({ title: 'Reset Password', content });
}
