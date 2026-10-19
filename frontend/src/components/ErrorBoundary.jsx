import { Component } from 'react';

// Class component — React error boundaries MUST be class components.
// Wrap your entire app or individual pages to catch JS errors gracefully.
// Usage in App.jsx:
//   import ErrorBoundary from './components/ErrorBoundary';
//   <ErrorBoundary><App /></ErrorBoundary>

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd log this to a service like Sentry
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.page}>
          <div style={s.box}>
            <p style={s.icon}>⚠</p>
            <h2 style={s.title}>Something went wrong</h2>
            <p style={s.msg}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button style={s.btn} onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}>
              Go back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  box: { background: '#111', border: '1px solid #1a0808', borderRadius: 16, padding: '2.5rem', textAlign: 'center', maxWidth: 440 },
  icon: { fontSize: 40, margin: '0 0 1rem' },
  title: { fontFamily: "'Playfair Display', serif", color: '#f0ede8', fontSize: '1.5rem', margin: '0 0 0.75rem' },
  msg: { color: '#ff8080', fontSize: 13, fontFamily: 'monospace', background: '#1a0808', padding: '8px 12px', borderRadius: 6, marginBottom: '1.5rem', wordBreak: 'break-word' },
  btn: { background: '#c9a84c', color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' },
};

export default ErrorBoundary;