import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listProducts } from '../../api/products.js';
import { listMovements, listLowStock } from '../../api/inventory.js';
import { apiMessage } from '../../api/error.js';
import { formatDate } from '../../utils/formatDate.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { MovementModal } from './MovementModal.jsx';

const WRITE = ['store_keeper', 'manager', 'shop_admin'];
const TYPE_TONE = { STOCK_IN: 'ok', SALE: 'default', ADJUSTMENT: 'warn' };

export const InventoryPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('movements');
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [modal, setModal] = useState(null); // 'in' | 'adjust' | null
  const canWrite = WRITE.includes(user?.role);

  const load = useCallback(async () => {
    const [p, m, l] = await Promise.all([listProducts(), listMovements({}), listLowStock()]);
    setProducts(p.data.data);
    setMovements(m.data.data);
    setLowStock(l.data.data);
  }, []);

  useEffect(() => {
    load().catch((e) => toast(apiMessage(e), 'err'));
  }, [load, toast]);

  const nameById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products]
  );
  const filteredMovements = useMemo(
    () => (movements || []).filter((m) => !typeFilter || m.type === typeFilter),
    [movements, typeFilter]
  );

  if (!movements || !lowStock) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <h1>{t('inventory.title')}</h1>
        {canWrite && (
          <div className="row">
            <Button variant="ghost" onClick={() => setModal('adjust')}>
              {t('inventory.adjustment')}
            </Button>
            <Button variant="primary" onClick={() => setModal('in')}>
              + {t('inventory.stockIn')}
            </Button>
          </div>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'movements' ? 'on' : ''}`}
          onClick={() => setTab('movements')}
        >
          {t('inventory.movements')}
        </button>
        <button className={`tab ${tab === 'low' ? 'on' : ''}`} onClick={() => setTab('low')}>
          {t('inventory.lowStock')}
          {lowStock.length > 0 && <span className="tab-count">{lowStock.length}</span>}
        </button>
      </div>

      {tab === 'movements' ? (
        <>
          <div className="row" style={{ margin: '1rem 0', gap: '0.5rem' }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ maxWidth: 200 }}
            >
              <option value="">{t('common.all')}</option>
              <option value="STOCK_IN">{t('inventory.stockIn')}</option>
              <option value="ADJUSTMENT">{t('inventory.adjustment')}</option>
              <option value="SALE">{t('nav.sales')}</option>
            </select>
          </div>
          {filteredMovements.length === 0 ? (
            <EmptyState title={t('inventory.noMovements')} />
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t('inventory.date')}</th>
                    <th>{t('inventory.product')}</th>
                    <th>{t('inventory.type')}</th>
                    <th className="right">{t('inventory.quantity')}</th>
                    <th>{t('inventory.reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((m) => (
                    <tr key={m.id}>
                      <td className="muted num">{formatDate(m.created_at)}</td>
                      <td>{nameById[m.product_id] || '—'}</td>
                      <td>
                        <Badge tone={TYPE_TONE[m.type] || 'default'}>{m.type}</Badge>
                      </td>
                      <td
                        className="right num"
                        style={{
                          color: m.quantity < 0 ? 'var(--danger)' : 'var(--ok)',
                          fontWeight: 600,
                        }}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="muted">{m.reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : lowStock.length === 0 ? (
        <div style={{ marginTop: '1rem' }}>
          <EmptyState title={t('inventory.noLowStock')} />
        </div>
      ) : (
        <div className="table-wrap" style={{ marginTop: '1rem' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('inventory.product')}</th>
                <th className="right">{t('inventory.current')}</th>
                <th className="right">{t('inventory.min')}</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td className="right">
                    <span className="num">{p.stock_qty}</span>{' '}
                    <Badge tone={p.stock_qty <= 0 ? 'danger' : 'warn'}>
                      {p.stock_qty <= 0 ? t('products.out') : t('products.low')}
                    </Badge>
                  </td>
                  <td className="right num">{p.min_stock_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MovementModal
          mode={modal === 'in' ? 'in' : 'adjust'}
          products={products}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </section>
  );
};
