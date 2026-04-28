/**
 * Poll Service
 * API: GET /api/poll → { data: Poll }
 */

export async function getActivePoll(edition = 'bn') {
  try {
    const res = await fetch(`/api/poll?edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || null };
    }
  } catch (err) {
    console.error('Error fetching poll', err);
  }
  return { data: null };
}
