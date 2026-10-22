import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/admin-login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
