import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const cartCount = useSelector((s) =>
    s.cart.items.reduce((total, item) => total + item.quantity, 0)
  );
  const [menuOpen, setMenuOpen] = useState(false);

  if (['/login', '/register'].includes(location.pathname)) return null;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <nav style={s.nav}>
      {/* Logo */}
      <Link to="/" style={s.logo}>
        <span style={s.logoBox}>K</span>
        <span style={s.logoText}>Kayabrona</span>
      </Link>

      {/* Nav Links */}
      <div style={s.links}>
        <Link to="/"      style={{ ...s.link, ...(isActive('/')      ? s.linkActive : {}) }}>Home</Link>
        <Link to="/shop"  style={{ ...s.link, ...(isActive('/shop')  ? s.linkActive : {}) }}>Shop</Link>
        <Link to="/orders" style={{ ...s.link, ...(isActive('/orders') ? s.linkActive : {}) }}>My Orders</Link>
        {isAdmin && (
          <Link to="/admin" style={{ ...s.link, ...(isActive('/admin') ? s.linkActive : {}), color: isActive('/admin') ? '#c9a84c' : '#ff8c42' }}>
            Admin
          </Link>
        )}
      </div>

      {/* Right side */}
      <div style={s.right}>
        {/* Cart */}
        <Link to="/cart" style={s.cartWrap}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f0ede8" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
        </Link>

        {/* User dropdown */}
        {isLoggedIn && user ? (
          <div style={{ position: 'relative' }}>
            <button style={s.avatarBtn} onClick={() => setMenuOpen((o) => !o)}>
              <div style={s.avatar}>{user.name?.[0]?.toUpperCase()}</div>
              <span style={s.userName}>{user.name?.split(' ')[0]}</span>
              <span style={{ color: '#666', fontSize: 10 }}>▾</span>
            </button>

            {menuOpen && (
              <div style={s.dropdown} onMouseLeave={() => setMenuOpen(false)}>
                <Link to="/profile" style={s.dropItem} onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/orders"  style={s.dropItem} onClick={() => setMenuOpen(false)}>My Orders</Link>
                {isAdmin && (
                  <Link to="/admin" style={{ ...s.dropItem, color: '#ff8c42' }} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                )}
                <div style={s.dropDivider} />
                <button style={s.dropLogout} onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={s.signInBtn}>Sign In</Link>
        )}
      </div>
    </nav>
  );
};

const s = {
  nav: { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem', height: 64, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1a1a1a' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' },
  logoBox: { width: 32, height: 32, background: '#c9a84c', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0a0a', fontSize: 16 },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#f0ede8' },
  links: { display: 'flex', gap: '2rem' },
  link: { color: '#aaa', textDecoration: 'none', fontSize: 14 },
  linkActive: { color: '#c9a84c' },
  right: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  cartWrap: { position: 'relative', color: '#f0ede8', display: 'flex', alignItems: 'center' },
  badge: { position: 'absolute', top: -8, right: -8, background: '#c9a84c', color: '#0a0a0a', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#c9a84c', color: '#0a0a0a', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userName: { color: '#f0ede8', fontSize: 14 },
  dropdown: { position: 'absolute', right: 0, top: '110%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, minWidth: 160, padding: '6px 0', zIndex: 200 },
  dropItem: { display: 'block', padding: '9px 16px', color: '#ccc', fontSize: 14, textDecoration: 'none', cursor: 'pointer' },
  dropDivider: { borderTop: '1px solid #1a1a1a', margin: '4px 0' },
  dropLogout: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', background: 'none', border: 'none', color: '#ff6b6b', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  signInBtn: { background: '#c9a84c', color: '#0a0a0a', textDecoration: 'none', padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 700 },
};

export default Navbar;