import { escapeHtml, html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the login page template. */
interface LoginPageProps {
  /** CSRF token rendered in a hidden form field. */
  readonly csrfToken: string;
  /** Optional redirect destination preserved across sign-in. */
  readonly redirectTo?: string;
  /** Optional error message to display above the form inputs. */
  readonly error?: string;
  /** Optional pre-filled email address (e.g. after a failed sign-in attempt). */
  readonly email?: string;
  /** When true, shows a success banner confirming account creation. */
  readonly registeredSuccess?: boolean;
}

/** ID shared between the error container and aria-describedby attributes. */
const ERROR_ID = 'login-error';

/**
 * Renders the sign-in page as a complete HTML document.
 *
 * All user-supplied values are escaped via {@link escapeHtml} to prevent XSS.
 * The error container (role="alert") is rendered before the first form input so
 * that assistive technologies announce it when focus enters the form.
 *
 * @param props - The login page properties
 * @returns A complete HTML document string
 */
export function loginPage(props: LoginPageProps): string {
  const successBanner =
    props.registeredSuccess === true
      ? safe(
          '<div role="alert" class="alert alert-success mb-4">Account created successfully. Please sign in.</div>'
        )
      : safe('');

  const errorBanner =
    props.error !== undefined
      ? safe(
          `<div role="alert" class="alert alert-error mb-4" id="${ERROR_ID}">${escapeHtml(props.error)}</div>`
        )
      : safe('');

  const redirectToField =
    props.redirectTo !== undefined
      ? safe(`<input type="hidden" name="redirectTo" value="${escapeHtml(props.redirectTo)}" />`)
      : safe('');

  const ariaDescribedby =
    props.error !== undefined ? safe(`aria-describedby="${ERROR_ID}"`) : safe('');

  const content = html`
    <h1 class="card-title text-2xl font-bold mb-6">Sign In</h1>
    ${successBanner} ${errorBanner}
    <form method="POST" action="/auth/sign-in">
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      ${redirectToField}
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
          ${ariaDescribedby}
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control mb-6">
        <label for="password" class="label">
          <span class="label-text">Password</span>
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autocomplete="current-password"
          ${ariaDescribedby}
          class="input input-bordered"
          required
        />
      </div>
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary">Sign In</button>
      </div>
    </form>
    <div class="mt-4 text-center">
      <a href="/auth/sign-up" class="link link-primary">Create an account</a>
    </div>
  `;

  return authLayout({ title: 'Sign In', content });
}
