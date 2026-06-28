import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listSales, getSale } from '../../api/sales.js';
import { listProducts } from '../../api/products.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { formatDate } from '../../utils/formatDate.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { SaleStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge.jsx';
import { SaleDetailModal } from './SaleDetailModal.jsx';

const STATUSES = ['PENDING', 'COMPLETED', 'VOIDED', 'PREPARED', 'DELIVERED'];
const METHODS = ['cash', 'mpesa', 'airtel'];

export const SalesPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [sales, setSales] = useState(null);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    payment_method: '',
    date_from: '',
    date_to: '',
  });
  const [selected, setSelected] = useState(null);

  const nameById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products]
  );

  useEffect(() => {
    listProducts()
      .then((r) => setProducts(r.data.data))
      .catch(() => {});
  }, []);

  const reload = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    return listSales(params).then((r) => setSales(r.data.data));
  };

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    listSales(params)
      .then((r) => setSales(r.data.data))
      .catch((e) => toast(apiMessage(e), 'err'));
  }, [filters, toast]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const openSale = async (id) => {
    try {
      const { data } = await getSale(id);
      setSelected(data.data);
    } catch (e) {
      toast(apiMessage(e), 'err');
    }
  };

  const onChanged = async () => {
    await reload().catch(() => {});
    if (selected) {
      try {
        const { data } = await getSale(selected.id);
        setSelected(data.data);
      } catch {
        setSelected(null);
      }
    }
  };

  return (
    <section>
      <div className="page-head">
        <h1>{t('sales.title')}</h1>
      </div>

      <div className="row" style={{ marginBottom: '1rem', gap: '0.6rem', flexWrap: 'wrap' }}>
        <select value={filters.status} onChange={set('status')} style={{ maxWidth: 170 }}>
          <option value="">
            {t('sales.status')}: {t('common.all')}
          </option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.payment_method}
          onChange={set('payment_method')}
          style={{ maxWidth: 170 }}
        >
          <option value="">
            {t('sales.payment')}: {t('common.all')}
          </option>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {t(`pos.${m}`)}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.date_from}
          onChange={set('date_from')}
          aria-label={t('sales.from')}
          style={{ maxWidth: 170 }}
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={set('date_to')}
          aria-label={t('sales.to')}
          style={{ maxWidth: 170 }}
        />
      </div>

      {!sales ? (
        <Loading label={t('common.loading')} />
      ) : sales.length === 0 ? (
        <EmptyState title={t('sales.noMatch')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('sales.date')}</th>
                <th>{t('sales.type')}</th>
                <th>{t('sales.status')}</th>
                <th>{t('sales.payment')}</th>
                <th className="right">{t('sales.total')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} onClick={() => openSale(s.id)} style={{ cursor: 'pointer' }}>
                  <td className="muted num">{formatDate(s.created_at)}</td>
                  <td>{s.type}</td>
                  <td>
                    <SaleStatusBadge status={s.status} />
                  </td>
                  <td>
                    <PaymentStatusBadge status={s.payment_status} />
                  </td>
                  <td className="right num">{formatTZS(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <SaleDetailModal
          sale={selected}
          productName={(id) => nameById[id] || '—'}
          onClose={() => setSelected(null)}
          onChanged={onChanged}
        />
      )}
    </section>
  );
};
