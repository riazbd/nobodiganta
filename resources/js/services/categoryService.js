/**
 * Category Service
 * API: GET /api/categories, GET /api/categories/:slug
 */
import { CATEGORIES } from '../data/categories';

export async function getCategories() {
  // CATEGORIES is an object keyed by slug; return as array with slug included
  const data = Object.entries(CATEGORIES).map(([slug, cat]) => ({ slug, ...cat }));
  return { data };
}

export async function getCategoryMeta(slug) {
  const cat = CATEGORIES[slug] ? { slug, ...CATEGORIES[slug] } : null;
  return { data: cat };
}
