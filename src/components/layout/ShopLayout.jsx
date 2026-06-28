import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { LanguageToggle } from '../common/LanguageToggle.jsx';
import { ConnectionStatus } from '../common/ConnectionStatus.jsx';

const SHOP_NAV = [
  { to: '/', key: 'dashboard', end: true },
  { to: '/pos', key: 'pos' },
  { to: '/products', key: 'products' },
  { to: '/inventory', key: 'inventory' },
  { to: '/sales', key: 'sales' },
  { to: '/customers', key: 'customers' },
  { to: '/reports', key: 'reports' },
  { to: '/users', key: 'users' },
];

export const ShopLayout = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">{t('common.appName')}</div>
        <nav>
          {SHOP_NAV.map((i) => (
            <NavLink key={i.key} to={i.to} end={i.end}>
              {t(`nav.${i.key}`)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <ConnectionStatus />
          <span className="spacer" />
          <LanguageToggle />
          <span className="user">{user?.name}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
            {t('common.logout')}
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
