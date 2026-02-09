import { html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';
import { errorAlert, fieldErrors } from '../partials/errorAlert';

/** Props for the register page template. */
interface RegisterPageProps {
  /** CSRF token for the hidden form field. */
  readonly csrfToken: string;
  /** Optional error message to display. */
  readonly error?: string;
  /** Optional pre-filled email address. */
  readonly email?: string;
  /** Optional per-field validation errors. */
  readonly fieldErrors?: Record<string, string[]>;
}

/**
 * Renders the registration page with email/password form.
 *
 * Uses HTMX for form submission and includes CSRF protection.
 * Shows per-field validation errors when provided.
 *
 * @param props - The register page properties
 * @returns A complete HTML page string
 */
export function registerPage(props: RegisterPageProps): string {
  const errorHtml = props.error !== undefined ? errorAlert(props.error) : '';
  const emailValue = props.email ?? '';
  const emailErrors = fieldErrors(props.fieldErrors?.['email']);
  const passwordErrors = fieldErrors(props.fieldErrors?.['password']);
  const confirmErrors = fieldErrors(props.fieldErrors?.['confirmPassword']);

  const content = html`<h2 class="card-title justify-center text-2xl">Register</h2>
    ${safe(errorHtml)}
    <form hx-post="/auth/register" hx-swap="outerHTML" class="space-y-4">
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      <div class="form-control">
        <label class="label" for="email">
          <span class="label-text">Email</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value="${emailValue}"
          class="input input-bordered w-full"
          required
          autocomplete="email"
        />
        ${safe(emailErrors)}
      </div>
      <div class="form-control">
        <label class="label" for="password">
          <span class="label-text">Password</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          class="input input-bordered w-full"
          required
          autocomplete="new-password"
          minlength="12"
        />
        ${safe(passwordErrors)}
      </div>
      <div class="form-control">
        <label class="label" for="confirmPassword">
          <span class="label-text">Confirm Password</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          class="input input-bordered w-full"
          required
          autocomplete="new-password"
          minlength="12"
        />
        ${safe(confirmErrors)}
      </div>
      <button type="submit" class="btn btn-primary w-full">Register</button>
    </form>
    <p class="text-center text-sm mt-4">
      Already have an account?
      <a href="/auth/login" class="link link-primary">Login</a>
    </p>`;

  return authLayout({ title: 'Register', content });
}
