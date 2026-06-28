import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  listTenants,
  listPlans,
  suspendTenant,
  activateTenant,
  impersonateTenant,
} from '../../api/admin.js';
import { apiMessage } from '../../api/error.js';
import { formatDate } from '../../utils/formatDate.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { TenantStatusBadge } from '../../components/common/StatusBadge.jsx';
import { CreateTenantModal } from './CreateTenantModal.jsx';

export const TenantsPage = () => {
  const { t } = useTranslation();
  const { startImpersonation } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [tenants, setTenants] = useState(null);
  const [plans, setPlans] = useState([]);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const [tn, pl] = await Promise.all([listTenants(), listPlans()]);
    setTenants(tn.data.data);
    setPlans(pl.data.data.filter((p) => p.is_active));
  }, []);

  useEffect(() => {
    load().catch((e) => toast(apiMessage(e), 'err'));
  }, [load, toast]);

  const setStatus = async (tenant, suspend) => {
    try {
      await (suspend ? suspendTenant(tenant.id) : activateTenant(tenant.id));
      toast(suspend ? t('admin.suspended') : t('admin.activated'), 'ok');
      load();
    } catch (e) {
      toast(apiMessage(e), 'err');
    }
  };

  const openShop = async (tenant) => {
    try {
      const { data } = await impersonateTenant(tenant.id);
      startImpersonation(data.data.token);
      navigate('/');
    } catch (e) {
      toast(apiMessage(e), 'err');
    }
  };

  if (!tenants) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{t('nav.tenants')}</h1>
          <span className="muted">{tenants.length}</span>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          + {t('admin.newTenant')}
        </Button>
      </div>

      {tenants.length === 0 ? (
        <EmptyState title={t('admin.none')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('admin.shop')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.plan')}</th>
                <th>{t('admin.created')}</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {tenants.map((tn) => {
                const suspended = tn.status === 'suspended';
                return (
                  <tr key={tn.id}>
                    <td>
                      <strong>{tn.name}</strong>
                      <div className="muted" style={{ fontSize: '0.8rem' }}>
                        {tn.slug}
                      </div>
                    </td>
                    <td>
                      <TenantStatusBadge status={tn.status} />
                    </td>
                    <td>{tn.plan_name || '—'}</td>
                    <td className="muted num">{formatDate(tn.created_at)}</td>
                    <td className="right">
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="ghost" onClick={() => openShop(tn)}>
                          {t('admin.openShop')}
                        </Button>
                        {suspended ? (
                          <Button size="sm" variant="ghost" onClick={() => setStatus(tn, false)}>
                            {t('admin.activate')}
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setStatus(tn, true)}>
                            {t('admin.suspend')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <CreateTenantModal plans={plans} onClose={() => setCreating(false)} onCreated={load} />
      )}
    </section>
  );
};
