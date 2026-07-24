import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';

// Customer Pages
import CustomerLayout from './layouts/CustomerLayout';
import Home from './pages/customer/Home';
import MedicineSearch from './pages/customer/MedicineSearch';
import CustomerCategories from './pages/customer/Categories';
import MedicineDetail from './pages/customer/MedicineDetail';
import Services from './pages/customer/Services';
import Contact from './pages/customer/Contact';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/admin/Login';
import CashierLogin from './pages/admin/CashierLogin';
import Dashboard from './pages/admin/Dashboard';
import Medicines from './pages/admin/Medicines';
import MedicineForm from './pages/admin/MedicineForm';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import POS from './pages/admin/POS';
import Customers from './pages/admin/Customers';
import Inventory from './pages/admin/Inventory';
import Purchases from './pages/admin/Purchases';
import Suppliers from './pages/admin/Suppliers';
import Prescriptions from './pages/admin/Prescriptions';
import CashFlow from './pages/admin/CashFlow';
import Reports from './pages/admin/Reports';
import Users from './pages/admin/Users';
import Notifications from './pages/admin/Notifications';
import CMS from './pages/admin/CMS';
import QRManagement from './pages/admin/QRManagement';
import Settings from './pages/admin/Settings';

// Protected route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
};

// Role Based Redirect for /admin root
const RoleBasedRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === 'cashier') return <Navigate to="/admin/pos" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const initTheme = useThemeStore((s) => s.initTheme);
  useEffect(() => { checkAuth(); initTheme(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: '14px' },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* ===== CUSTOMER ROUTES ===== */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="medicines" element={<MedicineSearch />} />
          <Route path="medicines/:id" element={<MedicineDetail />} />
          <Route path="categories" element={<CustomerCategories />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="track-order/:orderNumber" element={<OrderTracking />} />
        </Route>

        {/* ===== ADMIN AUTH ===== */}
        <Route path="/admin/login" element={<Login />} />

        {/* ===== CASHIER AUTH ===== */}
        <Route path="/cashier/login" element={<CashierLogin />} />

        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<RoleBasedRedirect />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="medicines/add" element={<MedicineForm />} />
          <Route path="medicines/edit/:id" element={<MedicineForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="pos" element={<POS />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="prescriptions" element={<Prescriptions />} />
          <Route path="cashflow" element={<CashFlow />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cms" element={<CMS />} />
          <Route path="qr" element={<QRManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
