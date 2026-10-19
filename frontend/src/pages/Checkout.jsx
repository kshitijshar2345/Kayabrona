import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { clearCart } from '../redux/slices/cartSlice';

// ─── Step indicator ────────────────────────────────────────────────────────
const Steps = ({ current }) => {
  const steps = ['Shipping', 'Payment', 'Confirm'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0', marginBottom:'44px' }}>
      {steps.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={s} style={{ display:'flex', alignItems:'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', flexShrink:0 }}>
              <div style={{
                width:'32px', height:'32px', borderRadius:'50%',
                background: done ? '#c9a84c' : active ? 'rgba(201,168,76,.15)' : '#141414',
                border: `2px solid ${done || active ? '#c9a84c' : '#222'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'12px', fontWeight:'600',
                color: done ? '#080808' : active ? '#c9a84c' : '#444',
                transition:'all .3s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:'11px', color: active ? '#c9a84c' : done ? '#888' : '#444', fontWeight: active ? '500' : '400', whiteSpace:'nowrap' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex:1, height:'1px', background: done ? '#c9a84c' : '#1e1e1e', margin:'0 12px', marginBottom:'22px', transition:'background .3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Reusable input field ──────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text', required = true }) => (
  <div>
    <label style={{ display:'block', fontSize:'10px', fontWeight:'500', color:'#555', marginBottom:'8px', letterSpacing:'1.5px', textTransform:'uppercase' }}>
      {label}{required && <span style={{ color:'#c9a84c' }}> *</span>}
    </label>
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      style={{ width:'100%', background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:'10px', padding:'13px 16px', fontSize:'14px', color:'#f0ede8', fontFamily:"'DM Sans',sans-serif", transition:'border-color .2s' }}
      onFocus={e => e.target.style.borderColor = '#c9a84c'}
      onBlur={e  => e.target.style.borderColor = '#1e1e1e'}
    />
  </div>
);

// ─── Order summary sidebar ─────────────────────────────────────────────────
const OrderSummary = ({ items, subtotal, shipping, total }) => (
  <div style={{ background:'#101010', border:'1px solid #161616', borderRadius:'16px', padding:'24px', position:'sticky', top:'80px' }}>
    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'18px', color:'#f0ede8', marginBottom:'20px', margin:0, marginBottom:'20px' }}>Order Summary</h3>

    <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px', maxHeight:'220px', overflowY:'auto', paddingRight:'4px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'42px', height:'42px', background:'#0d0d0d', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0, border:'1px solid #1a1a1a' }}>
            {item.image && !item.image.startsWith('http') ? item.image : '📦'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'12px', color:'#ccc', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
            <div style={{ fontSize:'11px', color:'#555', marginTop:'2px' }}>Qty: {item.quantity}</div>
          </div>
          <div style={{ fontSize:'13px', color:'#f0ede8', flexShrink:0 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
        </div>
      ))}
    </div>

    <div style={{ height:'1px', background:'#1a1a1a', margin:'16px 0' }} />

    {[['Subtotal', `₹${subtotal.toLocaleString()}`], ['Shipping', shipping === 0 ? 'Free' : `₹${shipping}`]].map(([l, v]) => (
      <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
        <span style={{ fontSize:'13px', color:'#555' }}>{l}</span>
        <span style={{ fontSize:'13px', color:'#f0ede8' }}>{v}</span>
      </div>
    ))}

    <div style={{ height:'1px', background:'#1a1a1a', margin:'12px 0 16px' }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
      <span style={{ fontSize:'14px', color:'#888' }}>Total</span>
      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'22px', color:'#c9a84c', fontWeight:'700' }}>₹{total.toLocaleString()}</span>
    </div>

    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'20px', paddingTop:'16px', borderTop:'1px solid #161616' }}>
      {['Secure', 'Easy Returns', 'Fast Delivery'].map(t => (
        <div key={t} style={{ fontSize:'11px', color:'#333', display:'flex', alignItems:'center', gap:'4px' }}>
          <span style={{ color:'#c9a84c', fontSize:'9px' }}>✓</span>{t}
        </div>
      ))}
    </div>
  </div>
);

// ─── Success screen ────────────────────────────────────────────────────────
const SuccessScreen = ({ order, navigate }) => (
  <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ textAlign:'center', maxWidth:'480px', padding:'48px' }}>
      <div style={{ width:'72px', height:'72px', background:'rgba(201,168,76,.1)', border:'2px solid #c9a84c', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:'28px' }}>✓</div>

      <p style={{ fontSize:'10px', letterSpacing:'3px', color:'#c9a84c', textTransform:'uppercase', marginBottom:'12px' }}>Order placed!</p>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'36px', color:'#f0ede8', marginBottom:'8px', margin:0, marginBottom:'8px' }}>Thank you, your order is confirmed</h1>
      <p style={{ color:'#555', fontSize:'14px', marginTop:'8px', marginBottom:'32px', lineHeight:'1.6' }}>
        We've received your order and will start processing it right away. You'll receive updates via your order history.
      </p>

      {order && (
        <div style={{ background:'#101010', border:'1px solid #161616', borderRadius:'14px', padding:'20px', marginBottom:'32px', textAlign:'left' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            {[
              ['Order ID',  `#ORD-${String(order.id).padStart(4,'0')}`],
              ['Status',    order.status],
              ['Payment',   order.paymentMethod],
              ['Total',     `₹${Number(order.totalAmount).toLocaleString()}`],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize:'10px', color:'#555', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'4px' }}>{l}</div>
                <div style={{ fontSize:'14px', color: l === 'Status' ? '#c9a84c' : '#f0ede8', fontWeight:'500' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:'12px', justifyContent:'center' }}>
        <button onClick={() => navigate('/orders')}
          style={{ background:'#c9a84c', border:'none', borderRadius:'10px', padding:'13px 28px', fontSize:'14px', fontWeight:'600', color:'#080808', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          View My Orders
        </button>
        <button onClick={() => navigate('/shop')}
          style={{ background:'transparent', border:'1px solid #222', borderRadius:'10px', padding:'13px 28px', fontSize:'14px', color:'#f0ede8', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
          Continue Shopping
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Checkout component ───────────────────────────────────────────────
export default function Checkout() {
  const items    = useSelector(s => s.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);  // 0=Shipping, 1=Payment, 2=Confirm
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [success, setSuccess] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: '', phone: '', address: '', city: '', state: '', pincode: '',
  });
  const [payment, setPayment] = useState('COD');

  const subtotal   = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const shippingFee = subtotal > 999 ? 0 : 99;
  const total      = subtotal + shippingFee;

  const updateShipping = (field) => (e) =>
    setShipping(prev => ({ ...prev, [field]: e.target.value }));

  const isShippingValid = () =>
    shipping.fullName && shipping.phone && shipping.address &&
    shipping.city && shipping.state && shipping.pincode;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        shippingAddress: shipping.address,
        city:            shipping.city,
        state:           shipping.state,
        pincode:         shipping.pincode,
        phone:           shipping.phone,
        paymentMethod:   payment,
        totalAmount:     total,
        items: items.map(i => ({
          productId:   i.id,
          productName: i.name,
          price:       i.price,
          quantity:    i.quantity,
          imageUrl:    typeof i.image === 'string' && i.image.startsWith('http') ? i.image : '',
        })),
      };

      const { data } = await api.post('/orders', payload);
      dispatch(clearCart());
      setPlacedOrder(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen order={placedOrder} navigate={navigate} />;

  if (items.length === 0) {
    return (
      <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'DM Sans',sans-serif" }}>
        <Navbar />
        <div style={{ textAlign:'center', padding:'100px 0' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>🛒</div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'28px', color:'#f0ede8', marginBottom:'8px' }}>Your cart is empty</p>
          <p style={{ color:'#555', fontSize:'14px', marginBottom:'28px' }}>Add some products before checking out</p>
          <Link to="/shop" style={{ background:'#c9a84c', borderRadius:'10px', padding:'13px 28px', fontSize:'14px', fontWeight:'600', color:'#080808' }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080808', fontFamily:"'DM Sans',sans-serif", color:'#f0ede8' }}>
      <Navbar />

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'52px' }}>
        <p style={{ fontSize:'10px', letterSpacing:'3px', color:'#c9a84c', textTransform:'uppercase', marginBottom:'10px' }}>Checkout</p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'40px', color:'#f0ede8', margin:0, marginBottom:'40px' }}>Complete your order</h1>

        <Steps current={step} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'28px', alignItems:'start' }}>

          {/* ── Left: form panel ── */}
          <div style={{ background:'#101010', border:'1px solid #161616', borderRadius:'16px', padding:'32px' }}>

            {/* STEP 0 — Shipping */}
            {step === 0 && (
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'22px', color:'#f0ede8', marginBottom:'8px', margin:0, marginBottom:'8px' }}>Shipping address</h2>
                <p style={{ color:'#555', fontSize:'13px', marginBottom:'28px' }}>Where should we deliver your order?</p>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <Field label="Full Name" value={shipping.fullName} onChange={updateShipping('fullName')} placeholder="Bhumika Sharma" />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <Field label="Phone Number" value={shipping.phone} onChange={updateShipping('phone')} placeholder="+91 98765 43210" type="tel" />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <Field label="Street Address" value={shipping.address} onChange={updateShipping('address')} placeholder="Plot 133, Hirapur Colony" />
                  </div>
                  <Field label="City" value={shipping.city} onChange={updateShipping('city')} placeholder="Kalaburagi" />
                  <Field label="State" value={shipping.state} onChange={updateShipping('state')} placeholder="Karnataka" />
                  <Field label="PIN Code" value={shipping.pincode} onChange={updateShipping('pincode')} placeholder="585103" />
                </div>

                <button
                  onClick={() => { if (isShippingValid()) setStep(1); }}
                  disabled={!isShippingValid()}
                  style={{ marginTop:'28px', width:'100%', background: isShippingValid() ? '#c9a84c' : '#1a1a1a', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'600', color: isShippingValid() ? '#080808' : '#444', cursor: isShippingValid() ? 'pointer' : 'not-allowed', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* STEP 1 — Payment */}
            {step === 1 && (
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'22px', color:'#f0ede8', margin:0, marginBottom:'8px' }}>Payment method</h2>
                <p style={{ color:'#555', fontSize:'13px', marginBottom:'28px' }}>Choose how you'd like to pay</p>

                <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'28px' }}>
                  {[
                    { value:'COD',    label:'Cash on Delivery', desc:'Pay when your order arrives', icon:'💵' },
                    { value:'ONLINE', label:'Online Payment',   desc:'UPI, Net Banking, Credit/Debit Card', icon:'💳' },
                  ].map(({ value, label, desc, icon }) => (
                    <div key={value}
                      onClick={() => setPayment(value)}
                      style={{ display:'flex', alignItems:'center', gap:'16px', padding:'18px 20px', background: payment === value ? 'rgba(201,168,76,.06)' : '#0d0d0d', border: `1.5px solid ${payment === value ? '#c9a84c' : '#1e1e1e'}`, borderRadius:'12px', cursor:'pointer', transition:'all .2s' }}
                    >
                      <div style={{ width:'44px', height:'44px', background:'#141414', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>{icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'14px', fontWeight:'500', color:'#f0ede8', marginBottom:'3px' }}>{label}</div>
                        <div style={{ fontSize:'12px', color:'#555' }}>{desc}</div>
                      </div>
                      <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:`2px solid ${payment === value ? '#c9a84c' : '#333'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {payment === value && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#c9a84c' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Online payment note */}
                {payment === 'ONLINE' && (
                  <div style={{ background:'rgba(74,108,247,.08)', border:'1px solid rgba(74,108,247,.2)', borderRadius:'10px', padding:'14px 16px', marginBottom:'20px', fontSize:'13px', color:'#8aa3f7' }}>
                    ℹ️ You'll be redirected to a secure payment gateway after placing the order.
                  </div>
                )}

                <div style={{ display:'flex', gap:'12px' }}>
                  <button onClick={() => setStep(0)}
                    style={{ flex:1, background:'transparent', border:'1px solid #222', borderRadius:'10px', padding:'14px', fontSize:'14px', color:'#888', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    ← Back
                  </button>
                  <button onClick={() => setStep(2)}
                    style={{ flex:2, background:'#c9a84c', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'600', color:'#080808', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Confirm */}
            {step === 2 && (
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'22px', color:'#f0ede8', margin:0, marginBottom:'8px' }}>Review & confirm</h2>
                <p style={{ color:'#555', fontSize:'13px', marginBottom:'28px' }}>Check everything looks right before placing your order</p>

                {/* Shipping summary */}
                <div style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'18px', marginBottom:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                    <span style={{ fontSize:'11px', letterSpacing:'1px', color:'#c9a84c', textTransform:'uppercase' }}>Shipping to</span>
                    <button onClick={() => setStep(0)} style={{ background:'transparent', border:'none', color:'#555', fontSize:'12px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                  </div>
                  <div style={{ fontSize:'14px', color:'#f0ede8', marginBottom:'3px' }}>{shipping.fullName}</div>
                  <div style={{ fontSize:'13px', color:'#666' }}>{shipping.address}, {shipping.city}</div>
                  <div style={{ fontSize:'13px', color:'#666' }}>{shipping.state} — {shipping.pincode}</div>
                  <div style={{ fontSize:'13px', color:'#666', marginTop:'3px' }}>{shipping.phone}</div>
                </div>

                {/* Payment summary */}
                <div style={{ background:'#0d0d0d', border:'1px solid #1a1a1a', borderRadius:'12px', padding:'18px', marginBottom:'24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'11px', letterSpacing:'1px', color:'#c9a84c', textTransform:'uppercase' }}>Payment</span>
                    <button onClick={() => setStep(1)} style={{ background:'transparent', border:'none', color:'#555', fontSize:'12px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Edit</button>
                  </div>
                  <div style={{ fontSize:'14px', color:'#f0ede8', marginTop:'8px' }}>
                    {payment === 'COD' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                  </div>
                </div>

                {error && (
                  <div style={{ background:'#180808', border:'1px solid #3a1010', borderRadius:'10px', padding:'12px 16px', color:'#ff7070', fontSize:'13px', marginBottom:'20px' }}>
                    ⚠ {error}
                  </div>
                )}

                <div style={{ display:'flex', gap:'12px' }}>
                  <button onClick={() => setStep(1)}
                    style={{ flex:1, background:'transparent', border:'1px solid #222', borderRadius:'10px', padding:'14px', fontSize:'14px', color:'#888', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    style={{ flex:2, background: loading ? '#2a2a2a' : '#c9a84c', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:'600', color: loading ? '#666' : '#080808', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .2s' }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d4b56a'; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c9a84c'; }}
                  >
                    {loading ? 'Placing order...' : `Place Order · ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shippingFee}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}