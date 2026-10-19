import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';

import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import { ToastContainer } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Order';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <Navbar />
          <ToastContainer />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />

            {/* Protected — logged-in users */}
            <Route path="/cart"    element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/orders"  element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Admin only — ROLE_ADMIN */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

            {/* 404 */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;