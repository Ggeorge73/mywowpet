/* ============================================
   PET CURSOR SYSTEM — Interactive Module
   ============================================
   Creates an animated pet that follows the cursor.
   Users pick their pet from a floating picker widget.
   Each pet has unique movement, idle, and click animations.
   Preference is persisted in localStorage.
   ============================================ */
(function () {
  'use strict';

  // ---- Touch-only detection: bail out if no mouse ----
  var hasMouse = window.matchMedia('(pointer: fine)').matches;
  if (!hasMouse && 'ontouchstart' in window) return;

  // ============================================
  //   PET DEFINITIONS
  // ============================================
  var PETS = {
    dog:     { name: 'Dog',     emoji: '\u{1F415}', color: '#FB923C', trail: 'paw', lerpSpeed: 0.18 },
    cat:     { name: 'Cat',     emoji: '\u{1F408}', color: '#C084FC', trail: 'paw', lerpSpeed: 0.14 },
    bird:    { name: 'Bird',    emoji: '\u{1F426}', color: '#38BDF8', trail: 'dot', lerpSpeed: 0.16 },
    bunny:   { name: 'Bunny',   emoji: '\u{1F430}', color: '#F472B6', trail: 'paw', lerpSpeed: 0.13 },
    fish:    { name: 'Fish',    emoji: '\u{1F420}', color: '#2DD4BF', trail: 'dot', lerpSpeed: 0.10 },
    hamster: { name: 'Hamster', emoji: '\u{1F439}', color: '#FBBF24', trail: 'paw', lerpSpeed: 0.20 }
  };

  // ============================================
  //   STATE
  // ============================================
  var activePetKey = null;
  var mouseX = -100, mouseY = -100;
  var cursorX = -100, cursorY = -100;
  var isMoving = false;
  var moveTimer = null;
  var facingRight = true;
  var lastMoveX = 0;
  var trailCounter = 0;
  var clickReactTimer = null;
  var panelOpen = false;

  // DOM references
  var cursorEl, directionEl, emojiEl;
  var pickerBtn, pickerPanel;

  // ============================================
  //   INITIALIZATION
  // ============================================
  function init() {
    createCursorElement();
    createPickerUI();
    loadSavedPet();

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('click', onDocClick);
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  //   CREATE DOM ELEMENTS
  // ============================================
  function createCursorElement() {
    cursorEl = document.createElement('div');
    cursorEl.id = 'pet-cursor';
    cursorEl.style.display = 'none';

    directionEl = document.createElement('div');
    directionEl.className = 'pet-direction';

    emojiEl = document.createElement('span');
    emojiEl.className = 'pet-emoji';

    directionEl.appendChild(emojiEl);
    cursorEl.appendChild(directionEl);
    document.body.appendChild(cursorEl);
  }

  function createPickerUI() {
    // Floating button
    pickerBtn = document.createElement('button');
    pickerBtn.className = 'pet-picker-btn';
    pickerBtn.setAttribute('aria-label', 'Choose your pet cursor');
    pickerBtn.innerHTML = '\u{1F43E}'; // paw emoji
    pickerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      togglePanel();
    });
    document.body.appendChild(pickerBtn);

    // Selection panel
    pickerPanel = document.createElement('div');
    pickerPanel.className = 'pet-picker-panel';

    var title = document.createElement('h3');
    title.textContent = '\u{1F43E} Choose Your Pet Cursor';
    pickerPanel.appendChild(title);

    var subtitle = document.createElement('p');
    subtitle.className = 'picker-subtitle';
    subtitle.textContent = 'Your pet follows your mouse everywhere!';
    pickerPanel.appendChild(subtitle);

    var grid = document.createElement('div');
    grid.className = 'pet-picker-grid';

    Object.keys(PETS).forEach(function (key) {
      var pet = PETS[key];
      var card = document.createElement('div');
      card.className = 'pet-picker-card';
      card.setAttribute('data-pet', key);
      card.style.setProperty('--pet-color', pet.color);

      var em = document.createElement('span');
      em.className = 'pet-card-emoji';
      em.textContent = pet.emoji;
      card.appendChild(em);

      var nm = document.createElement('span');
      nm.className = 'pet-card-name';
      nm.textContent = pet.name;
      card.appendChild(nm);

      card.addEventListener('click', function (e) {
        e.stopPropagation();
        selectPet(key);
      });

      grid.appendChild(card);
    });

    pickerPanel.appendChild(grid);

    // Turn off button
    var offBtn = document.createElement('button');
    offBtn.className = 'pet-picker-off';
    offBtn.innerHTML = '\u2716  Turn Off Pet Cursor';
    offBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      selectPet(null);
    });
    pickerPanel.appendChild(offBtn);

    document.body.appendChild(pickerPanel);
  }

  // ============================================
  //   PET SELECTION
  // ============================================
  function selectPet(key) {
    activePetKey = key;

    // Persist
    if (key) {
      localStorage.setItem('wow-pet-cursor', key);
    } else {
      localStorage.removeItem('wow-pet-cursor');
    }

    // Update cursor element
    if (key && PETS[key]) {
      var pet = PETS[key];
      emojiEl.textContent = pet.emoji;
      cursorEl.style.display = 'block';
      cursorEl.className = 'pet-' + key + ' idle';
      document.body.classList.add('pet-cursor-active');

      // Update picker button glow color
      pickerBtn.style.setProperty('--picker-glow', pet.color + '80');
    } else {
      cursorEl.style.display = 'none';
      cursorEl.className = '';
      document.body.classList.remove('pet-cursor-active');
      pickerBtn.style.setProperty('--picker-glow', 'rgba(168,85,247,0.3)');
    }

    // Update picker card selection states
    updatePickerSelection();
    closePanel();
  }

  function updatePickerSelection() {
    var cards = pickerPanel.querySelectorAll('.pet-picker-card');
    for (var i = 0; i < cards.length; i++) {
      var petKey = cards[i].getAttribute('data-pet');
      if (petKey === activePetKey) {
        cards[i].classList.add('selected');
      } else {
        cards[i].classList.remove('selected');
      }
    }

    var offBtn = pickerPanel.querySelector('.pet-picker-off');
    if (!activePetKey) {
      offBtn.classList.add('selected');
    } else {
      offBtn.classList.remove('selected');
    }
  }

  function loadSavedPet() {
    var saved = localStorage.getItem('wow-pet-cursor');
    if (saved && PETS[saved]) {
      selectPet(saved);
    }
  }

  // ============================================
  //   PICKER PANEL TOGGLE
  // ============================================
  function togglePanel() {
    if (panelOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function openPanel() {
    panelOpen = true;
    pickerPanel.classList.add('open');
  }

  function closePanel() {
    panelOpen = false;
    pickerPanel.classList.remove('open');
  }

  // ============================================
  //   MOUSE TRACKING
  // ============================================
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Direction detection
    var dx = mouseX - lastMoveX;
    if (Math.abs(dx) > 2) {
      facingRight = dx > 0;
      lastMoveX = mouseX;
    }

    // Movement detection
    if (!isMoving && activePetKey) {
      isMoving = true;
      updateAnimationState();
    }

    clearTimeout(moveTimer);
    moveTimer = setTimeout(function () {
      isMoving = false;
      if (activePetKey) updateAnimationState();
    }, 180);

    trailCounter++;
  }

  // ============================================
  //   CLICK REACTION
  // ============================================
  function onDocClick(e) {
    // Close panel if clicking outside
    if (panelOpen && !pickerPanel.contains(e.target) && !pickerBtn.contains(e.target)) {
      closePanel();
    }

    // Pet click reaction
    if (activePetKey && !pickerBtn.contains(e.target) && !pickerPanel.contains(e.target)) {
      triggerClickReaction();
    }
  }

  function triggerClickReaction() {
    if (clickReactTimer) clearTimeout(clickReactTimer);

    // Set click-react class, which plays the click animation
    cursorEl.className = 'pet-' + activePetKey + ' click-react';
    if (!facingRight) cursorEl.classList.add('facing-left');

    clickReactTimer = setTimeout(function () {
      updateAnimationState();
      clickReactTimer = null;
    }, 450);
  }

  // ============================================
  //   ANIMATION STATE
  // ============================================
  function updateAnimationState() {
    if (!activePetKey) return;
    var state = isMoving ? 'moving' : 'idle';
    cursorEl.className = 'pet-' + activePetKey + ' ' + state;
    if (!facingRight) cursorEl.classList.add('facing-left');
  }

  // ============================================
  //   ANIMATION LOOP (requestAnimationFrame)
  // ============================================
  function tick() {
    if (activePetKey && PETS[activePetKey]) {
      var speed = PETS[activePetKey].lerpSpeed;

      // Smooth lerp toward mouse position
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;

      // Position the cursor element (offset above the mouse so the pet sits "on" the pointer)
      cursorEl.style.left = cursorX + 'px';
      cursorEl.style.top = (cursorY - 16) + 'px';

      // Spawn trail particles while moving
      if (isMoving && trailCounter % 5 === 0) {
        spawnTrailParticle(cursorX, cursorY);
      }
    }

    requestAnimationFrame(tick);
  }

  // ============================================
  //   TRAIL PARTICLES
  // ============================================
  function spawnTrailParticle(x, y) {
    if (!activePetKey || !PETS[activePetKey]) return;

    var pet = PETS[activePetKey];
    var el;

    if (pet.trail === 'paw') {
      el = document.createElement('div');
      el.className = 'pet-trail-paw';
      el.textContent = '\u{1F43E}';
      el.style.left = (x + (Math.random() * 16 - 8)) + 'px';
      el.style.top = (y + (Math.random() * 8)) + 'px';
      var angle = Math.random() * 40 - 20;
      el.style.setProperty('--paw-angle', angle + 'deg');
    } else {
      el = document.createElement('div');
      el.className = 'pet-trail-particle';
      var size = 4 + Math.random() * 5;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.background = pet.color;
      el.style.left = (x + (Math.random() * 20 - 10)) + 'px';
      el.style.top = (y + (Math.random() * 10)) + 'px';
    }

    document.body.appendChild(el);

    // Auto-remove after animation
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 850);
  }

})();
