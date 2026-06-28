import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listProducts } from '../../api/products.js';
import { createSale } from '../../api/sales.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { generateIdempotencyKey } from '../../utils/idempotencyKey.js';
import { enqueueWrite } from '../../offline/queue.js';
import { cartTotal, lineTotal } from './cart.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ReceiptModal } from './ReceiptModal.jsx';

const METHODS = ['cash', 'mpesa', 'airtel'];

export const PosPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const refresh = () => listProducts().then((r) => setProducts(r.data.data));

  useEffect(() => {
    refresh().catch((e) => toast(apiMessage(e), 'err'));
  }, [toast]);

  const nameById = useMemo(
    () => Object.fromEntries((products || []).map((p) => [p.id, p.name])),
    [products]
  );

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const add = (p) => {
    if (p.stock_qty <= 0) return;
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) {
        if (ex.quantity >= p.stock_qty) {
          toast(t('pos.noStock'), 'err');
          return c;
        }
        return c.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...c,
        {
          id: p.id,
          name: p.name,
          unit_price: Number(p.retail_price),
          quantity: 1,
          stock_qty: p.stock_qty,
        },
      ];
    });
  };

  const changeQty = (id, delta) =>
    setCart((c) =>
      c.flatMap((i) => {
        if (i.id !== id) return [i];
        const q = i.quantity + delta;
        if (q <= 0) return [];
        if (q > i.stock_qty) {
          toast(t('pos.noStock'), 'err');
          return [i];
        }
        return [{ ...i, quantity: q }];
      })
    );

  const reset = () => {
    setCart([]);
    setReference('');
    setMethod('cash');
  };

  const total = cartTotal(cart);

  const charge = async () => {
    if (!cart.length) return;
    setBusy(true);
    const key = generateIdempotencyKey();
    const body = {
      payment_method: method,
      items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };
    if (reference.trim()) body.payment_reference = reference.trim();

    // Queue the sale (same idempotency key) to sync when back online.
    const queueForLater = async () => {
      await enqueueWrite({
        id: key,
        endpoint: '/api/v1/sales',
        method: 'post',
        body,
        tenant_id: user?.tenant_id,
      });
      reset();
      refresh().catch(() => {});
      toast(t('pos.savedOffline'), 'ok');
    };

    try {
      if (!navigator.onLine) {
        await queueForLater();
        return;
      }
      const { data } = await createSale(body, key);
      setReceipt(data.data);
      reset();
      refresh().catch(() => {});
      toast(t('pos.completed'), 'ok');
    } catch (e) {
      if (!e.response) {
        await queueForLater(); // network error → offline
      } else {
        toast(apiMessage(e), 'err');
      }
    } finally {
      setBusy(false);
    }
  };

  if (!products) return <Loading label={t('common.loading')} />;

  return (
    <div className="pos">
      <div className="pos-left">
        <div className="search">
          <input
            autoFocus
            placeholder={t('pos.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {products.length === 0 ? (
          <EmptyState title={t('pos.noProducts')} />
        ) : (
          <div className="pos-grid">
            {filtered.map((p) => (
              <button
                key={p.id}
                className="tile"
                disabled={p.stock_qty <= 0}
                onClick={() => add(p)}
              >
                <span className="t-name">{p.name}</span>
                <span className="t-meta">
                  <span className="t-price num">{formatTZS(p.retail_price)}</span>
                  <span className="t-stock num">
                    {p.stock_qty <= 0 ? t('pos.noStock') : p.stock_qty}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <aside className="cart">
        <div className="cart-head">{t('pos.cart')}</div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty" style={{ border: 'none', background: 'none' }}>
              <div className="empty-title">{t('pos.empty')}</div>
              <p>{t('pos.emptyHint')}</p>
            </div>
          ) : (
            cart.map((i) => (
              <div className="cart-item" key={i.id}>
                <div className="ci-name">
                  {i.name}
                  <div className="muted num" style={{ fontSize: '0.8rem' }}>
                    {formatTZS(i.unit_price)}
                  </div>
                </div>
                <div className="ci-line num">{formatTZS(lineTotal(i))}</div>
                <div className="qty">
                  <button onClick={() => changeQty(i.id, -1)} aria-label="decrease">
                    −
                  </button>
                  <span className="num">{i.quantity}</span>
                  <button onClick={() => changeQty(i.id, 1)} aria-label="increase">
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-foot">
          <div className="total-row">
            <span className="muted">{t('pos.total')}</span>
            <span className="t-amount num">{formatTZS(total)}</span>
          </div>
          <div className="pay-methods">
            {METHODS.map((m) => (
              <button
                key={m}
                className={`seg ${method === m ? 'on' : ''}`}
                onClick={() => setMethod(m)}
              >
                {t(`pos.${m}`)}
              </button>
            ))}
          </div>
          {method !== 'cash' && (
            <input
              placeholder={t('pos.reference')}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          )}
          <button
            className="btn btn-pay btn-block"
            disabled={!cart.length || busy}
            onClick={charge}
          >
            {busy ? t('common.saving') : `${t('pos.charge')} · ${formatTZS(total)}`}
          </button>
        </div>
      </aside>

      {receipt && (
        <ReceiptModal
          sale={receipt}
          productName={(id) => nameById[id] || ''}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
};
