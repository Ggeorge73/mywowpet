/* ============================================
   WowPetStore — Spin to Win Discount Wheel
   Canvas-based prize wheel, fires once per session
   ============================================ */

const WowSpinWheel = (() => {

  const SEGMENTS = [
    { label: '10% OFF', code: 'SPIN10', color: '#D4A853', textColor: '#fff', probability: 0.30 },
    { label: 'FREE SHIP', code: 'FREESHIP', color: '#2D5F3A', textColor: '#fff', probability: 0.20 },
    { label: '15% OFF', code: 'SPIN15', color: '#E8745A', textColor: '#fff', probability: 0.20 },
    { label: '+50 PTS', code: null, color: '#9B8EC4', textColor: '#fff', probability: 0.10 },
    { label: '20% OFF', code: 'SPIN20', color: '#5BA4D9', textColor: '#fff', probability: 0.10 },
    { label: '5% OFF', code: 'SPIN5', color: '#6BC5A0', textColor: '#fff', probability: 0.10 },
  ];

  let isSpinning = false;
  let currentAngle = 0;
  let canvas, ctx;

  function getWinSegment() {
    const rand = Math.random();
    let cumulative = 0;
    for (const seg of SEGMENTS) {
      cumulative += seg.probability;
      if (rand <= cumulative) return seg;
    }
    return SEGMENTS[0];
  }

  function drawWheel(angle) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    const arc = (2 * Math.PI) / SEGMENTS.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer ring glow
    const grd = ctx.createRadialGradient(cx, cy, r - 20, cx, cy, r + 5);
    grd.addColorStop(0, 'rgba(212,168,83,0)');
    grd.addColorStop(1, 'rgba(212,168,83,0.3)');
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();

    SEGMENTS.forEach((seg, i) => {
      const start = angle + i * arc;
      const end = start + arc;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.textColor;
      ctx.font = `bold ${canvas.width > 300 ? 13 : 11}px 'DM Sans', sans-serif`;
      ctx.fillText(seg.label, r - 14, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, 2 * Math.PI);
    const centerGrd = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 36);
    centerGrd.addColorStop(0, '#fff');
    centerGrd.addColorStop(1, '#f3ede3');
    ctx.fillStyle = centerGrd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(212,168,83,0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#D4A853';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐾', cx, cy);
  }

  function createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'spinwheel-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:600;
      background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;padding:20px;
      opacity:0;transition:opacity 0.4s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background:linear-gradient(145deg,#1a1a2e,#16213e);
        border-radius:32px;padding:36px 32px;
        max-width:480px;width:100%;text-align:center;
        box-shadow:0 40px 100px rgba(0,0,0,0.5),0 0 0 1px rgba(212,168,83,0.2);
        transform:scale(0.9) translateY(20px);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        position:relative;
      " id="spinwheel-card">
        <button onclick="WowSpinWheel.dismiss()" style="
          position:absolute;top:16px;right:16px;
          background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);
          width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;
          display:flex;align-items:center;justify-content:center;
        ">✕</button>

        <div style="font-size:28px;margin-bottom:4px;">🎰</div>
        <h2 style="color:white;font-family:'Playfair Display',serif;font-size:1.6rem;margin:0 0 6px;">Spin to Win!</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;line-height:1.5;">
          Spin the wheel for an exclusive discount — just for you! 🐾
        </p>

        <!-- Pointer -->
        <div style="position:relative;display:inline-block;">
          <div style="
            position:absolute;top:-18px;left:50%;transform:translateX(-50%);
            width:0;height:0;
            border-left:12px solid transparent;
            border-right:12px solid transparent;
            border-top:24px solid #FFD700;
            filter:drop-shadow(0 4px 8px rgba(255,215,0,0.6));
            z-index:2;
          "></div>
          <canvas id="spin-canvas" width="300" height="300" style="display:block;border-radius:50%;box-shadow:0 0 40px rgba(212,168,83,0.3);"></canvas>
        </div>

        <div id="spin-result" style="margin-top:20px;min-height:60px;display:flex;align-items:center;justify-content:center;"></div>

        <button id="spin-btn" onclick="WowSpinWheel.spin()" style="
          margin-top:16px;width:100%;padding:16px;border-radius:14px;border:none;
          background:linear-gradient(135deg,#FFD700,#FFA500);
          color:#1a1a1a;font-weight:800;font-size:17px;cursor:pointer;
          box-shadow:0 8px 24px rgba(255,165,0,0.5);
          transition:transform 0.2s ease,box-shadow 0.2s ease;
          letter-spacing:0.03em;
        " onmouseenter="this.style.transform='scale(1.03)'" onmouseleave="this.style.transform=''">
          🎰 SPIN THE WHEEL
        </button>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:12px;">One spin per session. No purchase required.</p>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      document.getElementById('spinwheel-card').style.transform = 'scale(1) translateY(0)';
    }));

    canvas = document.getElementById('spin-canvas');
    ctx = canvas.getContext('2d');
    drawWheel(0);
  }

  function spin() {
    if (isSpinning) return;
    isSpinning = true;

    const btn = document.getElementById('spin-btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }

    const winner = getWinSegment();
    const winIndex = SEGMENTS.indexOf(winner);
    const arc = (2 * Math.PI) / SEGMENTS.length;

    // Calculate target angle so winner lands at top (pointer)
    const targetAngle = -(winIndex * arc + arc / 2) - Math.PI / 2 - currentAngle;
    const spins = 6 * Math.PI * 2; // 6 full rotations
    const finalAngle = currentAngle + spins + ((targetAngle - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);

    const duration = 5000;
    const startTime = performance.now();
    const startAngle = currentAngle;

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      currentAngle = startAngle + (finalAngle - startAngle) * easeOut(t);
      drawWheel(currentAngle);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        currentAngle = finalAngle % (2 * Math.PI);
        isSpinning = false;
        showResult(winner);
      }
    }
    requestAnimationFrame(animate);
  }

  function showResult(winner) {
    const resultEl = document.getElementById('spin-result');
    const btn = document.getElementById('spin-btn');
    if (btn) btn.style.display = 'none';

    // Award points if applicable
    if (winner.label.includes('PTS')) {
      WowStore.addLoyaltyPoints(50, '🎰 Spin-to-Win reward');
    }

    // Save won code
    if (winner.code) {
      localStorage.setItem('wow_spin_code', winner.code);
    }
    localStorage.setItem('wow_spin_done', 'true');

    // Confetti!
    if (typeof WowAnimations !== 'undefined' && WowAnimations.confetti) {
      WowAnimations.confetti();
    }

    resultEl.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:48px;animation:bounce 0.6s ease;">🎉</div>
        <div style="color:white;font-size:20px;font-weight:800;margin:8px 0;font-family:'Playfair Display',serif;">You Won ${winner.label}!</div>
        ${winner.code ? `
          <div style="background:rgba(255,255,255,0.08);border:1px dashed rgba(212,168,83,0.6);border-radius:12px;padding:12px 20px;margin:12px 0;">
            <div style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Your Code</div>
            <div style="color:#FFD700;font-size:22px;font-weight:800;letter-spacing:0.15em;">${winner.code}</div>
          </div>
          <button onclick="navigator.clipboard.writeText('${winner.code}').then(()=>WowApp.showToast('Code copied!','📋'))" style="
            background:rgba(255,255,255,0.1);border:none;color:rgba(255,255,255,0.7);
            padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;margin-bottom:8px;
          ">📋 Copy Code</button>
        ` : `<div style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0;">Points added to your account!</div>`}
        <button onclick="WowSpinWheel.dismiss()" style="
          width:100%;padding:14px;border-radius:12px;border:none;
          background:linear-gradient(135deg,#FFD700,#FFA500);
          color:#1a1a1a;font-weight:700;font-size:15px;cursor:pointer;margin-top:8px;
        ">Shop Now & Use Code →</button>
      </div>
      <style>@keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}</style>
    `;
  }

  function dismiss() {
    const overlay = document.getElementById('spinwheel-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 400);
    localStorage.setItem('wow_spin_done', 'true');
  }

  function init() {
    // Only show once per session, not on checkout/cart
    const done = localStorage.getItem('wow_spin_done');
    const onCheckout = window.location.href.includes('checkout') || window.location.href.includes('cart');
    if (done || onCheckout) return;

    // Show after 12 seconds (let user look around first)
    setTimeout(() => {
      if (!document.getElementById('spinwheel-overlay')) {
        createModal();
      }
    }, 12000);
  }

  return { init, spin, dismiss };
})();
