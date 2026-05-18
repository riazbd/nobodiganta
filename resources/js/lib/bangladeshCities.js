// Mirror of config/bangladesh_cities.php — used for client-side weather fetching
export const CITIES = {
  dhaka:       { name_en: 'Dhaka',        name_bn: 'ঢাকা',         lat: 23.8103, lng: 90.4125 },
  chittagong:  { name_en: 'Chittagong',   name_bn: 'চট্টগ্রাম',    lat: 22.3569, lng: 91.7832 },
  sylhet:      { name_en: 'Sylhet',       name_bn: 'সিলেট',         lat: 24.8949, lng: 91.8687 },
  rajshahi:    { name_en: 'Rajshahi',     name_bn: 'রাজশাহী',       lat: 24.3745, lng: 88.6042 },
  khulna:      { name_en: 'Khulna',       name_bn: 'খুলনা',         lat: 22.8456, lng: 89.5403 },
  barisal:     { name_en: 'Barisal',      name_bn: 'বরিশাল',        lat: 22.7010, lng: 90.3535 },
  rangpur:     { name_en: 'Rangpur',      name_bn: 'রংপুর',         lat: 25.7439, lng: 89.2752 },
  mymensingh:  { name_en: 'Mymensingh',   name_bn: 'ময়মনসিংহ',     lat: 24.7471, lng: 90.4203 },
  comilla:     { name_en: 'Comilla',      name_bn: 'কুমিল্লা',      lat: 23.4607, lng: 91.1809 },
  narayanganj: { name_en: 'Narayanganj',  name_bn: 'নারায়ণগঞ্জ',   lat: 23.6238, lng: 90.4996 },
  gazipur:     { name_en: 'Gazipur',      name_bn: 'গাজীপুর',       lat: 23.9999, lng: 90.4203 },
  jessore:     { name_en: 'Jessore',      name_bn: 'যশোর',          lat: 23.1667, lng: 89.2167 },
  bogra:       { name_en: 'Bogra',        name_bn: 'বগুড়া',         lat: 24.8465, lng: 89.3776 },
  coxsbazar:   { name_en: "Cox's Bazar",  name_bn: 'কক্সবাজার',     lat: 21.4272, lng: 92.0058 },
};

const WMO_MAP = {
  0: 'পরিষ্কার আকাশ', 1: 'প্রায় পরিষ্কার', 2: 'আংশিক মেঘলা', 3: 'মেঘলা',
  45: 'কুয়াশা', 48: 'ঘন কুয়াশা',
  51: 'হালকা গুঁড়ি বৃষ্টি', 53: 'গুঁড়ি বৃষ্টি', 55: 'ভারী গুঁড়ি বৃষ্টি',
  61: 'হালকা বৃষ্টি', 63: 'মাঝারি বৃষ্টি', 65: 'ভারী বৃষ্টি',
  80: 'বৃষ্টির ঝাপটা', 81: 'মাঝারি বৃষ্টি', 82: 'ভারী বৃষ্টি',
  95: 'বজ্রঝড়', 96: 'শিলাসহ বজ্রঝড়', 99: 'ভারী শিলাসহ বজ্রঝড়',
};
const WMO_EN = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  80: 'Rain showers', 81: 'Rain showers', 82: 'Heavy showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

export async function fetchWeatherDirect(cityKey, lat, lng) {
  const city = CITIES[cityKey];
  const useLat = lat ?? city?.lat ?? 23.8103;
  const useLng = lng ?? city?.lng ?? 90.4125;
  const nameEn = city?.name_en ?? 'Dhaka';
  const nameBn = city?.name_bn ?? 'ঢাকা';

  const params = new URLSearchParams({
    latitude: useLat, longitude: useLng,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Dhaka',
    forecast_days: 7,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const cur  = data.current;
  const daily = data.daily;
  const code = cur.weather_code ?? 0;

  return {
    city: nameEn, city_bn: nameBn,
    current: {
      temp_c:       Math.round(cur.temperature_2m * 10) / 10,
      feels_like_c: Math.round(cur.apparent_temperature * 10) / 10,
      humidity:     cur.relative_humidity_2m,
      wind_kph:     Math.round(cur.wind_speed_10m * 10) / 10,
      weather_code: code,
      condition_bn: WMO_MAP[code] ?? 'মেঘলা',
      condition_en: WMO_EN[code] ?? 'Cloudy',
    },
    forecast: daily.time.map((date, i) => ({
      date,
      max_c:        Math.round(daily.temperature_2m_max[i] * 10) / 10,
      min_c:        Math.round(daily.temperature_2m_min[i] * 10) / 10,
      weather_code: daily.weather_code[i] ?? 0,
      rain_pct:     daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}
