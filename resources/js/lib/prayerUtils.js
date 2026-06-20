// resources/js/lib/prayerUtils.js

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const NAMES = {
  Imsak:   { bn: 'সেহরির শেষ সময়', en: 'Imsak (Suhoor ends)' },
  Fajr:    { bn: 'ফজর',            en: 'Fajr'     },
  Sunrise: { bn: 'সূর্যোদয়',       en: 'Sunrise'  },
  Dhuhr:   { bn: 'যোহর',           en: 'Dhuhr'    },
  Asr:     { bn: 'আসর',            en: 'Asr'      },
  Sunset:  { bn: 'সূর্যাস্ত',       en: 'Sunset'   },
  Maghrib: { bn: 'মাগরিব',         en: 'Maghrib'  },
  Isha:    { bn: 'এশা',            en: 'Isha'     },
};

const RAMADAN_LABELS = {
  Fajr:    { bn: 'ফজর / সেহরি শেষ',  en: 'Fajr / Suhoor ends' },
  Maghrib: { bn: 'মাগরিব / ইফতার', en: 'Maghrib / Iftar' },
};

export function prayerLabel(key, lang, isRamadan) {
  if (isRamadan && RAMADAN_LABELS[key]) {
    return lang === 'bn' ? RAMADAN_LABELS[key].bn : RAMADAN_LABELS[key].en;
  }
  return lang === 'bn' ? (NAMES[key]?.bn ?? key) : (NAMES[key]?.en ?? key);
}

// The currently-active prayer, respecting each prayer's START and END time.
// A prayer is "current" only while now is inside its valid window:
//   Fajr    : Fajr    → Sunrise   (ends at sunrise — NOT at Dhuhr)
//   Dhuhr   : Dhuhr   → Asr
//   Asr     : Asr     → Sunset
//   Maghrib : Maghrib → Isha
//   Isha    : Isha    → next Fajr
// Between Sunrise and Dhuhr no obligatory prayer is active — that's a gap, so
// this returns null and the caller shows the upcoming (future) prayer instead.
export function findCurrentPrayer(timings) {
  if (!timings) return null;
  const now = new Date();
  const at = (str) => {
    const [h, m] = str.split(':').map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0); return t;
  };

  const windows = [
    ['Fajr',    'Fajr',    'Sunrise'],
    ['Dhuhr',   'Dhuhr',   'Asr'],
    ['Asr',     'Asr',     timings['Sunset'] ? 'Sunset' : 'Maghrib'],
    ['Maghrib', 'Maghrib', 'Isha'],
  ];
  for (const [name, startKey, endKey] of windows) {
    if (!timings[startKey] || !timings[endKey]) continue;
    if (at(timings[startKey]) <= now && now < at(timings[endKey])) {
      return { name, time: timings[startKey] };
    }
  }

  // Isha runs from its start until the next day's Fajr (wraps past midnight).
  if (timings['Isha']) {
    if (at(timings['Isha']) <= now) return { name: 'Isha', time: timings['Isha'] };
    if (timings['Fajr'] && now < at(timings['Fajr'])) return { name: 'Isha', time: timings['Isha'] };
  }

  return null; // gap (e.g. Sunrise → Dhuhr): no prayer is currently active
}

export function findNextPrayer(timings) {
  const now = new Date();
  for (const name of PRAYER_ORDER) {
    if (!timings[name]) continue;
    const [h, m] = timings[name].split(':').map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    if (t > now) return { name, epochMs: t.getTime() };
  }
  // Past Isha — next is Fajr tomorrow
  const [h, m] = (timings['Fajr'] || '04:00').split(':').map(Number);
  const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(h, m, 0, 0);
  return { name: 'Fajr', epochMs: t.getTime() };
}

// Returns the next upcoming sun event — Sunrise or Sunset, whichever comes first
// from "now". After both have passed for today, the next event is tomorrow's Sunrise.
// Falls back gracefully when Sunset is missing (e.g. stale cached timings).
export function findNextSunEvent(timings) {
  if (!timings) return null;
  const now = new Date();
  const events = [];
  if (timings.Sunrise) events.push({ name: 'Sunrise', time: timings.Sunrise });
  if (timings.Sunset)  events.push({ name: 'Sunset',  time: timings.Sunset });
  events.sort((a, b) => a.time.localeCompare(b.time));
  for (const ev of events) {
    const [h, m] = ev.time.split(':').map(Number);
    const t = new Date(); t.setHours(h, m, 0, 0);
    if (t > now) return ev;
  }
  // Both passed → tomorrow's sunrise (same clock time is fine for a glance widget).
  return timings.Sunrise ? { name: 'Sunrise', time: timings.Sunrise } : null;
}

export function isPassed(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const t = new Date(); t.setHours(h, m, 0, 0);
  return t < new Date();
}

export function formatCountdown(epochMs) {
  const diff = Math.max(0, epochMs - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function toBn(str) {
  return String(str).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]);
}

export function to12h(time24) {
  if (!time24) return time24;
  const [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTime12h(time24, lang) {
  if (!time24) return '';
  const t = to12h(time24);
  if (lang !== 'bn') return t;
  return toBn(t).replace('AM', 'এএম').replace('PM', 'পিএম');
}

const BN_MONTHS = ['','জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
export function formatGregorian(dateStr, lang) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  if (lang === 'bn') {
    const day = toBn(String(d.getDate()));
    const month = BN_MONTHS[d.getMonth() + 1];
    const year = toBn(String(d.getFullYear()));
    return `${day} ${month} ${year}`;
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export { PRAYER_ORDER };

