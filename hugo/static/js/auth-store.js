/**
 * Alpine.js auth store — reads the indicator cookie to expose reactive auth state.
 *
 * Store name: "auth"
 * ⚠️  Do NOT rename without updating every `$store.auth` reference in Hugo templates.
 *
 * The `alpine:init` event fires before Alpine processes x-show / x-cloak directives,
 * so the store is guaranteed to be available when directives evaluate.
 */
document.addEventListener('alpine:init', function () {
  Alpine.store('auth', {
    isAuthenticated: document.cookie
      .split(';')
      .some(function (c) { return c.trim() === 'auth_status=1'; })
  });
});
