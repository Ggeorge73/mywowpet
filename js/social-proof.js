/* ============================================
   WowPetStore — Live Social Proof Feed
   Shows real-time purchase notifications
   ============================================ */

const WowSocialProof = (() => {
  const events = [
    { name: 'Sarah M.', location: 'Austin, TX', action: 'just ordered', product: 'Wild Earth Grain-Free Dog Food', time: '2 min ago' },
    { name: 'James K.', location: 'Portland, OR', action: 'subscribed to', product: 'NutriPaws Omega-3 Supplement', time: '4 min ago' },
    { name: 'Priya R.', location: 'Chicago, IL', action: 'just bought', product: 'ZenPet Calming Chews', time: '1 min ago' },
    { name: 'Marcus T.', location: 'Denver, CO', action: 'added to cart', product: 'PurrfectBite Salmon Pâté', time: '3 min ago' },
    { name: 'Emma L.', location: 'Seattle, WA', action: 'just ordered', product: 'BarkBox Interactive Puzzle Feeder', time: '5 min ago' },
    { name: 'Carlos V.', location: 'Miami, FL', action: 'subscribed to', product: 'Royal Canin Indoor Cat Food', time: '7 min ago' },
    { name: 'Aisha B.', location: 'Brooklyn, NY', action: 'just bought', product: 'FurEver Orthopedic Dog Bed', time: '2 min ago' },
    { name: 'Tyler W.', location: 'Nashville, TN', action: 'just ordered', product: 'HappyPaws Freeze-Dried Treats', time: '6 min ago' },
    { name: 'Lin C.', location: 'San Francisco, CA', action: 'subscribed to', product: 'Wild Earth Grain-Free Dog Food', time: '8 min ago' },
    { name: 'Olivia S.', location: 'Phoenix, AZ', action: 'just bought', product: 'PawCare Vitamin Supplement', time: '3 min ago' },
    { name: 'Devon P.', location: 'Atlanta, GA', action: 'added to cart', product: 'Feather Wand Cat Toy', time: '1 min ago' },
    { name: 'Nina K.', location: 'Boston, MA', action: 'just ordered', product: 'GoldenPup Puppy Starter Kit', time: '4 min ago' },
    { name: 'Rafael M.', location: 'Los Angeles, CA', action: 'just bought', product: 'BirdsEye Premium Seed Mix', time: '9 min ago' },
    { name: 'Zoe H.', location: 'Minneapolis, MN', action: 'subscribed to', product: 'PurrfectBite Salmon Pâté', time: '2 min ago' },
    { name: 'Ben A.', location: 'Dallas, TX', action: 'just ordered', product: 'TinyPaws Hamster Play Set', time: '5 min ago' },
  ];

  let index = 0;
  let container = null;
  let timer = null;
  let isPaused = false;

  function createContainer() {
    container = document.createElement('div');
    container.id = 'social-proof-feed';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 450;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  function showNotification() {
    if (isPaused || document.hidden) return;

    const evt = events[index % events.length];
    index++;

    const notif = document.createElement('div');
    notif.style.cssText = `
      background: var(--glass-bg, rgba(255,255,255,0.92));
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--color-border, #E8E2D8);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      max-width: 320px;
      pointer-events: all;
      cursor: pointer;
      transform: translateX(-120%);
      transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
      opacity: 0;
    `;

    notif.innerHTML = `
      <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary),var(--color-secondary));display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;">🐾</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:700;color:var(--color-text);line-height:1.3;">${evt.name} <span style="font-weight:400;color:var(--color-text-secondary);">from ${evt.location}</span></div>
        <div style="font-size:12px;color:var(--color-text-secondary);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${evt.action} <strong style="color:var(--color-text);">${evt.product}</strong></div>
        <div style="font-size:11px;color:var(--color-text-muted);margin-top:4px;">⏱ ${evt.time}</div>
      </div>
      <button onclick="this.closest('[id]').remove()" style="background:none;border:none;cursor:pointer;color:var(--color-text-muted);font-size:16px;flex-shrink:0;padding:0;line-height:1;">✕</button>
    `;

    notif.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      window.location.href = 'shop.html';
    });

    container.appendChild(notif);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notif.style.transform = 'translateX(0)';
        notif.style.opacity = '1';
      });
    });

    // Auto-dismiss after 6s
    setTimeout(() => {
      notif.style.transform = 'translateX(-120%)';
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 400);
    }, 6000);
  }

  function init() {
    // Don't show on checkout
    if (window.location.href.includes('checkout')) return;

    createContainer();

    // Shuffle events for variety
    events.sort(() => Math.random() - 0.5);

    // Show first notification after 8s
    setTimeout(() => {
      showNotification();
      // Then every 30-45s
      timer = setInterval(() => {
        const delay = 30000 + Math.random() * 15000;
        setTimeout(showNotification, delay);
      }, 45000);
    }, 8000);

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      isPaused = document.hidden;
    });
  }

  return { init };
})();
