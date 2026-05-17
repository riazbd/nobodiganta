// resources/js/lib/wmo.js
const WMO = {
  0:  { bn: 'পরিষ্কার আকাশ',      en: 'Clear sky',        emoji: '☀️'  },
  1:  { bn: 'প্রায় পরিষ্কার',     en: 'Mainly clear',     emoji: '🌤️' },
  2:  { bn: 'আংশিক মেঘলা',       en: 'Partly cloudy',    emoji: '⛅'  },
  3:  { bn: 'মেঘলা',             en: 'Overcast',         emoji: '☁️'  },
  45: { bn: 'কুয়াশা',             en: 'Fog',              emoji: '🌫️' },
  48: { bn: 'ঘন কুয়াশা',         en: 'Icy fog',          emoji: '🌫️' },
  51: { bn: 'হালকা গুঁড়ি বৃষ্টি', en: 'Light drizzle',   emoji: '🌦️' },
  53: { bn: 'গুঁড়ি বৃষ্টি',      en: 'Drizzle',          emoji: '🌦️' },
  55: { bn: 'ভারী গুঁড়ি বৃষ্টি',  en: 'Heavy drizzle',   emoji: '🌦️' },
  61: { bn: 'হালকা বৃষ্টি',      en: 'Light rain',       emoji: '🌧️' },
  63: { bn: 'মাঝারি বৃষ্টি',     en: 'Moderate rain',    emoji: '🌧️' },
  65: { bn: 'ভারী বৃষ্টি',       en: 'Heavy rain',       emoji: '🌧️' },
  71: { bn: 'হালকা তুষার',       en: 'Light snow',       emoji: '❄️'  },
  73: { bn: 'মাঝারি তুষার',      en: 'Moderate snow',    emoji: '❄️'  },
  75: { bn: 'ভারী তুষার',        en: 'Heavy snow',       emoji: '❄️'  },
  80: { bn: 'বৃষ্টির ঝাপটা',     en: 'Rain showers',     emoji: '🌦️' },
  81: { bn: 'মাঝারি বৃষ্টি',     en: 'Rain showers',     emoji: '🌧️' },
  82: { bn: 'ভারী বৃষ্টি',       en: 'Heavy showers',    emoji: '🌧️' },
  95: { bn: 'বজ্রঝড়',            en: 'Thunderstorm',     emoji: '⛈️' },
  96: { bn: 'শিলাসহ বজ্রঝড়',    en: 'Thunderstorm',     emoji: '⛈️' },
  99: { bn: 'ভারী শিলাসহ বজ্রঝড়',en: 'Thunderstorm',    emoji: '⛈️' },
};

export function wmoLabel(code, lang = 'bn') {
  const entry = WMO[code] ?? WMO[0];
  return lang === 'bn' ? entry.bn : entry.en;
}

export function wmoEmoji(code) {
  return (WMO[code] ?? WMO[0]).emoji;
}
