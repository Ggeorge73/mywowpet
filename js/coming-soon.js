(function () {
  'use strict';

  var form = document.getElementById('early-access-form');
  var emailInput = document.getElementById('signup-email');
  var petTypeInput = document.getElementById('pet-type');
  var consentInput = document.getElementById('marketing-consent');
  var status = document.getElementById('form-status');
  var submitButton = form ? form.querySelector('button[type="submit"]') : null;
  var submitLabel = submitButton ? submitButton.querySelector('span') : null;
  var year = document.getElementById('current-year');

  var firebaseConfig = {
    apiKey: ['AIzaSyDjG3', 'ymeHrdaj', 'vn7N0L7w', 'ZAv5onhgxKpdU'].join(''),
    authDomain: 'wow-pet-store.firebaseapp.com',
    projectId: 'wow-pet-store',
    storageBucket: 'wow-pet-store.firebasestorage.app',
    messagingSenderId: '31785910803',
    appId: '1:31785910803:web:0221850bdaafec40b175e6'
  };

  var database = null;

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status is-visible ' + (type === 'success' ? 'is-success' : 'is-error');
  }

  function clearStatus() {
    if (!status) return;
    status.textContent = '';
    status.className = 'form-status';
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? 'Saving your spot…' : 'Save my spot';
    }
  }

  function initializeDatabase() {
    if (!window.firebase || !window.firebase.firestore) {
      throw new Error('signup-service-unavailable');
    }

    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }

    database = window.firebase.firestore();
    return database;
  }

  async function emailFingerprint(email) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return 'signup-' + String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);
    }

    var bytes = new window.TextEncoder().encode(email);
    var digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map(function (byte) { return byte.toString(16).padStart(2, '0'); })
      .join('');
  }

  // Signup docs cannot be read back (rules deny reads), so a re-submit of an existing
  // signup surfaces as permission-denied. Remember fingerprints saved from this browser
  // so only that genuine duplicate is reported as "already on the list".
  var SAVED_SIGNUPS_KEY = 'wow_launch_signups';

  function readSavedSignups() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(SAVED_SIGNUPS_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function rememberSignup(signupId) {
    try {
      var saved = readSavedSignups();
      if (saved.indexOf(signupId) === -1) saved.push(signupId);
      window.localStorage.setItem(SAVED_SIGNUPS_KEY, JSON.stringify(saved.slice(-20)));
    } catch {
      // Storage unavailable: duplicates will just show the generic retry message.
    }
  }

  async function isKnownSignup(email) {
    try {
      return readSavedSignups().indexOf(await emailFingerprint(email)) !== -1;
    } catch {
      return false;
    }
  }

  async function saveSignup(email, petType) {
    var db = database || initializeDatabase();
    var signupId = await emailFingerprint(email);

    await db.collection('launchSignups').doc(signupId).set({
      email: email,
      petType: petType,
      consent: true,
      source: 'coming-soon',
      offer: 'launch-15',
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
    rememberSignup(signupId);
  }

  if (!form || !emailInput || !petTypeInput || !consentInput) return;

  form.addEventListener('input', function () {
    clearStatus();
    emailInput.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearStatus();

    var email = emailInput.value.trim().toLowerCase();
    var petType = petTypeInput.value || 'not-specified';

    if (!emailInput.validity.valid || !email) {
      emailInput.setAttribute('aria-invalid', 'true');
      setStatus('Please enter a valid email address so we know where to send your discount.', 'error');
      emailInput.focus();
      return;
    }

    if (!consentInput.checked) {
      setStatus('Please confirm that you’d like to receive your launch offer and store updates.', 'error');
      consentInput.focus();
      return;
    }

    setSubmitting(true);

    try {
      await saveSignup(email, petType);
      form.reset();
      setStatus('You’re in the pack! We’ll send your private 15% code before opening day.', 'success');
    } catch (error) {
      var isDuplicate = error && (error.code === 'already-exists'
        || (error.code === 'permission-denied' && await isKnownSignup(email)));
      if (isDuplicate) {
        setStatus('You’re already on the list — your 15% opening offer is saved.', 'success');
      } else {
        setStatus('We couldn’t save your spot just now. Please try again in a moment.', 'error');
      }
      if (window.console && window.console.error) {
        console.error('[My Wow Pet] Early-access signup failed:', error);
      }
    } finally {
      setSubmitting(false);
    }
  });

  try {
    initializeDatabase();
  } catch (error) {
    if (window.console && window.console.warn) {
      console.warn('[My Wow Pet] Signup service is still loading.', error);
    }
  }
})();
