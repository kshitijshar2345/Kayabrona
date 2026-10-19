import { useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('info'); // 'info' | 'password'

  // Password change form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (newPwd.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPwd !== confirmPwd) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await api.put('/users/change-password', { currentPassword: currentPwd, newPassword: newPwd });
      setMsg('Password changed successfully!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <p style={s.eyebrow}>ACCOUNT</p>
      <h1 style={s.heading}>My Profile</h1>

      {/* Avatar + name */}
      <div style={s.avatarRow}>
        <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <p style={s.name}>{user?.name}</p>
          <p style={s.email}>{user?.email}</p>
          <span style={s.roleBadge}>{user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Member'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {['info', 'password'].map((t) => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>
            {t === 'info' ? 'Account Info' : 'Change Password'}
          </button>
        ))}
      </div>

      <div style={s.card}>
        {tab === 'info' && (
          <div>
            <Row label="Full name" value={user?.name} />
            <Row label="Email" value={user?.email} />
            <Row label="Role" value={user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Customer'} />
            <p style={{ color: '#555', fontSize: 13, marginTop: '1.5rem' }}>
              To update your name or email, contact support.
            </p>
          </div>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange}>
            {error && <div style={s.errorBox}>{error}</div>}
            {msg   && <div style={s.successBox}>{msg}</div>}
            <Label>Current password</Label>
            <input style={s.input} type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="Enter current password" required />
            <Label>New password</Label>
            <input style={s.input} type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="Min 6 characters" required />
            <Label>Confirm new password</Label>
            <input style={s.input} type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Re-enter new password" required />
            <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1a1a1a', fontSize: 14 }}>
    <span style={{ color: '#666' }}>{label}</span>
    <span style={{ color: '#f0ede8', fontWeight: 500 }}>{value}</span>
  </div>
);

const Label = ({ children }) => <p style={{ fontSize: 13, color: '#888', margin: '1rem 0 6px' }}>{children}</p>;

const s = {
  page: { padding: '2rem 3rem', minHeight: '100vh', background: '#0a0a0a', color: '#f0ede8' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.15em', color: '#888', margin: '0 0 0.25rem' },
  heading: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, margin: '0 0 2rem' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' },
  avatar: { width: 72, height: 72, borderRadius: '50%', background: '#c9a84c', color: '#0a0a0a', fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  name: { margin: '0 0 4px', fontSize: 20, fontWeight: 700 },
  email: { margin: '0 0 8px', color: '#888', fontSize: 14 },
  roleBadge: { background: '#1a1400', color: '#c9a84c', border: '1px solid #3a2e00', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid #1a1a1a', paddingBottom: 0 },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#666', fontSize: 14, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 },
  tabActive: { color: '#c9a84c', borderBottom: '2px solid #c9a84c' },
  card: { background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 16, padding: '1.5rem', maxWidth: 520 },
  input: { width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#f0ede8', padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' },
  btn: { marginTop: '1.5rem', background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '11px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  errorBox: { background: '#1a0808', border: '1px solid #3a1515', color: '#ff8080', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 14 },
  successBox: { background: '#0d1a0d', border: '1px solid #1a3a1a', color: '#6bcf6b', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 14 },
};

export default Profile;