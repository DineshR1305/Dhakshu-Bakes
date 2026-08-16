import { create } from 'zustand';
import api from '../services/api';

export const useWishlistStore = create((set, get) => ({
  wishlist: { products: [] },
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/wishlist');
      if (res.success && res.data) {
        set({ wishlist: res.data, loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  toggleWishlist: async (productId) => {
    const products = get().wishlist.products || [];
    const exists = products.some(p => p.id === productId);

    try {
      if (exists) {
        const res = await api.delete(`/wishlist/${productId}`);
        if (res.success && res.data) set({ wishlist: res.data });
      } else {
        const res = await api.post(`/wishlist/${productId}`);
        if (res.success && res.data) set({ wishlist: res.data });
      }
    } catch (err) {
      console.error(err);
    }
  }
}));
