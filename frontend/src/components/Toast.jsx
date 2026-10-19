// ─── Toast Component ──────────────────────────────────────────────────────────
// Place <ToastContainer /> once in App.jsx (outside Routes, inside Provider).
// Then anywhere in your app:
//   import { useDispatch } from 'react-redux';
//   import { showToast } from '../redux/slices/toastSlice';
//   const dispatch = useDispatch();
//   dispatch(showToast({ message: 'Added to cart!', type: 'success' }));
//
// Types: 'success' | 'error' | 'info'

import { useSelector, useDispatch } from 'react-redux';
import { hideToast } from '../redux/slices/toastSlice';
import { useEffect } from 'react';

const COLORS = {
  success: { bg: '#0d1a0d', border: '#1a3a1a', color: '#6bcf6b', icon: '✓' },
  error:   { bg: '#1a0808', border: '#3a1515', color: '#ff6b6b', icon: '✕' },
  info:    { bg: '#0d1225', border: '#1a2a4a', color: '#6b9fff', icon: 'ℹ' },
};

export const ToastContainer = () => {
  const dispatch = useDispatch();
  const { visible, message, type } = useSelector((s) => s.toast);
  const c = COLORS[type] || COLORS.info;

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => dispatch(hideToast()), 3000);
      return () => clearTimeout(t);
    }
  }, [visible, message]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
      padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
      color: c.color, fontSize: 14, fontFamily: 'inherit',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      animation: 'slideUp 0.2s ease',
    }}>
      <span style={{ fontWeight: 700, fontSize: 16 }}>{c.icon}</span>
      <span>{message}</span>
      <button
        onClick={() => dispatch(hideToast())}
        style={{ background: 'none', border: 'none', color: c.color, cursor: 'pointer', fontSize: 16, marginLeft: 8, opacity: 0.7 }}
      >✕</button>
    </div>
  );
};

export default ToastContainer;
