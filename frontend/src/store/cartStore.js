import { create } from 'zustand';
import api from '../services/api';

export const useCartStore = create((set, get) => ({
  cart: { items: [], subtotal: 0, itemCount: 0 },
  loading: false,
  isDrawerOpen: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/cart');
      if (res.success && res.data) {
        set({ cart: res.data, loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  addToCart: async (productId, variantId, quantity = 1, customization = {}) => {
    try {
      const payload = {
        productId,
        variantId,
        quantity,
        customMessage: customization.customMessage || null,
        specialInstructions: customization.specialInstructions || null,
        isEggless: !!customization.isEggless,
        isGiftWrapped: !!customization.isGiftWrapped,
      };

      const res = await api.post('/cart/items', payload);
      if (res.success && res.data) {
        set({ cart: res.data });
        return { success: true, message: 'Item added to cart' };
      }
      return { success: false, message: res.message || 'Failed to add item' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.success && res.data) {
        set({ cart: res.data });
      }
    } catch (err) {
      console.error(err);
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.success && res.data) {
        set({ cart: res.data });
      }
    } catch (err) {
      console.error(err);
    }
  },

  clearCart: () => {
    set({ cart: { items: [], subtotal: 0, itemCount: 0 } });
  }
}));
