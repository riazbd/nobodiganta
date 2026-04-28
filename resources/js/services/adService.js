/**
 * Ad Service — fetches active advertisements
 */

export async function getAds(position = null) {
  try {
    const url = position ? `/api/ads?position=${position}` : '/api/ads';
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching ads', err);
  }
  return { data: [] };
}
