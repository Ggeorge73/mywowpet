/* ============================================
   My Wow Pet — Production Auth Guard
   Runs from this shared script before WowApp.init() on app pages.
   ============================================ */
(function () {
  if (window.WOWPET_SECURITY) return;

  const host = window.location.hostname;
  const params = new URLSearchParams(window.location.search);
  const explicitDevMode = params.get('devAuth') === 'true';
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  const isProductionLike = !isLocalHost && !explicitDevMode;

  window.WOWPET_SECURITY = Object.freeze({
    isProductionLike,
    allowMockAuth: !isProductionLike
  });

  window.WowPetAuthUnavailable = window.WowPetAuthUnavailable || function showAuthUnavailable() {
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

/* ============================================
   WowPetStore — Scroll Animations
   Intersection Observer + helpers
   ============================================ */

const WowAnimations = (() => {

  function init() {
    // Intersection Observer for fade-in / slide-up elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(el => {
      observer.observe(el);
    });
  }

  function confetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#D4A853', '#E8745A', '#5BA4D9', '#6BC5A0', '#9B8EC4', '#F09A86', '#E8C97A'];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (Math.random() * 8 + 4) + 'px';
      piece.style.height = (Math.random() * 8 + 4) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 5000);
  }

  function counterUp(el, target, duration = 1500) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.textContent = Math.floor(target).toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(start).toLocaleString();
      }
    }, 16);
  }

  return { init, confetti, counterUp };
})();