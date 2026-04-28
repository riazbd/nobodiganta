/**
 * Prayer Times Service
 * API: GET /api/prayer-times → { data: PrayerTimes }
 */

export async function getPrayerTimes(date) {
  try {
    const res = await fetch(`/api/prayer-times`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || null };
    }
  } catch (err) {
    console.error('Error fetching prayer times', err);
  }
  return { data: null };
}

export async function getMonthlyPrayerTimes(year, month) {
  // Can be extended later
  return { data: [] };
}
