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
      // Cookie name must match AUTH_INDICATOR_COOKIE_NAME in src/presentation/utils/cookieBuilder.ts
      .some(function (c) { return c.trim() === '__Host-auth_status=1'; })
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
