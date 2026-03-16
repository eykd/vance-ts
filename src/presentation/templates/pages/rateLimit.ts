import { html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Props for the rate limit page template. */
export interface RateLimitPageProps {
  /** Optional seconds until the client may retry, shown in the user message. */
  readonly retryAfter?: number;
}

/**
 * Renders a styled 429 Too Many Requests page as a complete HTML document.
 *
 * Uses the shared auth layout for consistent branding. When `retryAfter` is
 * provided, displays the wait time to the user.
 *
 * @param props - The rate limit page properties
 * @returns A complete HTML document string
 */
export function rateLimitPage(props: RateLimitPageProps): string {
  const retryMessage =
    props.retryAfter !== undefined
      ? safe(`<p class="mt-2">Please try again in ${String(props.retryAfter)} seconds.</p>`)
      : safe('');

  const content = html`
    <h1 class="card-title text-2xl font-bold mb-6">Too Many Requests</h1>
    <div role="alert" class="alert alert-warning mb-4">
      <span>You have made too many requests. Please wait before trying again.</span>
      ${retryMessage}
    </div>
    <div class="mt-4 text-center">
      <a href="/auth/sign-in" class="link link-primary">Back to Sign In</a>
    </div>
  `;

  return authLayout({ title: 'Too Many Requests', content });
}
