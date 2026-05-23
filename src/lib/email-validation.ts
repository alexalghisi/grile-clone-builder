// Strict server-side email validator used by the quiz email gate.
// Goal: reject obvious junk like aa@aaa.com, test@test.com, x@x.x without
// blocking real users. Pair with the disposable-domain blocklist below.

const DISPOSABLE_DOMAINS = new Set([
  'aaa.com', 'aaaa.com', 'aaaaa.com', 'bbb.com', 'ccc.com', 'xxx.com',
  'test.com', 'tests.com', 'testing.com', 'example.com', 'example.org',
  'example.net', 'fake.com', 'fakeemail.com', 'fakeinbox.com', 'fake.email',
  'asdf.com', 'qwer.com', 'qwerty.com', 'abc.com', 'abcd.com', 'sample.com',
  'mail.com', 'email.com',
  // common disposable inbox providers
  'mailinator.com', 'mailinator.net', 'tempmail.com', 'temp-mail.org',
  'tempmailo.com', 'temp-mail.io', '10minutemail.com', '10minutemail.net',
  'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com', 'grr.la',
  'throwaway.email', 'throwawaymail.com', 'yopmail.com', 'yopmail.net',
  'trashmail.com', 'trashmail.net', 'getnada.com', 'maildrop.cc',
  'dispostable.com', 'mintemail.com', 'mohmal.com', 'inboxbear.com',
  'spam4.me', 'spambox.us', 'spamgourmet.com', 'discard.email',
  'mailcatch.com', 'mytemp.email', 'mailnesia.com', 'tempinbox.com',
  'fakemailgenerator.com', 'dropmail.me', 'mailpoof.com',
]);

const RFC5322_LIKE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

export type EmailValidation =
  | { ok: true; email: string }
  | { ok: false; reason: string };

export function validateLeadEmail(input: unknown): EmailValidation {
  if (typeof input !== 'string') return { ok: false, reason: 'Email invalid.' };
  const email = input.trim().toLowerCase();

  if (email.length < 6 || email.length > 254) {
    return { ok: false, reason: 'Email invalid.' };
  }
  if (!RFC5322_LIKE.test(email)) {
    return { ok: false, reason: 'Format invalid.' };
  }

  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (local.length < 2 || local.length > 64) {
    return { ok: false, reason: 'Email invalid.' };
  }
  if (domain.length < 4 || domain.length > 253) {
    return { ok: false, reason: 'Domeniu invalid.' };
  }

  // Block dot-edges / consecutive dots
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return { ok: false, reason: 'Email invalid.' };
  }
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return { ok: false, reason: 'Domeniu invalid.' };
  }

  // Domain must have a TLD label of at least 2 letters and a SLD with letters
  const labels = domain.split('.');
  if (labels.length < 2) return { ok: false, reason: 'Domeniu invalid.' };
  const tld = labels[labels.length - 1];
  const sld = labels[labels.length - 2];
  if (!/^[a-z]{2,}$/.test(tld)) return { ok: false, reason: 'Domeniu invalid.' };
  if (sld.length < 2 || !/[a-z]/.test(sld)) {
    return { ok: false, reason: 'Domeniu invalid.' };
  }

  // Reject "a@a.aa", "aa@aa.aa", "aaa@aaa.com" — every char in local or SLD is identical
  const allSameLocal = /^(.)\1+$/.test(local);
  const allSameSld = /^(.)\1+$/.test(sld);
  if (allSameLocal && local.length <= 3) {
    return { ok: false, reason: 'Email pare fals.' };
  }
  if (allSameSld) {
    return { ok: false, reason: 'Domeniu pare fals.' };
  }

  // Local must contain a letter or digit (no "..." / "---")
  if (!/[a-z0-9]/.test(local)) {
    return { ok: false, reason: 'Email invalid.' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: 'Adresa nu este acceptată.' };
  }

  // Block patterns that look like keyboard mashing in the SLD
  const KEYBOARD_JUNK = ['asdf', 'qwer', 'qwert', 'qwerty', 'zxcv', 'hjkl'];
  if (KEYBOARD_JUNK.includes(sld)) {
    return { ok: false, reason: 'Email pare fals.' };
  }

  return { ok: true, email };
}
