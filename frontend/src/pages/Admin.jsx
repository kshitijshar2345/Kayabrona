import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Admin dashboard — tabs: Products | Orders
// Protected: only ROLE_ADMIN users can see this.
// In App.jsx route: <AdminRoute><Admin /></AdminRoute>
// AdminRoute checks user.role === 'ROLE_ADMIN'

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const Admin = () => {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders'); // 'orders' | 'products'

  // Guard — redirect non-admins
  useEffect(() => {
    if (user?.role !== 'ROLE_ADMIN') navigate('/');
  }, [user]);

  return (
    <div style={s.page}>
      <p style={s.eyebrow}>ADMIN</p>
      <h1 style={s.heading}>Dashboard</h1>

      <div style={s.tabs}>
        {['orders', 'products'].map((t) => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'orders'   && <AdminOrders />}
      {tab === 'products' && <AdminProducts />}
    </div>
  );
};

// ─── Admin Orders Panel ────────────────────────────────────────────────────────
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/admin/all')
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/orders/admin/${id}/status?status=${status}`);
      setOrders((prev) => prev.map((o) => o.id === id ? res.data : o));
    } catch { alert('Failed to update status'); }
  };

  const STATUS_COLOR = {
    PENDING: '#c9a84c', CONFIRMED: '#6b9fff', SHIPPED: '#6bcf6b',
    DELIVERED: '#4caf50', CANCELLED: '#ff6b6b',
  };

  if (loading) return <p style={{ color: '#555' }}>Loading orders...</p>;

  return (
    <div>
      <p style={s.tableCount}>{orders.length} total orders</p>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Date', 'Status', 'Action'].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={s.tr}>
                <td style={s.td}>#{`ORD-${String(o.id).padStart(4,'0')}`}</td>
                <td style={s.td}>{o.user?.name || '—'}<br /><span style={{ color: '#666', fontSize: 11 }}>{o.user?.email}</span></td>
                <td style={s.td}>{o.orderItems?.length || 0} item{o.orderItems?.length !== 1 ? 's' : ''}</td>
                <td style={s.td}>₹{o.totalAmount?.toLocaleString()}</td>
                <td style={s.td}>{o.paymentMethod}</td>
                <td style={s.td}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                <td style={s.td}>
                  <span style={{ color: STATUS_COLOR[o.status] || '#888', fontWeight: 600, fontSize: 12 }}>
                    {o.status}
                  </span>
                </td>
                <td style={s.td}>
                  <select
                    style={s.statusSelect}
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Admin Products Panel ──────────────────────────────────────────────────────
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);

  const emptyForm = { name: '', description: '', price: '', originalPrice: '', stock: '', brand: '', tag: '', featured: false, categoryId: '', imageUrl: '' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([
      api.get('/products?size=100'),
      api.get('/categories'),
    ]).then(([p, c]) => {
      setProducts(p.data.content || []);
      setCategories(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const openEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name || '', description: product.description || '',
      price: product.price || '', originalPrice: product.originalPrice || '',
      stock: product.stock || '', brand: product.brand || '',
      tag: product.tag || '', featured: product.featured || false,
      categoryId: product.category?.id || '', imageUrl: product.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? (soft delete — it stays in DB)')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice), stock: Number(form.stock), categoryId: Number(form.categoryId) };
    try {
      if (editing) {
        const res = await api.put(`/products/${editing}`, payload);
        setProducts((prev) => prev.map((p) => p.id === editing ? res.data : p));
      } else {
        const res = await api.post('/products', payload);
        setProducts((prev) => [res.data, ...prev]);
      }
      setShowForm(false); setEditing(null); setForm(emptyForm);
    } catch (err) { alert(err.response?.data?.error || 'Failed to save product'); }
  };

  if (loading) return <p style={{ color: '#555' }}>Loading products...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={s.tableCount}>{products.length} products</p>
        <button style={s.addBtn} onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>+ Add Product</button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <h3 style={{ margin: '0 0 1.25rem', color: '#f0ede8', fontSize: 18 }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={s.formGrid}>
                {[
                  ['Name *', 'name', 'text', true],
                  ['Brand', 'brand', 'text', false],
                  ['Price (₹) *', 'price', 'number', true],
                  ['Original Price (₹)', 'originalPrice', 'number', false],
                  ['Stock *', 'stock', 'number', true],
                  ['Image URL', 'imageUrl', 'url', false],
                ].map(([label, key, type, req]) => (
                  <div key={key}>
                    <p style={s.fLabel}>{label}</p>
                    <input style={s.fInput} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={req} />
                  </div>
                ))}
              </div>

              <p style={s.fLabel}>Description</p>
              <textarea style={{ ...s.fInput, height: 72, resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <div style={{ flex: 1 }}>
                  <p style={s.fLabel}>Tag</p>
                  <select style={s.fInput} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>
                    <option value="">None</option>
                    {['Best Seller', 'New', 'Sale', 'Trending'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={s.fLabel}>Category</p>
                  <select style={s.fInput} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
                  <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  <label htmlFor="featured" style={{ color: '#c9a84c', fontSize: 13 }}>Featured</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" style={s.cancelBtn} onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
                <button type="submit" style={s.addBtn}>{editing ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {['ID', 'Name', 'Category', 'Price', 'Stock', 'Tag', 'Featured', 'Actions'].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={s.tr}>
                <td style={s.td}>{p.id}</td>
                <td style={s.td}><span style={{ fontWeight: 500 }}>{p.name}</span><br /><span style={{ color: '#666', fontSize: 11 }}>{p.brand}</span></td>
                <td style={s.td}>{p.category?.name || '—'}</td>
                <td style={s.td}>₹{p.price?.toLocaleString()}</td>
                <td style={{ ...s.td, color: p.stock < 5 ? '#ff6b6b' : '#f0ede8' }}>{p.stock}</td>
                <td style={s.td}>{p.tag || '—'}</td>
                <td style={s.td}>{p.featured ? <span style={{ color: '#c9a84c' }}>★</span> : '—'}</td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => openEdit(p)}>Edit</button>
                  <button style={s.delBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const s = {
  page: { padding: '2rem 3rem', minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.15em', color: '#888', margin: '0 0 0.25rem' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, margin: '0 0 1.5rem' },
  tabs: { display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid #1a1a1a' },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#666', fontSize: 14, padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 },
  tabActive: { color: '#c9a84c', borderBottom: '2px solid #c9a84c' },
  tableCount: { color: '#555', fontSize: 13, margin: '0 0 0.75rem' },
  tableWrap: { overflowX: 'auto', borderRadius: 12, border: '1px solid #1a1a1a' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { background: '#111', color: '#888', padding: '10px 14px', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #111' },
  td: { padding: '10px 14px', color: '#f0ede8', verticalAlign: 'middle' },
  statusSelect: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, color: '#f0ede8', padding: '5px 8px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },
  addBtn: { background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  editBtn: { background: '#0d1225', color: '#6b9fff', border: '1px solid #1a2a4a', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'inherit' },
  delBtn: { background: '#1a0808', color: '#ff6b6b', border: '1px solid #3a1515', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { background: 'none', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modalBox: { background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' },
  fLabel: { fontSize: 12, color: '#888', margin: '10px 0 5px' },
  fInput: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 7, color: '#f0ede8', padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' },
};

export default Admin;