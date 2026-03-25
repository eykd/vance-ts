/**
 * Navigation helpers — attaches event listeners for data-action attributes.
 *
 * Supported actions:
 *   data-action="go-back"  — calls history.back() on click
 *
 * Uses event delegation on document.body so it works for any element
 * present at parse time or added later.
 */
document.body.addEventListener('click', function (event) {
  var target = event.target.closest('[data-action="go-back"]');
  if (target) {
    event.preventDefault();
    history.back();
  }
});
