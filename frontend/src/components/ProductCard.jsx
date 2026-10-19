import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      brand: product.brand,
      quantity: 1,
    }));
  };

  const tagColors = {
    'Best Seller': { bg: '#1a1400', text: '#c9a84c', border: '#3a2e00' },
    'New':         { bg: '#0d1225', text: '#6b9fff', border: '#1a2a4a' },
    'Sale':        { bg: '#1a0808', text: '#ff7b7b', border: '#3a1515' },
    'Trending':    { bg: '#0d1a0d', text: '#6bcf6b', border: '#1a3a1a' },
  };
  const tagStyle = tagColors[product.tag] || tagColors['New'];

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#111', border: '1px solid #1a1a1a',
        borderRadius: '16px', overflow: 'hidden',
        transition: 'all 0.25s', cursor: 'pointer',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#c9a84c33';
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#1a1a1a';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Product Image */}
        <div style={{
          height: '200px', background: '#0d0d0d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', borderBottom: '1px solid #1a1a1a',
          overflow: 'hidden',
        }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              fontSize: '64px', opacity: 0.4,
              fontFamily: "'Playfair Display', serif",
              color: '#c9a84c',
            }}>
              {product.name?.charAt(0)}
            </div>
          )}

          {/* Tag badge */}
          {product.tag && (
            <div style={{
              position: 'absolute', top: '12px', left: '12px',
              background: tagStyle.bg, color: tagStyle.text,
              border: `1px solid ${tagStyle.border}`,
              fontSize: '10px', fontWeight: '600',
              padding: '3px 10px', borderRadius: '20px',
              letterSpacing: '0.5px',
            }}>{product.tag}</div>
          )}

          {/* Discount badge */}
          {discount && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: '#c9a84c', color: '#0a0a0a',
              fontSize: '10px', fontWeight: '700',
              padding: '3px 8px', borderRadius: '20px',
            }}>{discount}% OFF</div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Brand */}
          {product.brand && (
            <div style={{
              fontSize: '11px', color: '#555',
              letterSpacing: '1px', textTransform: 'uppercase',
              marginBottom: '6px',
            }}>{product.brand}</div>
          )}

          {/* Name */}
          <div style={{
            fontSize: '14px', color: '#f0ede8',
            lineHeight: '1.45', marginBottom: '10px',
            fontFamily: "'DM Sans', sans-serif",
            flex: 1,
          }}>{product.name}</div>

          {/* Rating */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{
                  fontSize: '11px',
                  color: i < Math.floor(product.rating || 0) ? '#c9a84c' : '#333',
                }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: '#555' }}>
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px', fontWeight: '700', color: '#c9a84c',
              }}>
                ₹{product.price?.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span style={{
                  fontSize: '12px', color: '#444',
                  textDecoration: 'line-through', marginLeft: '8px',
                }}>
                  ₹{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                background: product.stock === 0 ? '#1a1a1a' : '#c9a84c',
                border: 'none', borderRadius: '8px',
                padding: '8px 14px', fontSize: '12px', fontWeight: '600',
                color: product.stock === 0 ? '#555' : '#0a0a0a',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (product.stock > 0) e.target.style.background = '#d4b56a'; }}
              onMouseLeave={e => { if (product.stock > 0) e.target.style.background = '#c9a84c'; }}
            >
              {product.stock === 0 ? 'Out of stock' : '+ Add'}
            </button>
          </div>

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 10 && (
            <div style={{
              marginTop: '8px', fontSize: '11px', color: '#ff9800',
            }}>
              Only {product.stock} left in stock!
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}