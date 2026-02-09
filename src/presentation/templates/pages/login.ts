import { html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';
import { errorAlert } from '../partials/errorAlert';

/** Props for the login page template. */
interface LoginPageProps {
  /** CSRF token for the hidden form field. */
  readonly csrfToken: string;
  /** Optional error message to display. */
  readonly error?: string;
  /** Optional pre-filled email address. */
  readonly email?: string;
  /** Optional redirect URL after login. */
  readonly redirectTo?: string;
}

/**
 * Renders the login page with email/password form.
 *
 * Uses HTMX for form submission and includes CSRF protection.
 *
 * @param props - The login page properties
 * @returns A complete HTML page string
 */
export function loginPage(props: LoginPageProps): string {
  const errorHtml = props.error !== undefined ? errorAlert(props.error) : '';
  const emailValue = props.email ?? '';
  const redirectField =
    props.redirectTo !== undefined
      ? html`<input type="hidden" name="redirectTo" value="${props.redirectTo}" />`
      : '';

  const content = html`<h2 class="card-title justify-center text-2xl">Login</h2>
    ${safe(errorHtml)}
    <form hx-post="/auth/login" hx-swap="outerHTML" class="space-y-4">
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      ${safe(redirectField)}
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
          autocomplete="current-password"
        />
      </div>
      <button type="submit" class="btn btn-primary w-full">Login</button>
    </form>
    <p class="text-center text-sm mt-4">
      Don&#x27;t have an account?
      <a href="/auth/register" class="link link-primary">Register</a>
    </p>`;

  return authLayout({ title: 'Login', content });
}
