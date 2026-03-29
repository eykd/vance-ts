import { html, safe } from '../../utils/html';
import { authLayout } from '../layouts/authLayout';

/** Describes the back-navigation link rendered on the rate limit page. */
interface RateLimitBackLink {
  /** The URL to navigate back to (e.g. `/auth/sign-up`). */
  readonly href: string;
  /** The visible link text (e.g. `Back to Sign Up`). */
  readonly label: string;
}

/** Props for the rate limit page template. */
interface RateLimitPageProps {
  /** Optional seconds until the client may retry, shown in the user message. */
  readonly retryAfter?: number;
  /** Optional back link override. Defaults to sign-in when omitted. */
  readonly backLink?: RateLimitBackLink;
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

  const backHref = props.backLink?.href ?? '/auth/sign-in';
  const backLabel = props.backLink?.label ?? 'Back to Sign In';

  const content = html`
    <h1 class="card-title text-2xl font-bold font-serif mb-6">Slow Down</h1>
    <div role="alert" class="alert alert-warning mb-4">
      <div>
        <span>You're moving a little too fast. Please wait a moment before trying again.</span>
        ${retryMessage}
      </div>
    </div>
    <div class="mt-4 text-center">
      <a href="${backHref}" class="link link-primary">${backLabel}</a>
    </div>
  `;

  return authLayout({ title: 'Too Many Requests', content });
}
