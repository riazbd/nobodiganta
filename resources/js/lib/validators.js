/**
 * Form validation utilities.
 */

const BD_PHONE_REGEX = /^(\+?880|0)[1-9][0-9]{8,9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate contact form fields.
 * @param {{ name, email, phone, subject, message }} form
 * @param {'bn'|'en'} lang
 * @returns {Record<string, string>} errors — empty means valid
 */
export function validateContactForm(form, lang = 'bn') {
  const errors = {};
  const isBn = lang === 'bn';

  if (!form.name?.trim()) {
    errors.name = isBn ? 'নাম আবশ্যক' : 'Name is required';
  }

  if (!form.email?.trim()) {
    errors.email = isBn ? 'ইমেইল আবশ্যক' : 'Email is required';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = isBn ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Enter a valid email address';
  }

  if (form.phone?.trim() && !BD_PHONE_REGEX.test(form.phone.trim().replace(/\s/g, ''))) {
    errors.phone = isBn ? 'সঠিক বাংলাদেশী নম্বর দিন (যেমন: 01XXXXXXXXX)' : 'Enter a valid Bangladesh phone number';
  }

  if (!form.subject?.trim()) {
    errors.subject = isBn ? 'বিষয় নির্বাচন করুন' : 'Please select a subject';
  }

  if (!form.message?.trim() || form.message.trim().length < 10) {
    errors.message = isBn
      ? 'বার্তা কমপক্ষে ১০ অক্ষরের হতে হবে'
      : 'Message must be at least 10 characters';
  }

  return errors;
}

/**
 * Validate a search query.
 * @param {string} query
 * @param {'bn'|'en'} lang
 * @returns {string|null} error message or null if valid
 */
export function validateSearchQuery(query, lang = 'bn') {
  const isBn = lang === 'bn';
  if (!query?.trim()) {
    return isBn ? 'খোঁজার বিষয় লিখুন' : 'Enter a search term';
  }
  if (query.trim().length < 2) {
    return isBn ? 'কমপক্ষে ২ অক্ষর দিন' : 'Enter at least 2 characters';
  }
  return null;
}

/**
 * Validate a comment form.
 * @param {{ name, email, text }} form
 * @param {'bn'|'en'} lang
 * @returns {Record<string, string>}
 */
export function validateCommentForm(form, lang = 'bn') {
  const errors = {};
  const isBn = lang === 'bn';

  if (!form.name?.trim()) {
    errors.name = isBn ? 'নাম আবশ্যক' : 'Name is required';
  }

  if (form.email?.trim() && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = isBn ? 'সঠিক ইমেইল দিন' : 'Enter a valid email';
  }

  if (!form.text?.trim() || form.text.trim().length < 3) {
    errors.text = isBn ? 'মন্তব্য লিখুন' : 'Please write a comment';
  }

  return errors;
}

/**
 * Validate newsletter email subscription.
 */
export function validateNewsletterEmail(email, lang = 'bn') {
  const isBn = lang === 'bn';
  if (!email?.trim()) return isBn ? 'ইমেইল দিন' : 'Enter email';
  if (!EMAIL_REGEX.test(email.trim())) return isBn ? 'সঠিক ইমেইল দিন' : 'Enter a valid email';
  return null;
}
