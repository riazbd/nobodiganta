/**
 * Cricket Service
 * API: GET /api/cricket → { data: CricketMatch[] }
 */

export async function getLiveMatches() {
  try {
    const res = await fetch('/api/cricket');
    if (res.ok) {
      const json = await res.json();
      return { data: (json.data || []).filter(m => m.status === 'live') };
    }
  } catch (err) {
    console.error('Error fetching live matches', err);
  }
  return { data: [] };
}

export async function getAllMatches() {
  try {
    const res = await fetch('/api/cricket');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching all matches', err);
  }
  return { data: [] };
}
