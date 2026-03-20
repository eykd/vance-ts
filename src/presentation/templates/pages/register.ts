import { escapeHtml, html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the register page template. */
interface RegisterPageProps {
  /** CSRF token rendered in a hidden form field. */
  readonly csrfToken: string;
  /** Optional general error message displayed above all form inputs. */
  readonly error?: string;
  /** Optional per-field validation errors keyed by field name (e.g. "email", "password"). */
  readonly fieldErrors?: Record<string, string>;
  /** Optional pre-filled email address after a failed registration attempt. */
  readonly email?: string;
}

/** ID for the general error alert container, referenced by aria-describedby. */
const GENERAL_ERROR_ID = 'register-error';

/** ID for the email field error element, referenced by aria-describedby. */
const EMAIL_ERROR_ID = 'email-error';

/** ID for the password field error element, referenced by aria-describedby. */
const PASSWORD_ERROR_ID = 'password-error';

/**
 * Renders the registration page as a complete HTML document.
 *
 * All user-supplied values are escaped via {@link escapeHtml} to prevent XSS.
 * The general error container (role="alert") is rendered before the first form
 * input so that assistive technologies announce it when focus enters the form.
 * Per-field errors are rendered inline below their respective inputs.
 *
 * @param props - The register page properties
 * @returns A complete HTML document string
 */
export function registerPage(props: RegisterPageProps): string {
  const emailFieldError: string | undefined = props.fieldErrors?.['email'];
  const passwordFieldError: string | undefined = props.fieldErrors?.['password'];

  const generalErrorBanner =
    props.error !== undefined
      ? safe(
          `<div role="alert" class="alert alert-error mb-4" id="${GENERAL_ERROR_ID}">${escapeHtml(props.error)}</div>`
        )
      : safe('');

  const emailErrorEl =
    emailFieldError !== undefined
      ? safe(
          `<p id="${EMAIL_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(emailFieldError)}</p>`
        )
      : safe('');

  const passwordErrorEl =
    passwordFieldError !== undefined
      ? safe(
          `<p id="${PASSWORD_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(passwordFieldError)}</p>`
        )
      : safe('');

  // Compute aria-describedby for the email input (omit attribute when no IDs).
  const emailParts: string[] = [];
  if (props.error !== undefined) emailParts.push(GENERAL_ERROR_ID);
  if (emailFieldError !== undefined) emailParts.push(EMAIL_ERROR_ID);
  const emailDescribedbyAttr =
    emailParts.length > 0 ? safe(`aria-describedby="${emailParts.join(' ')}"`) : safe('');

  // Compute aria-describedby for the password input (omit attribute when no IDs).
  const passwordParts: string[] = [];
  if (props.error !== undefined) passwordParts.push(GENERAL_ERROR_ID);
  if (passwordFieldError !== undefined) passwordParts.push(PASSWORD_ERROR_ID);
  const passwordDescribedbyAttr =
    passwordParts.length > 0 ? safe(`aria-describedby="${passwordParts.join(' ')}"`) : safe('');

  const content = html`
    <h1 class="card-title text-2xl font-bold mb-6">Create an Account</h1>
    ${generalErrorBanner}
    <form
      method="POST"
      action="/auth/sign-up"
      x-data="{ submitting: false }"
      @submit="submitting = true"
    >
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      <div class="form-control mb-4">
        <label for="email" class="label">
          <span class="label-text">Email</span>
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value="${props.email ?? ''}"
          autocomplete="email"
          ${emailDescribedbyAttr}
          class="input input-bordered"
          required
        />
        ${emailErrorEl}
      </div>
      <div class="form-control mb-6">
        <label for="password" class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="new-password"
          ${passwordDescribedbyAttr}
          class="input input-bordered"
          required
        />
        ${passwordErrorEl}
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary" :disabled="submitting">Create Account</button>
      </div>
    </form>
    <div class="mt-4 text-center">
      <a href="/auth/sign-in" class="link link-primary">Already have an account? Sign in</a>
    </div>
  `;

  return authLayout({ title: 'Create an Account', content });
}
