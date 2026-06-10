/* ============================================
   My Wow Pet — Production Auth Guard
   Prevents demo authentication from being used on production-like hosts.
   ============================================ */

(function () {
  const host = window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  const explicitDevMode = params.get('devAuth') === 'true';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isProductionLike = !isLocalHost && !explicitDevMode;

  window.WOWPET_SECURITY = Object.freeze({
    isProductionLike,
    allowMockAuth: !isProductionLike
  });

  window.WowPetAuthUnavailable = function showAuthUnavailable() {
    const message = 'Account service is temporarily unavailable. Please continue as a guest or try again later.';
    if (window.WowApp && typeof window.WowApp.showToast === 'function') {
      window.WowApp.showToast(message, '🔒', 5000);
    } else {
      console.warn('[My Wow Pet] ' + message);
    }
  };

  function unavailableAuthMethod() {
    window.WowPetAuthUnavailable();
    return Promise.reject(new Error('Account service is temporarily unavailable.'));
  }

  function applyProductionAuthGuard() {
    if (!isProductionLike || !window.WowFirebase || typeof window.WowFirebase.isMockMode !== 'function') return;
    if (!window.WowFirebase.isMockMode()) return;

    console.warn('[My Wow Pet] Demo auth is not available on production-like hosts.');
    try {
      localStorage.removeItem('wow_mock_auth_user');
      localStorage.removeItem('wow_mock_user');
      localStorage.removeItem('wow_mock_database');
    } catch (e) {}

    window.WowFirebase = {
      ...window.WowFirebase,
      signInWithEmail: unavailableAuthMethod,
      signUpWithEmail: unavailableAuthMethod,
      signInWithGoogle: unavailableAuthMethod,
      signInWithFacebook: unavailableAuthMethod,
      signInWithApple: unavailableAuthMethod,
      sendPasswordReset: unavailableAuthMethod,
      logout: function () {
        try {
          localStorage.removeItem('wow_mock_auth_user');
          localStorage.removeItem('wow_mock_user');
          localStorage.removeItem('wow_mock_database');
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        return Promise.resolve();
      },
      onAuthStateChanged: function (callback) {
        if (typeof callback === 'function') callback(null);
      },
      getCurrentUser: function () {
        return null;
      },
      isMockMode: function () {
        return true;
      }
    };
  }

  window.WowPetEnforceProductionAuthGuard = applyProductionAuthGuard;

  document.addEventListener('DOMContentLoaded', function () {
    applyProductionAuthGuard();
    const guardTimer = window.setInterval(applyProductionAuthGuard, 500);
    window.setTimeout(function () {
      window.clearInterval(guardTimer);
    }, 10000);
  });
})();
