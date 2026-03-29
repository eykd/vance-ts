import { html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the sign-out confirmation page template. */
interface SignOutPageProps {
  /** CSRF token rendered in a hidden form field. */
  readonly csrfToken: string;
}

/**
 * Renders the sign-out confirmation page as a complete HTML document.
 *
 * Presents a confirmation button that submits a POST to `/auth/sign-out`.
 * All user-supplied values are escaped via the tagged template to prevent XSS.
 *
 * @param props - The sign-out page properties
 * @returns A complete HTML document string
 */
export function signOutPage(props: SignOutPageProps): string {
  const content = html`
    <h1 class="card-title text-2xl font-bold font-serif mb-6">Sign Out</h1>
    <p class="mb-6">Are you sure you want to sign out?</p>
    <form
      method="POST"
      action="/auth/sign-out"
      aria-label="Sign out"
      x-data="{ submitting: false }"
      @submit="submitting = true"
    >
      <input type="hidden" name="_csrf" value="${props.csrfToken}" />
      <div class="form-control mt-2">
        <button type="submit" class="btn btn-primary" :disabled="submitting">Sign Out</button>
      </div>
    </form>
    <div class="mt-4 text-center">
      <a href="/" class="link link-primary">${safe('Stay signed in')}</a>
    </div>
  `;

  return authLayout({ title: 'Sign Out', content });
}
