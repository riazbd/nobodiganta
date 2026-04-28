import { bn } from '../locales/bn/index';
import { en } from '../locales/en/index';

const LOCALES = { bn, en };

/**
 * Translate a dot-notation key with optional variable interpolation.
 * @param {string} key - e.g. 'nav.home', 'search.results'
 * @param {'bn'|'en'} lang
 * @param {Record<string, string|number>} [vars] - e.g. { count: '৫' }
 * @returns {string}
 */
export function t(key, lang = 'bn', vars = {}) {
  const locale = LOCALES[lang] || LOCALES.bn;
  let value = locale[key];

  // Fallback to Bengali if key missing in English
  if (value === undefined && lang !== 'bn') {
    value = LOCALES.bn[key];
  }

  // Fallback to key itself if completely missing
  if (value === undefined) return key;

  // Handle arrays — return joined or first item
  if (Array.isArray(value)) return value;

  let str = String(value);

  // Variable interpolation: {count}, {name}, etc.
  Object.entries(vars).forEach(([varKey, varVal]) => {
    str = str.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(varVal));
  });

  return str;
}

/**
 * Return array translation (e.g. breaking news headlines).
 * @param {string} key
 * @param {'bn'|'en'} lang
 * @returns {string[]}
 */
export function tArray(key, lang = 'bn') {
  const locale = LOCALES[lang] || LOCALES.bn;
  const value = locale[key];
  if (Array.isArray(value)) return value;
  if (value !== undefined) return [String(value)];
  // Fallback to bn
  const fallback = LOCALES.bn[key];
  if (Array.isArray(fallback)) return fallback;
  return [];
}

/**
 * Pluralization: chooses between singular and plural translation keys.
 * Convention: key + '.one' for singular, key + '.other' for plural.
 * @param {string} key - base key, e.g. 'article.comment'
 * @param {number} count
 * @param {'bn'|'en'} lang
 * @returns {string}
 */
export function tPlural(key, count, lang = 'bn') {
  const suffix = count === 1 ? '.one' : '.other';
  return t(key + suffix, lang, { count: String(count) });
}
