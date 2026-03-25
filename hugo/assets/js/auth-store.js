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
  // Mirror server-side logic in src/infrastructure/authCookieNames.ts:
  // On HTTPS the cookie uses the __Host- prefix; on plain HTTP localhost it does not.
  var cookieName = window.location.protocol === 'https:'
    ? '__Host-auth_status'
    : 'auth_status';

  Alpine.store('auth', {
    isAuthenticated: document.cookie
      .split(';')
      // Cookie name must match getAuthIndicatorCookieName() in src/infrastructure/authCookieNames.ts
      .some(function (c) { return c.trim() === cookieName + '=1'; })
  });

  /**
   * Dashboard guard component — redirects unauthenticated visitors to sign-in.
   *
   * Usage: <div x-data="dashboardGuard" data-redirect-url="/dashboard/">
   * The init() method runs automatically when Alpine initialises the component.
   */
  Alpine.data('dashboardGuard', function () {
    return {
      init: function () {
        if (!this.$store.auth.isAuthenticated) {
          var status = this.$el.querySelector('[role=status]');
          if (status) { status.textContent = 'Redirecting to sign in...'; }
          window.location.replace(
            '/auth/sign-in?redirectTo=' + encodeURIComponent(this.$el.dataset.redirectUrl)
          );
        }
      }
    };
  });
});
