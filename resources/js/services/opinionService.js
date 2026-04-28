/**
 * Opinion Service
 * API: GET /api/opinions?limit=:n&edition=:ed
 */
import { OPINIONS } from '../data/opinions';

export async function getOpinions(limit = 4, edition = 'bn') {
  try {
    const res = await fetch(`/api/opinions?limit=${limit}&edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [] };
    }
  } catch (err) {
    console.error('Error fetching opinions', err);
  }
  const data = Array.isArray(OPINIONS) ? OPINIONS.slice(0, limit) : Object.values(OPINIONS).slice(0, limit);
  return { data };
}
