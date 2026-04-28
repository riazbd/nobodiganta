/**
 * Calculates estimated reading time for an article.
 * Bengali reading speed: ~150 words/minute
 * English reading speed: ~200 words/minute
 */

const WORDS_PER_MIN = { bn: 150, en: 200 };

/**
 * @param {string} html - raw HTML body of the article
 * @param {'bn'|'en'} lang
 * @returns {{ minutes: number, label: string }}
 */
export function calculateReadingTime(html, lang = 'bn') {
  if (!html) return { minutes: 1, label: lang === 'bn' ? '১ মিনিটে পড়ুন' : '1 min read' };

  // Strip HTML tags
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean).length;
  const wpm = WORDS_PER_MIN[lang] || 150;
  const minutes = Math.max(1, Math.ceil(words / wpm));

  const numStr = lang === 'bn'
    ? String(minutes).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d])
    : String(minutes);

  const label = lang === 'bn'
    ? `${numStr} মিনিটে পড়ুন`
    : `${numStr} min read`;

  return { minutes, label };
}
