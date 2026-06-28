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
import { ReportsPage } from '../modules/reports/ReportsPage.jsx';
import { PlatformDashboardPage } from '../modules/admin/PlatformDashboardPage.jsx';
import { TenantsPage } from '../modules/admin/TenantsPage.jsx';
import { PlansPage } from '../modules/admin/PlansPage.jsx';
import { RoleGuard } from '../components/RoleGuard.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const Shell = () => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <SuperAdminLayout /> : <ShopLayout />;
};

const Home = () => {
  const { user } = useAuth();
  return user?.role === 'super_admin' ? <PlatformDashboardPage /> : <DashboardPage />;
};

const adminOnly = (el) => <RoleGuard roles={['super_admin']}>{el}</RoleGuard>;

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
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<Placeholder titleKey="users" />} />
          <Route path="tenants" element={adminOnly(<TenantsPage />)} />
          <Route path="plans" element={adminOnly(<PlansPage />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);
