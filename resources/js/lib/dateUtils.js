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
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-based
  const day = date.getDate();

  // Bangla calendar starts mid-April
  // Approximate algorithm: Bangla year = Gregorian year - 593 (before April 14)
  //                                      Gregorian year - 593 (after April 14+1)
  // More precise: use Julian Day Number approach

  let banglaYear;
  let banglaMonthIndex;
  let banglaDay;

  // Conversion table approach (simplified but accurate enough for display)
  const startDates = [
    [4, 14], [5, 15], [6, 15], [7, 16], [8, 16], [9, 16],
    [10, 16], [11, 15], [12, 15], [1, 14], [2, 13], [3, 14],
  ];

  // Find which Bangla month we're in
  let foundMonth = 0;
  for (let i = 0; i < 12; i++) {
    const [gMonth, gDay] = startDates[i];
    const nextIdx = (i + 1) % 12;
    const [ngMonth, ngDay] = startDates[nextIdx];

    const current = month * 100 + day;
    const start = gMonth * 100 + gDay;
    let end;
    if (nextIdx === 0) {
      // wraps into next year — use a large number
      end = ngMonth * 100 + ngDay + 1200;
    } else {
      end = ngMonth * 100 + ngDay;
    }

    // Simpler: just check if we're past this month's start
    if (month === gMonth && day >= gDay) {
      foundMonth = i;
    } else if (month > gMonth || (month === gMonth && day >= gDay)) {
      if (i > foundMonth || foundMonth === 0) foundMonth = i;
    }
  }

  // Simpler approach: lookup table for month starts in Gregorian
  // Bangla month i starts on startDates[i][0]-startDates[i][1] in Gregorian
  const allStarts = startDates.map(([m, d], i) => ({ m, d, banglaMonth: i }));

  // Sort by effective position in year
  let currentBanglaMonth = 0;
  let currentBanglaMonthStart = { m: 4, d: 14 };

  for (let i = 0; i < 12; i++) {
    const { m: sm, d: sd } = startDates[i];
    // Check if we are on or past this start date
    if ((month > sm) || (month === sm && day >= sd)) {
      currentBanglaMonth = i;
      currentBanglaMonthStart = { m: sm, d: sd };
    }
    // Handle year wrap: months 9-11 (Jan-Mar) are after new year
    if (sm < 4 && ((month < 4) || (month === 4 && day < 14))) {
      if ((month > sm) || (month === sm && day >= sd)) {
        currentBanglaMonth = i;
        currentBanglaMonthStart = { m: sm, d: sd };
      }
    }
  }

  // Calculate day within Bangla month
  const startDate = new Date(year, currentBanglaMonthStart.m - 1, currentBanglaMonthStart.d);
  banglaDay = Math.floor((date - startDate) / 86400000) + 1;

  // Calculate Bangla year
  // Bangla year = Gregorian year - 593 if after April 13, else - 594
  if (month > 4 || (month === 4 && day >= 14)) {
    banglaYear = year - 593;
  } else {
    banglaYear = year - 594;
  }

  banglaMonthIndex = currentBanglaMonth;

  const monthName = BANGLA_MONTHS[banglaMonthIndex];

  if (lang === 'en') {
    const enMonths = ['Baishakh', 'Joishtho', 'Asharh', 'Shraban', 'Bhadra', 'Ashwin',
                      'Kartik', 'Ogrohayon', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
    return `${banglaDay} ${enMonths[banglaMonthIndex]} ${banglaYear}`;
  }

  return `${toBengaliNum(banglaDay)} ${monthName} ${toBengaliNum(banglaYear)}`;
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
