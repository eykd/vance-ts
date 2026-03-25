import { html } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/**
 * Renders a styled authentication error page as a complete HTML document.
 *
 * Uses the shared auth layout for consistent branding. Does not expose
 * framework details or external links — shows a generic error message
 * with a link back to sign-in.
 *
 * @returns A complete HTML document string
 */
export function authErrorPage(): string {
  const content = html`
    <h1 class="card-title text-2xl font-bold font-serif mb-6">Authentication Error</h1>
    <div role="alert" class="alert alert-error mb-4">
      <span>Something went wrong during authentication. Please try again.</span>
    </div>
    <div class="mt-4 text-center">
      <a href="/auth/sign-in" class="link link-primary">Back to Sign In</a>
    </div>
  `;

  return authLayout({ title: 'Authentication Error', content });
}
