import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';
import { ShopLayout } from '../components/layout/ShopLayout.jsx';
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout.jsx';
import { Placeholder } from '../components/common/Placeholder.jsx';
import { LoginPage } from '../modules/auth/LoginPage.jsx';
import { DashboardPage } from '../modules/dashboard/DashboardPage.jsx';
import { ProductsPage } from '../modules/products/ProductsPage.jsx';
import { PosPage } from '../modules/pos/PosPage.jsx';
import { InventoryPage } from '../modules/inventory/InventoryPage.jsx';
import { SalesPage } from '../modules/sales/SalesPage.jsx';
import { CustomersPage } from '../modules/customers/CustomersPage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const Shell = () => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <SuperAdminLayout /> : <ShopLayout />;
};

const Home = () => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <Placeholder titleKey="platform" /> : <DashboardPage />;
};

const SubscriptionExpired = () => {
  const { t } = useTranslation();
  return (
    <div className="center">
      <p className="error">{t('subscription.expired')}</p>
    </div>
  );
};

// Redirects to the subscription screen when the API returns 402.
const SubscriptionWatcher = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate('/subscription-expired');
    window.addEventListener('dsm:subscription-expired', handler);
    return () => window.removeEventListener('dsm:subscription-expired', handler);
  }, [navigate]);
  return null;
};

export const AppRouter = () => (
  <BrowserRouter>
    <SubscriptionWatcher />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/subscription-expired" element={<SubscriptionExpired />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<Placeholder titleKey="reports" />} />
          <Route path="users" element={<Placeholder titleKey="users" />} />
          <Route path="tenants" element={<Placeholder titleKey="tenants" />} />
          <Route path="plans" element={<Placeholder titleKey="plans" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
