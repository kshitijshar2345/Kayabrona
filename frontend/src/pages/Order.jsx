import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// BUG FIX: Original Orders.jsx read `order.items` but the fixed Order entity
// uses `order.orderItems`. Also: order.user is now a User object, not a string.
// This version reads `order.orderItems` correctly.

const STATUS_STYLES = {
  PENDING:   { bg: '#1a1400', color: '#c9a84c', label: 'Pending' },
  CONFIRMED: { bg: '#0d1a2a', color: '#6b9fff', label: 'Confirmed' },
  SHIPPED:   { bg: '#0a150a', color: '#6bcf6b', label: 'Shipped' },
  DELIVERED: { bg: '#0a1a0a', color: '#4caf50', label: 'Delivered' },
  CANCELLED: { bg: '#1a0808', color: '#ff6b6b', label: 'Cancelled' },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/orders/my-orders — JWT auto-attached by axios interceptor
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      // Update the order in state without full refetch
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? res.data : o))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel order.');
    } finally {
      setCancelling(null);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.eyebrow}>HISTORY</p>
        <h1 style={styles.heading}>My Orders</h1>
        <div style={styles.centered}>
          <div style={styles.spinner} />
          <p style={{ color: '#555', marginTop: 12 }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.page}>
        <p style={styles.eyebrow}>HISTORY</p>
        <h1 style={styles.heading}>My Orders</h1>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button style={styles.goldBtn} onClick={fetchOrders}>Retry</button>
        </div>
      </div>
    );
  }

  // ─── Empty ───────────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div style={styles.page}>
        <p style={styles.eyebrow}>HISTORY</p>
        <h1 style={styles.heading}>My Orders</h1>
        <div style={styles.emptyBox}>
          <p style={styles.emptyTitle}>No orders yet</p>
          <p style={styles.emptyText}>Start shopping to see your orders here</p>
          <button style={styles.goldBtn} onClick={() => navigate('/shop')}>Shop Now</button>
        </div>
      </div>
    );
  }

  // ─── Order List ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <p style={styles.eyebrow}>HISTORY</p>
      <h1 style={styles.heading}>My Orders</h1>

      <div style={styles.list}>
        {orders.map((order) => {
          const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
          const formattedDate = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
            : '—';

          return (
            <div key={order.id} style={styles.card}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.orderId}>#{`ORD-${String(order.id).padStart(4, '0')}`}</p>
                  <p style={styles.orderDate}>{formattedDate}</p>
                </div>
                <div style={styles.headerRight}>
                  <span
                    style={{
                      ...styles.badge,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.color}33`,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                  <p style={styles.orderTotal}>₹{order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>

              {/* Order Items */}
              {/* BUG FIX: Reading order.orderItems (not order.items) */}
              {order.orderItems && order.orderItems.length > 0 && (
                <div style={styles.itemsSection}>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} style={styles.orderItem}>
                      <div style={styles.itemDot} />
                      <span style={styles.itemName}>{item.productName}</span>
                      <span style={styles.itemQty}>× {item.quantity}</span>
                      <span style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shipping Info */}
              <div style={styles.shippingRow}>
                <span style={styles.shippingLabel}>Ship to:</span>
                <span style={styles.shippingAddr}>
                  {order.shippingAddress}
                  {order.city ? `, ${order.city}` : ''}
                  {order.state ? `, ${order.state}` : ''}
                  {order.pincode ? ` — ${order.pincode}` : ''}
                </span>
              </div>

              {/* Payment Method */}
              <div style={styles.shippingRow}>
                <span style={styles.shippingLabel}>Payment:</span>
                <span style={styles.shippingAddr}>{order.paymentMethod}</span>
              </div>

              {/* Cancel Button — only for PENDING */}
              {order.status === 'PENDING' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => handleCancel(order.id)}
                    disabled={cancelling === order.id}
                  >
                    {cancelling === order.id ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: { padding: '2rem 3rem', minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.15em', color: '#888', marginBottom: '0.25rem' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, margin: '0 0 2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#111', border: '1px solid #222', borderRadius: 16, padding: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  orderId: { margin: 0, fontWeight: 700, fontSize: 16 },
  orderDate: { margin: '4px 0 0', fontSize: 12, color: '#666' },
  headerRight: { textAlign: 'right' },
  badge: { display: 'inline-block', fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 600 },
  orderTotal: { margin: '6px 0 0', fontWeight: 700, color: '#c9a84c', fontSize: 18 },
  itemsSection: { borderTop: '1px solid #1a1a1a', paddingTop: '0.75rem', marginBottom: '0.75rem' },
  orderItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 },
  itemDot: { width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', flexShrink: 0 },
  itemName: { flex: 1, color: '#ccc' },
  itemQty: { color: '#666' },
  itemPrice: { color: '#f0ede8', fontWeight: 500 },
  shippingRow: { display: 'flex', gap: 8, fontSize: 13, marginTop: 4 },
  shippingLabel: { color: '#555', flexShrink: 0 },
  shippingAddr: { color: '#888' },
  cancelBtn: {
    background: 'none', border: '1px solid #3a1515', borderRadius: 8,
    color: '#ff6b6b', padding: '6px 16px', fontSize: 13, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  goldBtn: {
    background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8,
    padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  centered: { textAlign: 'center', padding: '4rem 0' },
  spinner: {
    width: 40, height: 40, borderRadius: '50%',
    border: '3px solid #222', borderTop: '3px solid #c9a84c',
    animation: 'spin 0.8s linear infinite', margin: '0 auto',
  },
  errorBox: {
    background: '#1a0808', border: '1px solid #3a1515', borderRadius: 12,
    padding: '2rem', textAlign: 'center', color: '#ff8080',
  },
  emptyBox: {
    background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 16,
    padding: '4rem 2rem', textAlign: 'center',
  },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#555', margin: '0 0 0.5rem' },
  emptyText: { color: '#444', marginBottom: '1.5rem' },
};

export default Orders;