import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { platformDashboard, tenantsHealth } from '../../api/admin.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { formatDate } from '../../utils/formatDate.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { TenantStatusBadge } from '../../components/common/StatusBadge.jsx';

const Card = ({ label, value }) => (
  <div className="card">
    <span className="card-label">{label}</span>
    <span className="card-value num">{value}</span>
  </div>
);

export const PlatformDashboardPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    Promise.all([platformDashboard(), tenantsHealth()])
      .then(([s, h]) => {
        setSummary(s.data.data);
        setHealth(h.data.data);
      })
      .catch((e) => toast(apiMessage(e), 'err'));
  }, [toast]);

  if (!summary || !health) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <h1>{t('admin.platform')}</h1>
      </div>

      <div className="cards" style={{ marginTop: 0 }}>
        <Card label={t('admin.mrr')} value={formatTZS(summary.mrr)} />
        <Card label={t('admin.totalTenants')} value={summary.tenants.total} />
        <Card label={t('admin.active')} value={summary.tenants.active} />
        <Card label={t('admin.trialsExpiring')} value={summary.trials_expiring} />
        <Card label={t('admin.pastDue')} value={summary.past_due} />
      </div>

      <h2 style={{ margin: '1.75rem 0 0.85rem' }}>{t('admin.tenantHealth')}</h2>
      {health.length === 0 ? (
        <EmptyState title={t('admin.none')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('admin.shop')}</th>
                <th>{t('admin.status')}</th>
                <th>{t('admin.plan')}</th>
                <th className="right">{t('admin.salesThisMonth')}</th>
                <th>{t('admin.created')}</th>
              </tr>
            </thead>
            <tbody>
              {health.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {row.slug}
                    </div>
                  </td>
                  <td>
                    <TenantStatusBadge status={row.status} />
                  </td>
                  <td>{row.plan_name || '—'}</td>
                  <td className="right num">{row.sales_this_month}</td>
                  <td className="muted num">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
