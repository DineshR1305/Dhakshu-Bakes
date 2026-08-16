const RECENTLY_VIEWED_KEY = 'dhakshu_recently_viewed';
const MAX_RECENT_ITEMS = 8;

export function getRecentlyViewed() {
  try {
    const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read recently viewed items from localStorage:', e);
    return [];
  }
}

export function addRecentlyViewed(product) {
  if (!product || !product.id) return;
  try {
    const existing = getRecentlyViewed();
    // Filter out duplicate product if already present
    const filtered = existing.filter(item => item.id !== product.id);

    // Minimal product payload for card rendering
    const itemToSave = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryName: product.categoryName,
      description: product.description,
      isEggless: product.isEggless,
      isBestseller: product.isBestseller,
      ratingAvg: product.ratingAvg,
      reviewCount: product.reviewCount,
      variants: product.variants || [],
      images: product.images || [],
    };

    const updated = [itemToSave, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recently viewed item to localStorage:', e);
  }
}
