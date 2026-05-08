export async function getAds(position = null) {
  try {
    const url = position ? `/api/ads?position=${position}` : '/api/ads';
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.error('Error fetching ads', err);
  }
  return { data: [] };
}

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

export function trackImpression(id) {
  if (!id) return;
  fetch(`/api/ads/${id}/impression`, {
    method: 'POST',
    headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
  }).catch(() => {});
}

export function trackClick(id) {
  if (!id) return;
  fetch(`/api/ads/${id}/click`, {
    method: 'POST',
    headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
  }).catch(() => {});
}
