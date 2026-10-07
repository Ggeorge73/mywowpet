import { describe, it, expect } from 'vitest';
import { loadContact } from './helpers/load-contact.js';

const WowContact = loadContact();

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'order',
  message: 'My order has not arrived.',
};

describe('validateContactForm', () => {
  it('accepts a complete message and returns only rule-allowed fields', () => {
    const { valid, errors, data } = WowContact.validateContactForm({ ...VALID, website: '' });
    expect(valid).toBe(true);
    expect(errors).toEqual({});
    expect(Object.keys(data).sort()).toEqual(['email', 'message', 'name', 'subject']);
  });

  it('trims values and lower-cases the email', () => {
    const { data } = WowContact.validateContactForm({ ...VALID, name: '  Ada ', email: ' ADA@Example.COM ' });
    expect(data.name).toBe('Ada');
    expect(data.email).toBe('ada@example.com');
  });

  it('includes orderNumber only when provided', () => {
    expect(WowContact.validateContactForm({ ...VALID, orderNumber: '  ' }).data).not.toHaveProperty('orderNumber');
    expect(WowContact.validateContactForm({ ...VALID, orderNumber: '#1001' }).data.orderNumber).toBe('#1001');
  });

  it.each([
    ['name', ''],
    ['name', 'x'.repeat(101)],
    ['email', ''],
    ['email', 'not-an-email'],
    ['email', 'a@b'],
    ['email', 'two words@example.com'],
    ['email', `${'a'.repeat(250)}@example.com`],
    ['subject', ''],
    ['subject', 'something-else'],
    ['message', ''],
    ['message', '   '],
    ['message', 'x'.repeat(5001)],
    ['orderNumber', 'x'.repeat(41)],
  ])('rejects an invalid %s (%#)', (field, value) => {
    const { valid, errors } = WowContact.validateContactForm({ ...VALID, [field]: value });
    expect(valid).toBe(false);
    expect(errors[field]).toEqual(expect.any(String));
  });

  it('accepts values exactly at the firestore.rules limits', () => {
    const { valid } = WowContact.validateContactForm({
      ...VALID,
      name: 'x'.repeat(100),
      message: 'x'.repeat(5000),
      orderNumber: 'x'.repeat(40),
    });
    expect(valid).toBe(true);
  });

  it('handles missing input without throwing', () => {
    expect(WowContact.validateContactForm().valid).toBe(false);
    expect(WowContact.validateContactForm({ name: 42 }).valid).toBe(false);
  });
});

describe('isLikelyBot (honeypot)', () => {
  it('flags a filled honeypot field', () => {
    expect(WowContact.isLikelyBot({ ...VALID, website: 'https://spam.example' })).toBe(true);
  });

  it('passes a real visitor', () => {
    expect(WowContact.isLikelyBot({ ...VALID, website: '' })).toBe(false);
    expect(WowContact.isLikelyBot(VALID)).toBe(false);
  });
});
