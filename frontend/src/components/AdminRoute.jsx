import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Protects routes that only ROLE_ADMIN can access.
// Usage in App.jsx:
//   <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useSelector((s) => s.auth);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== 'ROLE_ADMIN') return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;