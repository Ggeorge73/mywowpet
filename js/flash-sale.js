/* ============================================
   WowPetStore — Flash Sale Countdown Timer
   24-hour rotating urgency timer
   ============================================ */

const WowFlashSale = (() => {

  function getOrCreateEndTime() {
    const stored = localStorage.getItem('wow_flash_end');
    const now = Date.now();
    if (stored && parseInt(stored) > now) {
      return parseInt(stored);
    }
    // Set new 24h window
    const end = now + 24 * 60 * 60 * 1000;
    localStorage.setItem('wow_flash_end', end);
    return end;
  }

  function formatTime(ms) {
    if (ms <= 0) return { h: '00', m: '00', s: '00' };
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return { h, m, s };
  }

  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'flash-sale-banner';
    banner.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        color: white;
        padding: 10px 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        font-family: var(--font-accent, 'DM Sans', sans-serif);
        flex-wrap: wrap;
        position: relative;
        overflow: hidden;
      ">
        <!-- Animated shimmer -->
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent);animation:shimmer 3s infinite;"></div>
        <div style="display:flex;align-items:center;gap:10px;font-weight:700;font-size:13px;letter-spacing:0.05em;">
          <span style="background:linear-gradient(135deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:15px;">⚡ FLASH SALE</span>
          <span style="background:rgba(255,255,255,0.1);padding:3px 10px;border-radius:99px;font-size:12px;">UP TO 25% OFF</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;opacity:0.9;">
          <span>Ends in:</span>
          <div style="display:flex;gap:6px;align-items:center;">
            <div class="flash-unit" style="background:rgba(255,255,255,0.12);border-radius:8px;padding:5px 10px;text-align:center;min-width:44px;">
              <div id="flash-h" style="font-size:18px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;">00</div>
              <div style="font-size:9px;opacity:0.7;margin-top:2px;letter-spacing:0.08em;">HRS</div>
            </div>
            <span style="font-weight:700;opacity:0.6;font-size:16px;margin-top:-4px;">:</span>
            <div class="flash-unit" style="background:rgba(255,255,255,0.12);border-radius:8px;padding:5px 10px;text-align:center;min-width:44px;">
              <div id="flash-m" style="font-size:18px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;">00</div>
              <div style="font-size:9px;opacity:0.7;margin-top:2px;letter-spacing:0.08em;">MIN</div>
            </div>
            <span style="font-weight:700;opacity:0.6;font-size:16px;margin-top:-4px;">:</span>
            <div class="flash-unit" style="background:rgba(255,255,255,0.12);border-radius:8px;padding:5px 10px;text-align:center;min-width:44px;">
              <div id="flash-s" style="font-size:18px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums;">00</div>
              <div style="font-size:9px;opacity:0.7;margin-top:2px;letter-spacing:0.08em;">SEC</div>
            </div>
          </div>
        </div>
        <a href="shop.html" style="
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #1a1a1a;
          padding: 7px 20px;
          border-radius: 99px;
          font-weight: 700;
          font-size: 12px;
          text-decoration: none;
          letter-spacing: 0.05em;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 12px rgba(255,165,0,0.4);
        " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
          SHOP NOW →
        </a>
        <button onclick="document.getElementById('flash-sale-banner').style.display='none'" style="
          position:absolute;right:12px;top:50%;transform:translateY(-50%);
          background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;
          font-size:18px;padding:4px;line-height:1;
        " title="Dismiss">✕</button>
      </div>
      <style>
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      </style>
    `;
    return banner;
  }

  function tick(endTime) {
    const remaining = endTime - Date.now();
    const { h, m, s } = formatTime(remaining);
    const hEl = document.getElementById('flash-h');
    const mEl = document.getElementById('flash-m');
    const sEl = document.getElementById('flash-s');
    if (hEl) hEl.textContent = h;
    if (mEl) mEl.textContent = m;
    if (sEl) {
      // Pulse animation on seconds change
      sEl.style.transform = 'scale(1.15)';
      sEl.textContent = s;
      setTimeout(() => { if(sEl) sEl.style.transform = 'scale(1)'; }, 150);
    }
    if (remaining <= 0) {
      // Reset timer
      localStorage.removeItem('wow_flash_end');
      init();
    }
  }

  function init() {
    const endTime = getOrCreateEndTime();
    // Inject banner right after the nav-slot
    const navSlot = document.getElementById('nav-slot');
    if (!navSlot) return;
    const existing = document.getElementById('flash-sale-banner');
    if (existing) existing.remove();
    navSlot.insertAdjacentElement('afterend', createBanner());
    tick(endTime);
    setInterval(() => tick(endTime), 1000);
  }

  return { init };
})();
