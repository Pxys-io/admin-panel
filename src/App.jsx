import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Stores from './pages/Stores';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Admins from './pages/Admins';
import AuditLogs from './pages/AuditLogs';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import PromoCodes from './pages/PromoCodes';
import Sliders from './pages/Sliders';
import Returns from './pages/Returns';
import Tickets from './pages/Tickets';
import Transactions from './pages/Transactions';
import Sellers from './pages/Sellers';
import Affiliates from './pages/Affiliates';
import Settings from './pages/Settings';
// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerEarnings from './pages/seller/SellerEarnings';
import SellerInventory from './pages/seller/SellerInventory';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="stores" element={<Stores />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="admins" element={<Admins />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="brands" element={<Brands />} />
        <Route path="promo-codes" element={<PromoCodes />} />
        <Route path="sliders" element={<Sliders />} />
        <Route path="returns" element={<Returns />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="sellers" element={<Sellers />} />
        <Route path="affiliates" element={<Affiliates />} />
        <Route path="settings" element={<Settings />} />
        {/* Seller routes */}
        <Route path="seller" element={<SellerDashboard />} />
        <Route path="seller/products" element={<SellerProducts />} />
        <Route path="seller/orders" element={<SellerOrders />} />
        <Route path="seller/earnings" element={<SellerEarnings />} />
        <Route path="seller/inventory" element={<SellerInventory />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
