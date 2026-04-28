/**
 * E-Paper Service
 * API: GET /api/epaper → { data: EpaperEdition[] }
 */

export async function getEpaperEditions() {
  try {
    const res = await fetch('/api/epaper');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching epaper editions', err);
  }
  return { data: [] };
}

export async function getEpaperByDate(dateStr) {
  // Can be implemented if needed via separate API
  return { data: null };
}
