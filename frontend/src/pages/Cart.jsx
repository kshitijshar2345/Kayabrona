import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { showToast } from '../redux/slices/toastSlice';
import api from '../api/axios';

// Cart.jsx — handles both COD and Razorpay online payment
// Razorpay flow: create-order → open popup → verify → place order
// COD flow: place order directly

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { isLoggedIn, user } = useSelector((s) => s.auth);

  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity]                       = useState('');
  const [state, setState]                     = useState('');
  const [pincode, setPincode]                 = useState('');
  const [phone, setPhone]                     = useState('');
  const [paymentMethod, setPaymentMethod]     = useState('COD');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping  = subtotal >= 999 ? 0 : 99;
  const total     = subtotal + shipping;

  const orderPayload = () => ({
    shippingAddress,
    city,
    state,
    pincode,
    phone,
    paymentMethod,
    totalAmount: total,
    items: items.map((i) => ({
      productId:   i.id,
      productName: i.name,
      price:       i.price,
      quantity:    i.quantity,
      imageUrl:    i.imageUrl || '',
    })),
  });

  const validate = () => {
    if (!shippingAddress.trim()) { setError('Street address is required.'); return false; }
    if (!city.trim())            { setError('City is required.'); return false; }
    if (!phone.trim())           { setError('Phone number is required.'); return false; }
    if (phone.length < 10)      { setError('Enter a valid 10-digit phone number.'); return false; }
    return true;
  };

  // ── COD flow ────────────────────────────────────────────────────────────────
  const placeCodOrder = async () => {
    setLoading(true);
    try {
      await api.post('/orders', orderPayload());
      dispatch(clearCart());
      dispatch(showToast({ message: 'Order placed successfully!', type: 'success' }));
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Razorpay online flow ─────────────────────────────────────────────────────
  const placeOnlineOrder = async () => {
    setLoading(true);
    try {
      // Step 1: Create Razorpay order on backend
      const { data } = await api.post('/payment/create-order', { amount: total });
      const { razorpayOrderId, amount, currency, keyId } = data;

      // Step 2: Open Razorpay checkout popup
      const options = {
        key:         keyId,
        amount:      amount,          // paise
        currency:    currency,
        name:        'Kayabrona',
        description: 'Premium E-Commerce Purchase',
        order_id:    razorpayOrderId,
        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
          contact: phone,
        },
        theme: { color: '#c9a84c' },

        handler: async (response) => {
          // Step 3: Verify payment signature on backend
          try {
            await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });

            // Step 4: Place order in our DB
            await api.post('/orders', {
              ...orderPayload(),
              paymentMethod: 'ONLINE',
              paymentId:     response.razorpay_payment_id,
            });

            dispatch(clearCart());
            dispatch(showToast({ message: 'Payment successful! Order placed.', type: 'success' }));
            navigate('/orders');
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.error || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. Try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setLoading(false);
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Could not initiate payment.');
    }
  };

  const handlePlaceOrder = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setError('');
    if (!validate()) return;
    paymentMethod === 'ONLINE' ? placeOnlineOrder() : placeCodOrder();
  };

  // ── Empty cart ───────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={s.page}>
        <div style={s.emptyWrap}>
          <p style={s.emptyTitle}>Your cart is empty</p>
          <p style={s.emptyText}>Add some products to get started.</p>
          <button style={s.goldBtn} onClick={() => navigate('/shop')}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <p style={s.eyebrow}>CHECKOUT</p>
      <h1 style={s.heading}>Your Cart</h1>

      <div style={s.layout}>
        {/* Left: items + form */}
        <div style={s.left}>

          {/* Cart items */}
          {items.map((item) => (
            <div key={item.id} style={s.cartItem}>
              <div style={s.itemAvatar}>{item.name?.[0]}</div>
              <div style={s.itemInfo}>
                <p style={s.itemName}>{item.name}</p>
                <p style={s.itemBrand}>{item.brand}</p>
                <p style={s.itemPrice}>₹{item.price?.toLocaleString()}</p>
              </div>
              <div style={s.qtyRow}>
                <button style={s.qtyBtn} onClick={() => dispatch(updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) }))}>−</button>
                <span style={s.qtyVal}>{item.quantity}</span>
                <button style={s.qtyBtn} onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
              </div>
              <button style={s.removeBtn} onClick={() => dispatch(removeFromCart(item.id))}>✕</button>
            </div>
          ))}

          {/* Shipping form */}
          <div style={s.formSection}>
            <p style={s.formTitle}>Shipping Details</p>
            <textarea style={s.textarea} placeholder="Street address *" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={2} />
            <div style={s.row}>
              <input style={s.input} placeholder="City *"  value={city}    onChange={(e) => setCity(e.target.value)} />
              <input style={s.input} placeholder="State"   value={state}   onChange={(e) => setState(e.target.value)} />
            </div>
            <div style={s.row}>
              <input style={s.input} placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              <input style={s.input} placeholder="Phone *" value={phone}   onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* Payment method */}
          <div style={s.formSection}>
            <p style={s.formTitle}>Payment Method</p>
            <div style={s.payRow}>
              {[['COD', '💵 Cash on Delivery'], ['ONLINE', '💳 Pay Online (Razorpay)']].map(([val, label]) => (
                <button
                  key={val}
                  style={{ ...s.payBtn, ...(paymentMethod === val ? s.payBtnActive : {}) }}
                  onClick={() => setPaymentMethod(val)}
                >
                  {label}
                </button>
              ))}
            </div>
            {paymentMethod === 'ONLINE' && (
              <p style={{ color: '#6bcf6b', fontSize: 12, marginTop: 8 }}>
                ✓ Secured by Razorpay · UPI, Cards, Net Banking, Wallets supported
              </p>
            )}
          </div>

          {error && <div style={s.errorBox}>⚠ {error}</div>}
        </div>

        {/* Right: order summary */}
        <div style={s.summary}>
          <p style={s.summaryTitle}>Order Summary</p>
          {items.map((item) => (
            <div key={item.id} style={s.summaryRow}>
              <span style={s.summaryItem}>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={s.divider} />
          <div style={s.summaryRow}><span style={{ color: '#888' }}>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div style={s.summaryRow}><span style={{ color: '#888' }}>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
          <div style={s.divider} />
          <div style={s.summaryRow}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={s.totalAmt}>₹{total.toLocaleString()}</span>
          </div>

          <button
            style={{ ...s.goldBtn, width: '100%', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : paymentMethod === 'ONLINE'
              ? `Pay ₹${total.toLocaleString()} →`
              : `Place Order · ₹${total.toLocaleString()}`}
          </button>

          <div style={s.trustRow}>
            <span>✓ Secure</span><span>✓ Easy Returns</span><span>✓ Fast Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  page: { padding: '2rem 3rem', minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '0.25rem' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, margin: '0 0 2rem' },
  layout: { display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  left: { flex: 2, minWidth: 300 },
  cartItem: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#111', border: '1px solid #222', borderRadius: 12, padding: '1rem', marginBottom: '1rem' },
  itemAvatar: { width: 48, height: 48, borderRadius: '50%', background: '#1a1a0a', border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c', fontWeight: 700, fontSize: 18, flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { margin: 0, fontWeight: 600, fontSize: 14 },
  itemBrand: { margin: '2px 0 0', fontSize: 12, color: '#888' },
  itemPrice: { margin: '4px 0 0', color: '#c9a84c', fontWeight: 600 },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: '50%', border: '1px solid #333', background: '#1a1a1a', color: '#f0ede8', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyVal: { minWidth: 24, textAlign: 'center', fontSize: 14 },
  removeBtn: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 },
  formSection: { background: '#111', border: '1px solid #222', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' },
  formTitle: { margin: '0 0 0.75rem', fontWeight: 600, fontSize: 14, color: '#c9a84c' },
  textarea: { width: '100%', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0ede8', padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 },
  row: { display: 'flex', gap: 8, marginBottom: 8 },
  input: { flex: 1, background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0ede8', padding: '10px 12px', fontSize: 14, fontFamily: 'inherit' },
  payRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  payBtn: { flex: 1, padding: '10px 16px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0ede8', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
  payBtnActive: { border: '1px solid #c9a84c', color: '#c9a84c', background: '#1a1400' },
  errorBox: { background: '#1a0808', border: '1px solid #3a1515', color: '#ff8080', borderRadius: 8, padding: '10px 14px', marginTop: 8, fontSize: 14 },
  summary: { flex: 1, minWidth: 260, background: '#111', border: '1px solid #222', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: '5rem' },
  summaryTitle: { fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', margin: '0 0 1rem', fontWeight: 600 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 },
  summaryItem: { color: '#aaa', maxWidth: '60%' },
  divider: { borderTop: '1px solid #222', margin: '0.75rem 0' },
  totalAmt: { color: '#c9a84c', fontWeight: 700, fontSize: 18 },
  goldBtn: { background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '12px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  trustRow: { display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: '#555' },
  emptyWrap: { textAlign: 'center', padding: '5rem 2rem' },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#555' },
  emptyText: { color: '#444', marginBottom: '1.5rem' },
};

export default Cart;