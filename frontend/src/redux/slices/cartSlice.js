import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
  },
  reducers: {
    addToCart: (state, { payload }) => {
      // payload = product object with id, name, price, imageUrl, brand, etc.
      const existing = state.items.find((i) => i.id === payload.id);
      if (existing) {
        existing.quantity += payload.quantity || 1;
      } else {
        state.items.push({ ...payload, quantity: payload.quantity || 1 });
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    removeFromCart: (state, { payload }) => {
      // payload = product id (number)
      state.items = state.items.filter((i) => i.id !== payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    updateQuantity: (state, { payload }) => {
      // payload = { id, quantity }
      const item = state.items.find((i) => i.id === payload.id);
      if (item) {
        item.quantity = payload.quantity;
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;