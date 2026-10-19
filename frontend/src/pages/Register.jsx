import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess } from '../redux/slices/authSlice';
import { showToast } from '../redux/slices/toastSlice';
import api from '../api/axios';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      dispatch(loginSuccess({
        token: res.data.token,
        user: { name: res.data.name, role: res.data.role, email },
      }));
      dispatch(showToast({ message: "Account created successfully!", type: "success" }));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
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
          <h2 style={styles.leftHeading}>Join the world of luxury.</h2>
          <p style={styles.leftSub}>Register to unlock exclusive collections and deals.</p>
          <div style={styles.benefits}>
            {['Free shipping on all orders', 'Exclusive member discounts', 'Easy 30-day returns', 'Priority customer support'].map((b) => (
              <div key={b} style={styles.benefit}>
                <span style={styles.check}>✓</span>
                <span style={{ color: '#aaa', fontSize: 14 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={styles.right}>
        <div style={styles.formWrap}>
          <h1 style={styles.formHeading}>Create account</h1>
          <p style={styles.formSub}>It only takes a few seconds</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleRegister}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />

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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
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
  benefits: { display: 'flex', flexDirection: 'column', gap: 10 },
  benefit: { display: 'flex', alignItems: 'center', gap: 10 },
  check: { color: '#c9a84c', fontWeight: 700, fontSize: 16 },
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

export default Register;
