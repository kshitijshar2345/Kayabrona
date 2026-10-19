import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

// Wraps any route that requires login.
// If the user is not logged in, redirects to /login.
// After login, React Router will send them back to where they were.

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isLoggedIn) {
    // Pass the attempted URL so after login we can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;