import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listPlans, deactivatePlan } from '../../api/admin.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { PlanFormModal } from './PlanFormModal.jsx';

const limit = (n) => (n === -1 ? '∞' : n);

export const PlansPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [plans, setPlans] = useState(null);
  const [editing, setEditing] = useState(null); // plan | 'new' | null

  const load = useCallback(async () => {
    const { data } = await listPlans();
    setPlans(data.data);
  }, []);

  useEffect(() => {
    load().catch((e) => toast(apiMessage(e), 'err'));
  }, [load, toast]);

  const onDeactivate = async (plan) => {
    try {
      await deactivatePlan(plan.id);
      toast(t('admin.planSaved'), 'ok');
      load();
    } catch (e) {
      toast(apiMessage(e), 'err');
    }
  };

  if (!plans) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <h1>{t('nav.plans')}</h1>
        <Button variant="primary" onClick={() => setEditing('new')}>
          + {t('admin.newPlan')}
        </Button>
      </div>

      {plans.length === 0 ? (
        <EmptyState title={t('reports.noData')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('admin.planName')}</th>
                <th className="right">{t('admin.price')}</th>
                <th>{t('admin.billingCycle')}</th>
                <th className="right">{t('admin.maxUsers')}</th>
                <th className="right">{t('admin.maxProducts')}</th>
                <th>{t('admin.status')}</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td className="right num">{formatTZS(p.price_tzs)}</td>
                  <td>{t(`reports.${p.billing_cycle}`, p.billing_cycle)}</td>
                  <td className="right num">{limit(p.max_users)}</td>
                  <td className="right num">{limit(p.max_products)}</td>
                  <td>
                    <Badge tone={p.is_active ? 'ok' : 'default'}>
                      {p.is_active ? t('admin.active') : t('admin.inactive')}
                    </Badge>
                  </td>
                  <td className="right">
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                        {t('common.edit')}
                      </Button>
                      {p.is_active && (
                        <Button size="sm" variant="ghost" onClick={() => onDeactivate(p)}>
                          {t('admin.deactivate')}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <PlanFormModal
          plan={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </section>
  );
};
