import { useEffect, useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listProducts, deleteProduct } from '../../api/products.js';
import { listCategories } from '../../api/categories.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ProductFormModal } from './ProductFormModal.jsx';
import { CategoryModal } from './CategoryModal.jsx';

const CAN_WRITE = ['shop_admin', 'manager'];

export const ProductsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing] = useState(null); // product object | 'new' | null
  const [showCat, setShowCat] = useState(false);

  const isAdmin = user?.role === 'shop_admin';
  const canWrite = CAN_WRITE.includes(user?.role);
  const showCost = Boolean(products?.some((p) => p.cost_price !== undefined));

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([listProducts(), listCategories()]);
    setProducts(p.data.data);
    setCategories(c.data.data);
  }, []);

  useEffect(() => {
    load().catch((e) => toast(apiMessage(e), 'err'));
  }, [load, toast]);

  const catName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (!catFilter || p.category_id === catFilter) &&
        (!q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q))
    );
  }, [products, search, catFilter]);

  const onDelete = async (p) => {
    if (!window.confirm(t('products.deleteConfirm'))) return;
    try {
      await deleteProduct(p.id);
      toast(t('products.deleted'), 'ok');
      load();
    } catch (e) {
      toast(apiMessage(e), 'err');
    }
  };

  const stockBadge = (p) => {
    if (p.stock_qty <= 0) return <Badge tone="danger">{t('products.out')}</Badge>;
    if (p.stock_qty < p.min_stock_level) return <Badge tone="warn">{t('products.low')}</Badge>;
    return null;
  };

  if (!products) return <Loading label={t('common.loading')} />;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>{t('products.title')}</h1>
          <span className="muted">{products.length}</span>
        </div>
        {canWrite && (
          <div className="row">
            <Button variant="ghost" onClick={() => setShowCat(true)}>
              {t('products.newCategory')}
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                categories.length ? setEditing('new') : toast(t('products.needCategory'), 'err')
              }
            >
              + {t('products.new')}
            </Button>
          </div>
        )}
      </div>

      <div className="row" style={{ marginBottom: '1rem', gap: '0.75rem' }}>
        <div className="search" style={{ flex: 1, maxWidth: 360 }}>
          <input
            placeholder={t('products.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">{t('common.all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {products.length === 0 ? (
        <EmptyState title={t('products.none')}>
          <p>{t('products.noneHint')}</p>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('products.noMatch')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('products.name')}</th>
                <th>{t('products.category')}</th>
                <th className="right">{t('products.retail')}</th>
                {showCost && <th className="right">{t('products.cost')}</th>}
                <th className="right">{t('products.stock')}</th>
                {canWrite && <th aria-label={t('products.actions')} />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    {p.sku && (
                      <div className="muted" style={{ fontSize: '0.8rem' }}>
                        {p.sku}
                      </div>
                    )}
                  </td>
                  <td>{catName[p.category_id] || '—'}</td>
                  <td className="right num">{formatTZS(p.retail_price)}</td>
                  {showCost && (
                    <td className="right num">
                      {p.cost_price !== undefined ? formatTZS(p.cost_price) : '—'}
                    </td>
                  )}
                  <td className="right">
                    <span className="num">
                      {p.stock_qty} {p.unit_of_measure}
                    </span>{' '}
                    {stockBadge(p)}
                  </td>
                  {canWrite && (
                    <td className="right">
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                          {t('common.edit')}
                        </Button>
                        {isAdmin && (
                          <Button size="sm" variant="ghost" onClick={() => onDelete(p)}>
                            {t('common.delete')}
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {showCat && (
        <CategoryModal
          onClose={() => setShowCat(false)}
          onSaved={() => {
            setShowCat(false);
            load();
          }}
        />
      )}
    </section>
  );
};
