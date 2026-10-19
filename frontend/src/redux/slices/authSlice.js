import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from localStorage on app load so user stays logged in after refresh
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isLoggedIn: !!localStorage.getItem('token'),
  },
  reducers: {
    loginSuccess: (state, { payload }) => {
      // payload = { token, user: { name, role, email } }
      state.token = payload.token;
      state.user = payload.user;
      state.isLoggedIn = true;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
      localStorage.clear(); // clears token, user, and cart
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;