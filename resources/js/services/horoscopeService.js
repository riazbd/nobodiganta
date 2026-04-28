/**
 * Horoscope Service
 * API: GET /api/horoscope → { data: Horoscope }
 */

export async function getHoroscopes() {
  try {
    const res = await fetch(`/api/horoscope`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || null };
    }
  } catch (err) {
    console.error('Error fetching horoscopes', err);
  }
  return { data: null };
}
