// resources/js/lib/prayerUtils.js

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const NAMES = {
  Imsak:   { bn: 'সেহরির শেষ সময়', en: 'Imsak (Suhoor ends)' },
  Fajr:    { bn: 'ফজর',            en: 'Fajr'     },
  Sunrise: { bn: 'সূর্যোদয়',       en: 'Sunrise'  },
  Dhuhr:   { bn: 'যোহর',           en: 'Dhuhr'    },
  Asr:     { bn: 'আসর',            en: 'Asr'      },
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

export { PRAYER_ORDER };
