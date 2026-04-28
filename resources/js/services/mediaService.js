/**
 * Media Service — gallery images and videos
 * API:
 *   GET /api/gallery?tab=:tab&edition=:bn|en&page=:n  → { data: GalleryItem[], meta }
 *   GET /api/gallery/categories?edition=:bn|en       → { categories: [], total }
 *   GET /api/videos?edition=:bn|en&page=:n           → { data: Video[], meta }
 */

const API_BASE = '/api';

/**
 * Get gallery items filtered by tab and edition
 * @param {string} tab - Gallery category (latest, bangladesh, nature, people, sports, special)
 * @param {string} edition - Edition filter (bn, en) - defaults to 'bn'
 * @param {number} page - Page number
 */
export async function getGalleryItems(tab = 'latest', edition = 'bn', page = 1) {
    const params = new URLSearchParams({
        tab,
        edition,
        page: page.toString(),
        per_page: '12',
    });

    const response = await fetch(`${API_BASE}/gallery?${params}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch gallery items: ${response.status}`);
    }

    return response.json();
}

/**
 * Get gallery categories with counts
 * @param {string} edition - Edition filter (bn, en)
 */
export async function getGalleryCategories(edition = 'bn') {
    const params = new URLSearchParams({ edition });
    
    const response = await fetch(`${API_BASE}/gallery/categories?${params}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch gallery categories: ${response.status}`);
    }

    return response.json();
}

/**
 * Get videos filtered by edition
 * @param {object} options - { edition, page, perPage }
 */
export async function getVideos({ edition = 'bn', page = 1, perPage = 12 } = {}) {
    const params = new URLSearchParams({
        edition,
        page: page.toString(),
        per_page: perPage.toString(),
    });

    const response = await fetch(`${API_BASE}/videos?${params}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`);
    }

    return response.json();
}

/**
 * Get single media item
 * @param {number} id - Media ID
 * @param {string} edition - Edition filter
 */
export async function getMediaItem(id, edition = 'bn') {
    const params = new URLSearchParams({ edition });
    
    const response = await fetch(`${API_BASE}/media/${id}?${params}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch media item: ${response.status}`);
    }

    return response.json();
}