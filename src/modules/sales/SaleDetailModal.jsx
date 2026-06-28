import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { confirmPayment, voidSale } from '../../api/sales.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { formatDate } from '../../utils/formatDate.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { SaleStatusBadge, PaymentStatusBadge } from '../../components/common/StatusBadge.jsx';

const MANAGE = ['manager', 'shop_admin'];
const SELL = ['sales_attendant', 'manager', 'shop_admin'];

export const SaleDetailModal = ({ sale, productName, onClose, onChanged }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [reason, setReason] = useState('');

  const canVoid = MANAGE.includes(user?.role) && sale.status !== 'VOIDED';
  const canConfirm =
    SELL.includes(user?.role) && sale.payment_status === 'PENDING' && sale.status !== 'VOIDED';

  const doConfirm = async () => {
    setBusy(true);
    try {
      await confirmPayment(sale.id, {});
      toast(t('sales.paid'), 'ok');
      onChanged();
    } catch (e) {
      toast(apiMessage(e), 'err');
    } finally {
      setBusy(false);
    }
  };

  const doVoid = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await voidSale(sale.id, { reason: reason.trim() });
      toast(t('sales.voided'), 'ok');
      onChanged();
    } catch (e2) {
      toast(apiMessage(e2), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={t('sales.detail')} onClose={onClose} wide>
      <div className="between" style={{ marginBottom: '0.75rem' }}>
        <span className="muted num">{formatDate(sale.created_at)}</span>
        <div className="row">
          <SaleStatusBadge status={sale.status} />
          <PaymentStatusBadge status={sale.payment_status} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>{t('sales.items')}</th>
              <th className="right">{t('inventory.quantity')}</th>
              <th className="right">{t('products.retail')}</th>
              <th className="right">{t('sales.total')}</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((it) => (
              <tr key={it.id}>
                <td>{productName(it.product_id)}</td>
                <td className="right num">{it.quantity}</td>
                <td className="right num">{formatTZS(it.unit_price)}</td>
                <td className="right num">{formatTZS(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="between" style={{ marginTop: '1rem' }}>
        <span className="muted">
          {t('pos.method')}: {t(`pos.${sale.payment_method}`)}
        </span>
        <span className="num" style={{ fontSize: '1.4rem', fontWeight: 720 }}>
          {formatTZS(sale.total)}
        </span>
      </div>

      {voiding ? (
        <form onSubmit={doVoid} className="stack" style={{ marginTop: '1.25rem' }}>
          <Field label={t('sales.voidReason')}>
            <input value={reason} onChange={(e) => setReason(e.target.value)} required autoFocus />
          </Field>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" type="button" onClick={() => setVoiding(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" type="submit" disabled={busy || !reason.trim()}>
              {t('sales.void')}
            </Button>
          </div>
        </form>
      ) : (
        (canConfirm || canVoid) && (
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            {canVoid && (
              <Button variant="ghost" onClick={() => setVoiding(true)}>
                {t('sales.void')}
              </Button>
            )}
            {canConfirm && (
              <Button variant="primary" onClick={doConfirm} disabled={busy}>
                {t('sales.confirmPayment')}
              </Button>
            )}
          </div>
        )
      )}
    </Modal>
  );
};
