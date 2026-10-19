import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import api from '../api/axios';

// Tag color system matching ProductCard
const TAG_STYLES = {
  'Best Seller': { bg: '#1a1400', color: '#c9a84c', border: '#3a2e00' },
  'New':         { bg: '#0d1225', color: '#6b9fff', border: '#1a2a4a' },
  'Sale':        { bg: '#1a0808', color: '#ff7b7b', border: '#3a1515' },
  'Trending':    { bg: '#0d1a0d', color: '#6bcf6b', border: '#1a3a1a' },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      brand: product.brand,
      quantity,
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const tagStyle = product?.tag ? (TAG_STYLES[product.tag] || TAG_STYLES['New']) : null;

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centered}>
          <div style={styles.spinner} />
          <p style={{ color: '#555', marginTop: 16 }}>Loading product...</p>
        </div>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div style={styles.page}>
        <div style={styles.centered}>
          <p style={{ color: '#ff6b6b', fontSize: 18 }}>{error || 'Product not found.'}</p>
          <button style={styles.goldBtn} onClick={() => navigate('/shop')}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // ─── Product Detail ───────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadLink} onClick={() => navigate('/')}>Home</span>
        <span style={styles.breadSep}> / </span>
        <span style={styles.breadLink} onClick={() => navigate('/shop')}>Shop</span>
        <span style={styles.breadSep}> / </span>
        <span style={{ color: '#f0ede8' }}>{product.name}</span>
      </div>

      {/* Main Layout */}
      <div style={styles.layout}>

        {/* Left — Product Image */}
        <div style={styles.imageWrap}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}>
              <span style={styles.placeholderChar}>{product.name?.[0]}</span>
            </div>
          )}
          {tagStyle && (
            <span style={{
              ...styles.tag,
              background: tagStyle.bg,
              color: tagStyle.color,
              border: `1px solid ${tagStyle.border}`,
            }}>
              {product.tag}
            </span>
          )}
        </div>

        {/* Right — Product Info */}
        <div style={styles.info}>

          {/* Brand */}
          {product.brand && (
            <p style={styles.brand}>{product.brand}</p>
          )}

          {/* Name */}
          <h1 style={styles.name}>{product.name}</h1>

          {/* Rating */}
          <div style={styles.ratingRow}>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    color: star <= Math.round(product.rating || 0) ? '#c9a84c' : '#2a2a2a',
                    fontSize: 18,
                  }}
                >★</span>
              ))}
            </div>
            <span style={styles.ratingNum}>{product.rating?.toFixed(1)}</span>
            {product.reviewCount > 0 && (
              <span style={styles.reviewCount}>({product.reviewCount} reviews)</span>
            )}
          </div>

          {/* Price */}
          <div style={styles.priceRow}>
            <span style={styles.price}>₹{product.price?.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span style={styles.originalPrice}>₹{product.originalPrice?.toLocaleString()}</span>
                <span style={styles.discount}>{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p style={styles.description}>{product.description}</p>
          )}

          {/* Category */}
          {product.category && (
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Category</span>
              <span style={styles.metaVal}>{product.category.name}</span>
            </div>
          )}

          {/* Stock */}
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Availability</span>
            <span style={{
              ...styles.metaVal,
              color: product.stock > 0 ? '#6bcf6b' : '#ff6b6b',
            }}>
              {product.stock > 10
                ? 'In Stock'
                : product.stock > 0
                ? `Only ${product.stock} left`
                : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={styles.qtySection}>
              <p style={styles.qtyLabel}>Quantity</p>
              <div style={styles.qtyRow}>
                <button
                  style={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >−</button>
                <span style={styles.qtyVal}>{quantity}</span>
                <button
                  style={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                >+</button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            style={{
              ...styles.addBtn,
              ...(added ? styles.addBtnSuccess : {}),
              ...(product.stock === 0 ? styles.addBtnDisabled : {}),
            }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0
              ? 'Out of Stock'
              : added
              ? '✓ Added to Cart!'
              : `Add to Cart · ₹${(product.price * quantity).toLocaleString()}`}
          </button>

          {/* Trust badges */}
          <div style={styles.trustRow}>
            {['Free Shipping', 'Easy Returns', 'Secure Payment', 'Quality Assured'].map((t) => (
              <div key={t} style={styles.trustBadge}>
                <span style={{ color: '#c9a84c' }}>✓</span> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: { padding: '1.5rem 3rem 4rem', minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
  spinner: { width: 40, height: 40, borderRadius: '50%', border: '3px solid #222', borderTop: '3px solid #c9a84c', animation: 'spin 0.8s linear infinite' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#555', marginBottom: '2rem' },
  breadLink: { color: '#888', cursor: 'pointer', transition: 'color 0.2s' },
  breadSep: { color: '#333' },
  layout: { display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' },
  imageWrap: { flex: 1, minWidth: 280, position: 'relative' },
  image: { width: '100%', borderRadius: 16, border: '1px solid #1a1a1a', objectFit: 'cover', maxHeight: 500 },
  imagePlaceholder: {
    width: '100%', paddingTop: '100%', borderRadius: 16, background: '#111',
    border: '1px solid #1a1a1a', position: 'relative',
  },
  placeholderChar: {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    fontSize: 80, fontWeight: 700, color: '#c9a84c', fontFamily: "'Playfair Display', serif",
  },
  tag: { position: 'absolute', top: 16, left: 16, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  info: { flex: 1.2, minWidth: 300 },
  brand: { fontSize: 12, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', margin: '0 0 0.5rem' },
  name: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, margin: '0 0 1rem', lineHeight: 1.3 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' },
  stars: { display: 'flex', gap: 2 },
  ratingNum: { fontSize: 15, fontWeight: 600, color: '#c9a84c' },
  reviewCount: { fontSize: 13, color: '#666' },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: '1.25rem' },
  price: { fontSize: 32, fontWeight: 700, color: '#c9a84c' },
  originalPrice: { fontSize: 18, color: '#555', textDecoration: 'line-through' },
  discount: { fontSize: 14, background: '#1a0808', color: '#ff7b7b', border: '1px solid #3a1515', padding: '2px 8px', borderRadius: 20 },
  description: { fontSize: 15, color: '#aaa', lineHeight: 1.8, marginBottom: '1.25rem', borderTop: '1px solid #1a1a1a', paddingTop: '1rem' },
  metaRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, fontSize: 14 },
  metaLabel: { color: '#555', minWidth: 90 },
  metaVal: { color: '#f0ede8', fontWeight: 500 },
  qtySection: { marginTop: '1.5rem', marginBottom: '1.5rem' },
  qtyLabel: { fontSize: 13, color: '#888', margin: '0 0 0.5rem' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: '50%', border: '1px solid #2a2a2a',
    background: '#111', color: '#f0ede8', fontSize: 20, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyVal: { minWidth: 32, textAlign: 'center', fontSize: 18, fontWeight: 600 },
  addBtn: {
    width: '100%', padding: '14px', background: '#c9a84c', color: '#0a0a0a',
    border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s',
  },
  addBtnSuccess: { background: '#2d6a2d', color: '#f0ede8' },
  addBtnDisabled: { background: '#1a1a1a', color: '#444', cursor: 'not-allowed' },
  trustRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: '1.5rem' },
  trustBadge: { fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 },
  goldBtn: {
    background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8,
    padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
};

export default ProductDetail;