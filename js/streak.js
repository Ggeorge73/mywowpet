/* ============================================
   WowPetStore — Daily Paw Streak System
   Tracks daily check-ins, rewards loyalty points
   ============================================ */

const WowStreak = (() => {

  const STREAK_KEY = 'wow_streak';
  const LAST_VISIT_KEY = 'wow_last_visit';
  const CLAIMED_TODAY_KEY = 'wow_streak_claimed';

  function getToday() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  function getStreakData() {
    try {
      return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, best: 0 };
    } catch { return { count: 0, best: 0 }; }
  }

  function saveStreakData(data) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  }

  function checkAndUpdateStreak() {
    const today = getToday();
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const claimedToday = localStorage.getItem(CLAIMED_TODAY_KEY);
    const data = getStreakData();

    if (lastVisit === today) {
      // Already visited today
      return { data, isNewDay: false, claimedToday: claimedToday === today };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastVisit === yesterdayStr) {
      // Consecutive day — extend streak
      data.count += 1;
    } else if (!lastVisit) {
      // First ever visit
      data.count = 1;
    } else {
      // Streak broken
      data.count = 1;
    }

    data.best = Math.max(data.best, data.count);
    saveStreakData(data);
    localStorage.setItem(LAST_VISIT_KEY, today);

    return { data, isNewDay: true, claimedToday: false };
  }

  function claimPoints() {
    const today = getToday();
    if (localStorage.getItem(CLAIMED_TODAY_KEY) === today) return false;
    WowStore.addLoyaltyPoints(10, '🔥 Daily streak check-in');
    localStorage.setItem(CLAIMED_TODAY_KEY, today);
    if (typeof WowApp !== 'undefined') {
      WowApp.showToast('🔥 +10 points for your daily streak!', '🐾', 4000);
    }
    return true;
  }

  function getMilestoneReward(count) {
    if (count === 7) return { points: 100, code: 'STREAK7', msg: '7-Day Champion!' };
    if (count === 14) return { points: 200, code: 'STREAK14', msg: '2-Week Legend!' };
    if (count === 30) return { points: 500, code: 'STREAK30', msg: '30-Day Pet Expert!' };
    return null;
  }

  function buildWidget(data, isNewDay) {
    const today = getToday();
    const claimed = localStorage.getItem(CLAIMED_TODAY_KEY) === today;
    const milestone = getMilestoneReward(data.count);

    // Build 7-day grid
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      days.push({ date: dStr, isToday: i === 0 });
    }

    const flames = ['❄️','🌱','🔥','🔥','💥','⚡','🌟','👑'];
    const flameIcon = flames[Math.min(data.count, flames.length - 1)];

    return `
      <div id="streak-widget" style="
        background: linear-gradient(135deg, var(--color-dark-bg, #1a1a1a) 0%, #1a1a2e 100%);
        border-radius: 24px;
        padding: 28px;
        color: white;
        position: relative;
        overflow: hidden;
      ">
        <!-- Background glow -->
        <div style="position:absolute;top:-40px;right:-40px;width:150px;height:150px;background:radial-gradient(circle,rgba(212,168,83,0.2),transparent 70%);pointer-events:none;"></div>

        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
          <div style="font-size:52px;line-height:1;filter:drop-shadow(0 0 20px rgba(255,165,0,0.6));">${flameIcon}</div>
          <div>
            <div style="font-size:42px;font-weight:800;line-height:1;background:linear-gradient(135deg,#FFD700,#FFA500);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${data.count}</div>
            <div style="font-size:14px;opacity:0.7;margin-top:2px;">Day Streak</div>
          </div>
          <div style="margin-left:auto;text-align:right;">
            <div style="font-size:11px;opacity:0.5;text-transform:uppercase;letter-spacing:0.1em;">Best</div>
            <div style="font-size:20px;font-weight:700;opacity:0.8;">${data.best} days</div>
          </div>
        </div>

        <!-- 7-day grid -->
        <div style="display:flex;gap:8px;margin-bottom:20px;justify-content:center;">
          ${days.map((d, i) => {
            const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(d.date + 'T12:00:00').getDay()];
            const isActive = i >= 7 - data.count && data.count > 0;
            return `
              <div style="flex:1;text-align:center;">
                <div style="font-size:9px;opacity:0.5;margin-bottom:6px;text-transform:uppercase;">${dayName}</div>
                <div style="
                  width:100%;aspect-ratio:1;border-radius:10px;
                  display:flex;align-items:center;justify-content:center;
                  font-size:16px;
                  background:${isActive ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 'rgba(255,255,255,0.08)'};
                  box-shadow:${isActive ? '0 4px 12px rgba(255,165,0,0.4)' : 'none'};
                  border:${d.isToday ? '2px solid rgba(212,168,83,0.8)' : '2px solid transparent'};
                ">${isActive ? '🐾' : '·'}</div>
              </div>
            `;
          }).join('')}
        </div>

        ${milestone ? `
          <div style="background:linear-gradient(135deg,rgba(212,168,83,0.2),rgba(255,165,0,0.1));border:1px solid rgba(212,168,83,0.4);border-radius:12px;padding:12px 16px;margin-bottom:16px;text-align:center;">
            <div style="font-size:13px;font-weight:700;color:#FFD700;">🏆 ${milestone.msg}</div>
            <div style="font-size:12px;opacity:0.8;margin-top:4px;">Bonus code: <strong>${milestone.code}</strong> for +${milestone.points} extra points!</div>
          </div>
        ` : ''}

        ${!claimed ? `
          <button onclick="WowStreak.claimAndRefresh()" style="
            width:100%;padding:14px;border-radius:12px;border:none;cursor:pointer;
            background:linear-gradient(135deg,#FFD700,#FFA500);
            color:#1a1a1a;font-weight:700;font-size:15px;
            box-shadow:0 6px 20px rgba(255,165,0,0.4);
            transition:transform 0.2s ease, box-shadow 0.2s ease;
          " onmouseenter="this.style.transform='scale(1.02)';this.style.boxShadow='0 8px 24px rgba(255,165,0,0.5)'"
             onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='0 6px 20px rgba(255,165,0,0.4)'">
            🐾 Claim Today's +10 Points!
          </button>
        ` : `
          <div style="width:100%;padding:14px;border-radius:12px;background:rgba(255,255,255,0.06);text-align:center;font-size:14px;opacity:0.6;">
            ✅ Today's points claimed — Come back tomorrow!
          </div>
        `}
        <div style="text-align:center;margin-top:10px;font-size:11px;opacity:0.4;">Streak resets if you miss a day</div>
      </div>
    `;
  }

  function claimAndRefresh() {
    claimPoints();
    const { data } = checkAndUpdateStreak();
    const widget = document.getElementById('streak-widget');
    if (widget) widget.outerHTML = buildWidget(data, false);
    // Re-bind
    document.getElementById('streak-widget') && initWidget();
  }

  function initWidget() {
    // Mount widget into any element with id="streak-widget-mount"
    const mount = document.getElementById('streak-widget-mount');
    if (!mount) return;
    const { data, isNewDay } = checkAndUpdateStreak();
    mount.innerHTML = buildWidget(data, isNewDay);
  }

  function init() {
    const { data, isNewDay } = checkAndUpdateStreak();

    // Auto-show a celebration toast for new-day streak continuation
    if (isNewDay && data.count > 1) {
      setTimeout(() => {
        if (typeof WowApp !== 'undefined') {
          WowApp.showToast(`🔥 Day ${data.count} streak! Claim your +10 points in your profile.`, '🐾', 5000);
        }
      }, 3000);
    } else if (isNewDay && data.count === 1 && !localStorage.getItem(LAST_VISIT_KEY + '_welcomed')) {
      localStorage.setItem(LAST_VISIT_KEY + '_welcomed', '1');
      setTimeout(() => {
        if (typeof WowApp !== 'undefined') {
          WowApp.showToast('👋 Start your Daily Paw Streak — earn points every day!', '🐾', 5000);
        }
      }, 5000);
    }

    initWidget();
  }

  return { init, initWidget, claimAndRefresh, getStreakData };
})();
