import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';


const categories = [
  { name: 'Electronics', count: '2,400+', icon: '⚡', bg: '#0d0f1a', accent: '#4a6cf7' },
  { name: 'Fashion', count: '5,200+', icon: '✦', bg: '#1a0d12', accent: '#e879a0' },
  { name: 'Home & Living', count: '1,800+', icon: '◈', bg: '#0a150a', accent: '#4caf50' },
  { name: 'Beauty', count: '900+', icon: '◆', bg: '#1a120a', accent: '#ff9800' },
  { name: 'Sports', count: '1,100+', icon: '◉', bg: '#0a1215', accent: '#00bcd4' },
  { name: 'Books', count: '3,600+', icon: '❖', bg: '#120d1a', accent: '#9c27b0' },
];

const featured = [
  { id: 1, name: 'Premium Wireless Headphones', price: 4999, original: 7999, rating: 4.8, reviews: 234, tag: 'Best Seller', img: '🎧' },
  { id: 2, name: 'Luxury Leather Wallet', price: 1499, original: 2499, rating: 4.9, reviews: 89, tag: 'New', img: '👜' },
  { id: 3, name: 'Smart Watch Pro', price: 12999, original: 18999, rating: 4.7, reviews: 512, tag: 'Sale', img: '⌚' },
  { id: 4, name: 'Silk Evening Dress', price: 3299, original: 5499, rating: 4.6, reviews: 167, tag: 'Trending', img: '👗' },
];

export default function Home() {
  const user = useSelector(s => s.auth.user);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", color: '#f0ede8' }}>
      

      {/* Hero */}
      <section style={{
        padding: '80px 48px', borderBottom: '1px solid #1a1a1a',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 60%, #111008 100%)',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, #c9a84c08, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '16px' }}>
          Welcome back, {user?.name?.split(' ')[0]}
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: '60px', fontWeight: '700',
          lineHeight: '1.12', marginBottom: '20px', maxWidth: '700px',
        }}>
          Discover<br />
          <span style={{ color: '#c9a84c' }}>Premium</span> Products<br />
          You'll Love
        </h1>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '460px', lineHeight: '1.7', marginBottom: '40px' }}>
          Curated collections from the world's finest brands. Free shipping, easy returns, and exceptional quality guaranteed.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/shop" style={{
            background: '#c9a84c', borderRadius: '10px', padding: '14px 32px',
            textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: '#0a0a0a',
          }}>Shop Collection →</Link>
          <Link to="/shop?category=sale" style={{
            background: 'transparent', border: '1px solid #2a2a2a',
            borderRadius: '10px', padding: '14px 32px',
            textDecoration: 'none', fontSize: '14px', color: '#f0ede8',
          }}>View Deals</Link>
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '60px' }}>
          {[['12K+', 'Products'], ['48K+', 'Happy Customers'], ['4.9★', 'Avg. Rating'], ['Free', 'Shipping']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: '#c9a84c', fontWeight: '700' }}>{n}</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '64px 48px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '8px' }}>Browse</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#f0ede8' }}>Shop by Category</h2>
          </div>
          <Link to="/shop" style={{ fontSize: '13px', color: '#c9a84c', textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {categories.map(({ name, count, icon, bg, accent }) => (
            <Link key={name} to={`/shop?category=${name.toLowerCase()}`} style={{
              textDecoration: 'none', background: bg,
              border: '1px solid #1a1a1a', borderRadius: '14px',
              padding: '24px', cursor: 'pointer', transition: 'all 0.2s',
              display: 'block',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '44'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ fontSize: '24px', marginBottom: '12px', color: accent }}>{icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#f0ede8', marginBottom: '4px' }}>{name}</div>
              <div style={{ fontSize: '12px', color: '#555' }}>{count} products</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '64px 48px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '8px' }}>Handpicked</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#f0ede8' }}>Featured Products</h2>
          </div>
          <Link to="/shop" style={{ fontSize: '13px', color: '#c9a84c', textDecoration: 'none' }}>Shop all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {featured.map(product => (
            <Link key={product.id} to={`/shop`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#111', border: '1px solid #1a1a1a',
                borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c33'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Product image */}
                <div style={{
                  height: '180px', background: '#0d0d0d',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '64px', position: 'relative',
                  borderBottom: '1px solid #1a1a1a',
                }}>
                  {product.img}
                  <span style={{
                    position: 'absolute', top: '12px', left: '12px',
                    background: product.tag === 'Sale' ? '#c9a84c' : product.tag === 'New' ? '#4a6cf7' : '#333',
                    color: product.tag === 'Sale' ? '#0a0a0a' : '#f0ede8',
                    fontSize: '10px', fontWeight: '600', padding: '3px 10px',
                    borderRadius: '20px', letterSpacing: '0.5px',
                  }}>{product.tag}</span>
                </div>
                {/* Info */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#f0ede8', marginBottom: '8px', lineHeight: '1.4' }}>
                    {product.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#c9a84c', fontWeight: '700' }}>
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#444', marginLeft: '6px', textDecoration: 'line-through' }}>
                        ₹{product.original.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>★ {product.rating}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner */}
      <section style={{
        margin: '0 48px 64px', borderRadius: '20px',
        background: '#0d0f0a', border: '1px solid #c9a84c22',
        padding: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '2px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '10px' }}>
            Limited time
          </p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#f0ede8', marginBottom: '8px' }}>
            Up to 40% off on<br />selected items
          </h3>
          <p style={{ color: '#555', fontSize: '14px' }}>Shop our biggest sale of the season</p>
        </div>
        <Link to="/shop?category=sale" style={{
          background: '#c9a84c', borderRadius: '10px', padding: '14px 28px',
          textDecoration: 'none', fontSize: '14px', fontWeight: '600', color: '#0a0a0a',
          whiteSpace: 'nowrap',
        }}>Shop the Sale</Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1a1a1a', padding: '32px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#444', fontSize: '13px',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#f0ede8' }}>
          Kayabrona
        </div>
        <div>© 2026 Kayabrona. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <span key={l} style={{ cursor: 'pointer', color: '#555' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}