import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={s.page}>
      <p style={s.code}>404</p>
      <h1 style={s.title}>Page not found</h1>
      <p style={s.sub}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={s.btns}>
        <button style={s.gold} onClick={() => navigate('/')}>Go Home</button>
        <button style={s.outline} onClick={() => navigate('/shop')}>Browse Shop</button>
      </div>
    </div>
  );
};

const s = {
  page: { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#f0ede8', textAlign: 'center', padding: '2rem' },
  code: { fontSize: 96, fontWeight: 700, color: '#1a1a1a', margin: 0, fontFamily: "'Playfair Display', serif", lineHeight: 1 },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', margin: '0 0 1rem', color: '#f0ede8' },
  sub: { color: '#666', fontSize: 15, marginBottom: '2rem', maxWidth: 380 },
  btns: { display: 'flex', gap: 12 },
  gold: { background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  outline: { background: 'none', color: '#c9a84c', border: '1px solid #c9a84c', borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
};

export default NotFound;