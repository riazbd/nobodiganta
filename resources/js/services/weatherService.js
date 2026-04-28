/**
 * Weather Service
 * API: GET /api/weather → { data: Weather }
 */

export async function getWeather(city = 'dhaka', edition = 'bn') {
  try {
    const res = await fetch(`/api/weather?city=${city}&edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || null };
    }
  } catch (err) {
    console.error('Error fetching weather', err);
  }
  return { data: null };
}
