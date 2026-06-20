/**
 * Bengali numeral map
 */
const BN_DIGITS = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
                    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };

/**
 * Convert ASCII digits in a string to Bengali numerals.
 * @param {string|number} input
 * @returns {string}
 */
export function toBengaliNum(input) {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

/**
 * Format a date string or Date object for display.
 * @param {string|Date} dateStr
 * @param {'bn'|'en'} lang
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(dateStr, lang = 'bn', options = {}) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const locale = lang === 'bn' ? 'bn-BD' : 'en-GB';
  const defaultOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
}

/**
 * Format a date as relative time (e.g. "৩ ঘণ্টা আগে").
 * @param {string|Date} dateStr
 * @param {'bn'|'en'} lang
 * @returns {string}
 */
export function relativeTime(dateStr, lang = 'bn') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);

  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const locale = lang === 'bn' ? 'bn' : 'en';

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const absDiff = Math.abs(diffSec);

    if (absDiff < 60) return rtf.format(diffSec, 'seconds');
    if (absDiff < 3600) return rtf.format(Math.round(diffSec / 60), 'minutes');
    if (absDiff < 86400) return rtf.format(Math.round(diffSec / 3600), 'hours');
    if (absDiff < 2592000) return rtf.format(Math.round(diffSec / 86400), 'days');
    return formatDate(dateStr, lang);
  } catch {
    return formatDate(dateStr, lang);
  }
}

/**
 * Format a view count with locale-appropriate numerals and comma grouping.
 * @param {number|string} count
 * @param {'bn'|'en'} lang
 * @returns {string}
 */
export function formatViews(count, lang = 'bn') {
  const num = parseInt(String(count).replace(/,/g, ''), 10);
  if (isNaN(num)) return String(count);
  const formatted = num.toLocaleString('en-US');
  return lang === 'bn' ? toBengaliNum(formatted) : formatted;
}

/**
 * Format a number with Bengali or English numerals.
 * @param {number} num
 * @param {'bn'|'en'} lang
 * @returns {string}
 */
export function formatNumber(num, lang = 'bn') {
  const str = Number(num).toLocaleString('en-US');
  return lang === 'bn' ? toBengaliNum(str) : str;
}

/**
 * Format a prayer time string (HH:MM) for display.
 * @param {string} time - "05:12" format
 * @param {'bn'|'en'} lang
 * @returns {string}
 */
export function formatPrayerTime(time, lang = 'bn') {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const min = m || '00';
  const period = hour < 12 ? (lang === 'bn' ? 'এএম' : 'AM') : (lang === 'bn' ? 'পিএম' : 'PM');
  const hour12 = hour % 12 || 12;
  const display = `${hour12}:${min} ${period}`;
  return lang === 'bn' ? toBengaliNum(display) : display;
}
