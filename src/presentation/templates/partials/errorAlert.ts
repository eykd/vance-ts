import { escapeHtml, html } from '../../utils/html';

/**
 * Renders a DaisyUI error alert component.
 *
 * @param message - The error message to display (will be HTML-escaped)
 * @returns HTML string for the alert
 */
export function errorAlert(message: string): string {
  return html`<div role="alert" class="alert alert-error">
    <span>${message}</span>
  </div>`;
}

/**
 * Renders a list of per-field validation errors.
 *
 * @param errors - Array of error messages, or undefined
 * @returns HTML string with error list, or empty string if no errors
 */
export function fieldErrors(errors: string[] | undefined): string {
  if (errors === undefined || errors.length === 0) {
    return '';
  }

  const items = errors.map((e) => `<li class="text-error text-sm">${escapeHtml(e)}</li>`).join('');
  return `<ul class="mt-1">${items}</ul>`;
}
