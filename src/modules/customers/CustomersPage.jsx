import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listCustomers } from '../../api/customers.js';
import { apiMessage } from '../../api/error.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CustomerFormModal } from './CustomerFormModal.jsx';
import { CustomerHistoryModal } from './CustomerHistoryModal.jsx';

const WRITE = ['sales_attendant', 'manager', 'shop_admin'];

export const CustomersPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [customers, setCustomers] = useState(null);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // customer | 'new' | null
  const [history, setHistory] = useState(null);
  const canWrite = WRITE.includes(user?.role);

  const load = useCallback(async () => {
    const { data } = await listCustomers();
    setCustomers(data.data);
  }, []);

  useEffect(() => {
    load().catch((e) => toast(apiMessage(e), 'err'));
  }, [load, toast]);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  if (!customers) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{t('customers.title')}</h1>
          <span className="muted">{customers.length}</span>
        </div>
        {canWrite && (
          <Button variant="primary" onClick={() => setEditing('new')}>
            + {t('customers.new')}
          </Button>
        )}
      </div>

      <div className="search" style={{ maxWidth: 360, marginBottom: '1rem' }}>
        <input
          placeholder={t('customers.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {customers.length === 0 ? (
        <EmptyState title={t('customers.none')}>
          <p>{t('customers.noneHint')}</p>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('customers.noMatch')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('customers.name')}</th>
                <th>{t('customers.phone')}</th>
                <th>{t('customers.email')}</th>
                <th aria-label={t('products.actions')} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td className="num">{c.phone || '—'}</td>
                  <td className="muted">{c.email || '—'}</td>
                  <td className="right">
                    <div className="row" style={{ justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="ghost" onClick={() => setHistory(c)}>
                        {t('customers.history')}
                      </Button>
                      {canWrite && (
                        <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                          {t('common.edit')}
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
        <CustomerFormModal
          customer={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {history && <CustomerHistoryModal customer={history} onClose={() => setHistory(null)} />}
    </section>
  );
};
