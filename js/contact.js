/* ============================================
   My Wow Pet — Contact Form
   Messages are stored in Firestore `contactMessages` (create-only, see
   firestore.rules). Success is shown only after the write is acknowledged;
   any failure tells the customer plainly and offers email instead.
   ============================================ */

const WowContact = (() => {
  // Mirrors the limits enforced by firestore.rules for /contactMessages.
  const LIMITS = {
    name: 100,
    email: 254,
    subject: 150,
    message: 5000,
    orderNumber: 40
  };

  const SUBJECTS = ['general', 'order', 'product', 'return', 'feedback'];
  const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const SUPPORT_EMAIL = 'support@mywowpet.com';

  function clean(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  // Pure validation so it can be unit tested without a DOM. Returns the normalised
  // payload (exactly the fields firestore.rules accept) plus per-field errors.
  function validateContactForm(input = {}) {
    const data = {
      name: clean(input.name),
      email: clean(input.email).toLowerCase(),
      subject: clean(input.subject),
      message: clean(input.message)
    };
    const orderNumber = clean(input.orderNumber);
    if (orderNumber) data.orderNumber = orderNumber;

    const errors = {};
    if (!data.name) {
      errors.name = 'Please tell us your name.';
    } else if (data.name.length > LIMITS.name) {
      errors.name = `Please keep your name under ${LIMITS.name} characters.`;
    }

    if (!data.email || data.email.length > LIMITS.email || !EMAIL_PATTERN.test(data.email)) {
      errors.email = 'Please enter a valid email address so we can reply.';
    }

    if (!SUBJECTS.includes(data.subject) || data.subject.length > LIMITS.subject) {
      errors.subject = 'Please choose a subject.';
    }

    if (!data.message) {
      errors.message = 'Please write a message.';
    } else if (data.message.length > LIMITS.message) {
      errors.message = `Please keep your message under ${LIMITS.message} characters.`;
    }

    if (orderNumber.length > LIMITS.orderNumber) {
      errors.orderNumber = `Order numbers are at most ${LIMITS.orderNumber} characters.`;
    }

    return { valid: Object.keys(errors).length === 0, errors, data };
  }

  // Bots fill every field; people never see the honeypot.
  function isLikelyBot(input = {}) {
    return clean(input.website) !== '';
  }

  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('contact-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = submitButton ? submitButton.textContent : '';
    const fields = ['name', 'email', 'subject', 'orderNumber', 'message'];

    function setStatus(html, type) {
      status.innerHTML = html;
      status.className = `contact-status${type ? ` is-${type}` : ''}`;
      status.hidden = !html;
    }

    function clearFieldErrors() {
      fields.forEach((field) => {
        const input = form.elements[field];
        if (input) input.removeAttribute('aria-invalid');
      });
    }

    function readForm() {
      const values = {};
      [...fields, 'website'].forEach((field) => {
        values[field] = form.elements[field] ? form.elements[field].value : '';
      });
      return values;
    }

    function setSubmitting(isSubmitting) {
      if (!submitButton) return;
      submitButton.disabled = isSubmitting;
      submitButton.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
      submitButton.textContent = isSubmitting ? 'Sending…' : submitLabel;
    }

    form.addEventListener('input', clearFieldErrors);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFieldErrors();
      setStatus('', '');

      const values = readForm();
      if (isLikelyBot(values)) {
        form.reset();
        return;
      }

      const { valid, errors, data } = validateContactForm(values);
      if (!valid) {
        const firstInvalid = fields.find(field => errors[field]);
        fields.forEach((field) => {
          if (errors[field] && form.elements[field]) form.elements[field].setAttribute('aria-invalid', 'true');
        });
        setStatus(WowStore.escapeHTML(errors[firstInvalid]), 'error');
        if (form.elements[firstInvalid]) form.elements[firstInvalid].focus();
        return;
      }

      setSubmitting(true);
      try {
        if (window.WowApp && typeof WowApp.whenFirebaseReady === 'function') {
          await WowApp.whenFirebaseReady();
        }
        const firebaseService = window.WowFirebase;
        if (!firebaseService || typeof firebaseService.submitContactMessage !== 'function') {
          throw new Error('contact-service-unavailable');
        }
        await firebaseService.submitContactMessage(data);
        form.reset();
        setStatus('<strong>Message sent.</strong> Thanks for getting in touch. We aim to reply within 24 hours.', 'success');
      } catch (err) {
        console.error('[My Wow Pet] Contact message could not be saved:', err);
        setStatus(
          '<strong>Your message wasn’t sent.</strong> Something went wrong on our side. '
          + `Please try again, or email us directly at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.`,
          'error'
        );
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  return { LIMITS, SUBJECTS, validateContactForm, isLikelyBot, init };
})();

if (typeof window !== 'undefined') {
  window.WowContact = WowContact;
}
