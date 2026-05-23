import { toBengaliNum } from './formatters';

/**
 * Bangla calendar month names
 */
const BANGLA_MONTHS = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ',
  'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ',
  'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র',
];

/**
 * Convert a Gregorian date to Bangla calendar date string.
 * Algorithm based on standard Bangla calendar rules (starting ~April 14).
 * @param {Date} [date]
 * @param {'bn'|'en'} lang
 * @returns {string} e.g. "১৪ বৈশাখ ১৪৩২" or "14 Baishakh 1432"
 */
export function toBanglaCalendar(date = new Date(), lang = 'bn') {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const todayUTC = Date.UTC(y, m - 1, d);

  // Bangla year: starts April 14
  const isAfterNewYear = m > 4 || (m === 4 && d >= 14);
  const BY = isAfterNewYear ? y - 593 : y - 594;

  // All 12 Bangla month starts as UTC timestamps for this Bangla year.
  // Months 0-8 (Baishakh-Poush) are in Gregorian year BY+593.
  // Months 9-11 (Magh-Chaitra) are in Gregorian year BY+594.
  const gy  = BY + 593;
  const gy2 = BY + 594;
  const monthStartsUTC = [
    Date.UTC(gy,  3, 14), // 0 Baishakh  — Apr 14
    Date.UTC(gy,  4, 15), // 1 Jaistha   — May 15
    Date.UTC(gy,  5, 15), // 2 Asharh    — Jun 15
    Date.UTC(gy,  6, 16), // 3 Shraban   — Jul 16
    Date.UTC(gy,  7, 16), // 4 Bhadra    — Aug 16
    Date.UTC(gy,  8, 16), // 5 Ashwin    — Sep 16
    Date.UTC(gy,  9, 16), // 6 Kartik    — Oct 16
    Date.UTC(gy, 10, 15), // 7 Ogrohayon — Nov 15
    Date.UTC(gy, 11, 15), // 8 Poush     — Dec 15
    Date.UTC(gy2, 0, 14), // 9 Magh      — Jan 14
    Date.UTC(gy2, 1, 13), // 10 Falgun   — Feb 13
    Date.UTC(gy2, 2, 14), // 11 Chaitra  — Mar 14
  ];

  // Find the latest month start that is on or before today
  let banglaMonthIndex = 0;
  for (let i = 1; i < 12; i++) {
    if (monthStartsUTC[i] <= todayUTC) banglaMonthIndex = i;
  }

  const banglaDay = Math.round((todayUTC - monthStartsUTC[banglaMonthIndex]) / 86400000) + 1;

  if (lang === 'en') {
    const enMonths = ['Baishakh', 'Joishtho', 'Asharh', 'Shraban', 'Bhadra', 'Ashwin',
                      'Kartik', 'Ogrohayon', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
    return `${banglaDay} ${enMonths[banglaMonthIndex]} ${BY}`;
  }

  return `${toBengaliNum(banglaDay)} ${BANGLA_MONTHS[banglaMonthIndex]} ${toBengaliNum(BY)}`;
}

/**
 * Convert a Gregorian date to Hijri (Islamic) calendar date string.
 * Uses the Kuwaiti algorithm (commonly used for display).
 * @param {Date} [date]
 * @param {'bn'|'en'} lang
 * @returns {string} e.g. "১৫ শাওয়াল ১৪৪৬"
 */
export function toHijriDate(date = new Date(), lang = 'bn') {
  const HIJRI_MONTHS_BN = [
    'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
    'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
    'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ',
  ];
  const HIJRI_MONTHS_EN = [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
  ];

  // Julian Day Number calculation
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);

  // Hijri date from JDN (Kuwaiti algorithm)
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
          + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
           - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  const monthNames = lang === 'bn' ? HIJRI_MONTHS_BN : HIJRI_MONTHS_EN;
  const monthName = monthNames[hMonth - 1] || '';

  if (lang === 'bn') {
    return `${toBengaliNum(hDay)} ${monthName} ${toBengaliNum(hYear)}`;
  }
  return `${hDay} ${monthName} ${hYear}`;
}

/**
 * Get the current day name in Bengali or English.
 * @param {Date} [date]
 * @param {'bn'|'en'} lang
 * @returns {string}
 */
export function getDayName(date = new Date(), lang = 'bn') {
  const days = lang === 'bn'
    ? ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}
