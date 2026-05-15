/**
 * News Service — API abstraction for dynamic frontend data fetching
 */

export async function getTrendingArticles(limit = 6, edition = 'bn') {
  try {
    const res = await fetch(`/api/trending?limit=${limit}&edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [] };
    }
  } catch (err) {
    console.error('Error fetching trending articles', err);
  }
  return { data: [] };
}

export async function getMostReadArticles(limit = 5, edition = 'bn') {
  try {
    const res = await fetch(`/api/most-read?limit=${limit}&edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [] };
    }
  } catch (err) {
    console.error('Error fetching most read articles', err);
  }
  return { data: [] };
}

export async function getMostCommentedArticles(limit = 5, edition = 'bn') {
  try {
    const res = await fetch(`/api/most-commented?limit=${limit}&edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [] };
    }
  } catch (err) {
    console.error('Error fetching most commented articles', err);
  }
  return { data: [] };
}

export async function getLatestArticles(limit = 5, edition = 'bn') {
  try {
    const res = await fetch(`/api/latest?limit=${limit}&edition=${edition}`);
    if (res.ok) {
      const json = await res.json();
      return { data: json.data || [] };
    }
  } catch (err) {
    console.error('Error fetching latest articles', err);
  }
  return { data: [] };
}

export async function getLiveblogUpdates(articleId, afterId = null) {
  try {
    const url = `/api/liveblog/${articleId}/updates` + (afterId ? `?after_id=${afterId}` : '');
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching liveblog updates', err);
  }
  return { data: [] };
}
