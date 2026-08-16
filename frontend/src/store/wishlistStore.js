import { create } from 'zustand';
import api from '../services/api';

const GUEST_WISHLIST_KEY = 'dhakshu_guest_wishlist';

function getGuestWishlist() {
  try {
    const data = localStorage.getItem(GUEST_WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveGuestWishlist(items) {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
  } catch (e) {}
}

export const useWishlistStore = create((set, get) => ({
  wishlist: { products: getGuestWishlist() },
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/wishlist');
      if (res && res.success && res.data) {
        set({ wishlist: res.data, loading: false });
      } else {
        set({ wishlist: { products: getGuestWishlist() }, loading: false });
      }
    } catch (err) {
      // Fallback for unauthenticated guests
      set({ wishlist: { products: getGuestWishlist() }, loading: false });
    }
  },

  isInWishlist: (productId) => {
    const products = get().wishlist.products || [];
    return products.some(p => p.id === productId || p === productId);
  },

  toggleWishlist: async (product) => {
    const productId = typeof product === 'object' ? product.id : product;
    const products = get().wishlist.products || [];
    const exists = products.some(p => (p.id || p) === productId);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Authenticated Backend Sync
        if (exists) {
          const res = await api.delete(`/wishlist/${productId}`);
          if (res && res.success && res.data) set({ wishlist: res.data });
        } else {
          const res = await api.post(`/wishlist/${productId}`);
          if (res && res.success && res.data) set({ wishlist: res.data });
        }
      } else {
        // Guest LocalStorage fallback
        let newItems;
        if (exists) {
          newItems = products.filter(p => (p.id || p) !== productId);
        } else {
          newItems = [...products, typeof product === 'object' ? product : { id: productId }];
        }
        saveGuestWishlist(newItems);
        set({ wishlist: { products: newItems } });
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  }
}));
