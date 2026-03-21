import { escapeHtml, html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the register page template. */
interface RegisterPageProps {
  /** CSRF token rendered in a hidden form field. */
  readonly csrfToken: string;
  /** Optional general error message displayed above all form inputs. */
  readonly error?: string;
  /** Optional per-field validation errors keyed by field name (e.g. "name", "email", "password"). */
  readonly fieldErrors?: Record<string, string>;
  /** Optional pre-filled name after a failed registration attempt. */
  readonly name?: string;
  /** Optional pre-filled email address after a failed registration attempt. */
  readonly email?: string;
}

/** ID for the general error alert container, referenced by aria-describedby. */
const GENERAL_ERROR_ID = 'register-error';

/** ID for the name field error element, referenced by aria-describedby. */
const NAME_ERROR_ID = 'name-error';

/** ID for the email field error element, referenced by aria-describedby. */
const EMAIL_ERROR_ID = 'email-error';

/** ID for the password field error element, referenced by aria-describedby. */
const PASSWORD_ERROR_ID = 'password-error';

/** ID for the password requirements hint element, referenced by aria-describedby. */
const PASSWORD_HINT_ID = 'password-hint';

/** ID for the confirm-password field error element, referenced by aria-describedby. */
const PASSWORD_CONFIRM_ERROR_ID = 'password_confirm-error';

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
  const nameFieldError: string | undefined = props.fieldErrors?.['name'];
  const emailFieldError: string | undefined = props.fieldErrors?.['email'];
  const passwordFieldError: string | undefined = props.fieldErrors?.['password'];
  const passwordConfirmFieldError: string | undefined = props.fieldErrors?.['password_confirm'];

  const generalErrorBanner =
    props.error !== undefined
      ? safe(
          `<div role="alert" class="alert alert-error mb-4" id="${GENERAL_ERROR_ID}">${escapeHtml(props.error)}</div>`
        )
      : safe('');

  const nameErrorEl =
    nameFieldError !== undefined
      ? safe(
          `<p id="${NAME_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(nameFieldError)}</p>`
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

  const passwordConfirmErrorEl =
    passwordConfirmFieldError !== undefined
      ? safe(
          `<p id="${PASSWORD_CONFIRM_ERROR_ID}" class="text-error text-sm mt-1">${escapeHtml(passwordConfirmFieldError)}</p>`
        )
      : safe('');

  // Compute aria-describedby for the name input (omit attribute when no IDs).
  const nameParts: string[] = [];
  if (props.error !== undefined) nameParts.push(GENERAL_ERROR_ID);
  if (nameFieldError !== undefined) nameParts.push(NAME_ERROR_ID);
  const nameDescribedbyAttr =
    nameParts.length > 0 ? safe(`aria-describedby="${nameParts.join(' ')}"`) : safe('');

  // Compute aria-describedby for the email input (omit attribute when no IDs).
  const emailParts: string[] = [];
  if (props.error !== undefined) emailParts.push(GENERAL_ERROR_ID);
  if (emailFieldError !== undefined) emailParts.push(EMAIL_ERROR_ID);
  const emailDescribedbyAttr =
    emailParts.length > 0 ? safe(`aria-describedby="${emailParts.join(' ')}"`) : safe('');

  // Compute aria-describedby for the password input (always includes hint).
  const passwordParts: string[] = [];
  if (props.error !== undefined) passwordParts.push(GENERAL_ERROR_ID);
  passwordParts.push(PASSWORD_HINT_ID);
  if (passwordFieldError !== undefined) passwordParts.push(PASSWORD_ERROR_ID);
  const passwordDescribedbyAttr = safe(`aria-describedby="${passwordParts.join(' ')}"`);

  // Compute aria-describedby for the confirm-password input (omit attribute when no IDs).
  const passwordConfirmParts: string[] = [];
  if (props.error !== undefined) passwordConfirmParts.push(GENERAL_ERROR_ID);
  if (passwordConfirmFieldError !== undefined) passwordConfirmParts.push(PASSWORD_CONFIRM_ERROR_ID);
  const passwordConfirmDescribedbyAttr =
    passwordConfirmParts.length > 0
      ? safe(`aria-describedby="${passwordConfirmParts.join(' ')}"`)
      : safe('');

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
        <label for="name" class="label">
          <span class="label-text">Name</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value="${props.name ?? ''}"
          autocomplete="name"
          ${nameDescribedbyAttr}
          class="input input-bordered w-full"
          required
        />
        ${nameErrorEl}
      </div>
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
          class="input input-bordered w-full"
          required
        />
        ${emailErrorEl}
      </div>
      <div class="form-control mb-4">
        <label for="password" class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="new-password"
          ${passwordDescribedbyAttr}
          class="input input-bordered w-full"
          required
        />
        <p id="${PASSWORD_HINT_ID}" class="text-base-content/60 text-sm mt-1">
          Must be at least 12 characters
        </p>
        ${passwordErrorEl}
      </div>
      <div class="form-control mb-6">
        <label for="password_confirm" class="label">
          <span class="label-text">Confirm Password</span>
        </label>
        <input
          id="password_confirm"
          type="password"
          name="password_confirm"
          autocomplete="new-password"
          ${passwordConfirmDescribedbyAttr}
          class="input input-bordered w-full"
          required
        />
        ${passwordConfirmErrorEl}
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary w-full" :disabled="submitting">
          Create Account
        </button>
      </div>
      <p class="text-base-content/60 text-sm mt-4 text-center">
        By creating an account, you agree to our
        <a href="/terms/" class="link link-primary">Terms of Service</a> and
        <a href="/privacy/" class="link link-primary">Privacy Policy</a>.
      </p>
    </form>
    <div class="mt-4 text-center">
      <a href="/auth/sign-in" class="link link-primary">Already have an account? Sign in</a>
    </div>
  `;

  return authLayout({ title: 'Create an Account', content });
}
