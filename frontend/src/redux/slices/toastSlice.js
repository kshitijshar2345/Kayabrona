import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: { visible: false, message: '', type: 'success' },
  reducers: {
    showToast: (state, { payload }) => {
      state.visible = true;
      state.message = payload.message;
      state.type = payload.type || 'success';
    },
    hideToast: (state) => {
      state.visible = false;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;