import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginSuccess } from '../redux/slices/authSlice';
import api from '../api/axios';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // After login, go back to where user was trying to go (e.g. /cart or /orders)
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      // res.data = { token, role, name }
      dispatch(loginSuccess({
        token: res.data.token,
        user: { name: res.data.name, role: res.data.role, email },
      }));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.ring1} />
        <div style={styles.ring2} />
        <div style={styles.leftContent}>
          <div style={styles.logo}>
            <span style={styles.logoBox}>L</span>
            <span style={styles.logoText}>Kayabrona</span>
          </div>
          <h2 style={styles.leftHeading}>Welcome back to luxury.</h2>
          <p style={styles.leftSub}>Your curated collection awaits.</p>
          <div style={styles.statsRow}>
            {[['12K+', 'Products'], ['48K+', 'Customers'], ['4.9★', 'Rating'], ['Free', 'Shipping']].map(([num, label]) => (
              <div key={label} style={styles.stat}>
                <p style={styles.statNum}>{num}</p>
                <p style={styles.statLabel}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={styles.right}>
        <div style={styles.formWrap}>
          <h1 style={styles.formHeading}>Sign in</h1>
          <p style={styles.formSub}>Access your account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleLogin}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', height: '100vh', background: '#0a0a0a', overflow: 'hidden' },
  left: { flex: 1, background: '#0d0d0d', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ring1: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: '1px solid #c9a84c22', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  ring2: { position: 'absolute', width: 600, height: 600, borderRadius: '50%', border: '1px solid #c9a84c11', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  leftContent: { position: 'relative', zIndex: 1, padding: '2rem', maxWidth: 400 },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' },
  logoBox: { width: 40, height: 40, background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 700, color: '#0a0a0a', fontSize: 20 },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#f0ede8' },
  leftHeading: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#f0ede8', margin: '0 0 0.5rem', lineHeight: 1.3 },
  leftSub: { color: '#888', marginBottom: '2rem', fontSize: 15 },
  statsRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  stat: { textAlign: 'center' },
  statNum: { margin: 0, color: '#c9a84c', fontWeight: 700, fontSize: 20 },
  statLabel: { margin: '2px 0 0', color: '#666', fontSize: 12 },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  formWrap: { width: '100%', maxWidth: 400 },
  formHeading: { fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', color: '#f0ede8', margin: '0 0 0.25rem' },
  formSub: { color: '#666', marginBottom: '1.5rem', fontSize: 14 },
  errorBox: { background: '#1a0808', border: '1px solid #3a1515', color: '#ff8080', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 14 },
  label: { display: 'block', fontSize: 13, color: '#888', marginBottom: 6, marginTop: '1rem' },
  input: {
    width: '100%', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 8,
    color: '#f0ede8', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
  },
  submitBtn: {
    width: '100%', marginTop: '1.5rem', background: '#c9a84c', color: '#0a0a0a',
    border: 'none', borderRadius: 8, padding: '14px', fontSize: 16,
    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  },
  switchText: { marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: 14 },
  link: { color: '#c9a84c', textDecoration: 'none' },
};

export default Login;