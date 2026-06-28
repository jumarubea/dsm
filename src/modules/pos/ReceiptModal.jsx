import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { formatTZS } from '../../utils/formatTZS.js';

export const ReceiptModal = ({ sale, productName, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal
      title={t('pos.receipt')}
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          {t('pos.newSale')}
        </Button>
      }
    >
      <div className="receipt">
        {sale.items.map((it) => (
          <div className="r-line" key={it.id}>
            <span>
              {it.quantity} × {productName(it.product_id)}
            </span>
            <span className="num">{formatTZS(it.line_total)}</span>
          </div>
        ))}
        <div className="r-line r-total">
          <span>{t('pos.total')}</span>
          <span className="num">{formatTZS(sale.total)}</span>
        </div>
        <p className="muted" style={{ marginTop: '0.75rem' }}>
          {t('pos.method')}: {t(`pos.${sale.payment_method}`)} · {sale.payment_status}
        </p>
      </div>
    </Modal>
  );
};
