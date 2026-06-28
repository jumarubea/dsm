import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { stockIn, adjustment } from '../../api/inventory.js';
import { apiMessage } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

export const MovementModal = ({ mode, products, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const isIn = mode === 'in';
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isIn) {
        const body = { product_id: productId, quantity: Number(quantity) };
        if (unitCost) body.unit_cost = Number(unitCost);
        if (reason.trim()) body.reason = reason.trim();
        await stockIn(body);
        toast(t('inventory.stockInDone'), 'ok');
      } else {
        await adjustment({
          product_id: productId,
          quantity: Number(quantity),
          reason: reason.trim(),
        });
        toast(t('inventory.adjustmentDone'), 'ok');
      }
      onSaved();
    } catch (err) {
      toast(apiMessage(err, t('common.error')), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={isIn ? t('inventory.stockIn') : t('inventory.adjustment')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="movement-form"
            disabled={busy || !productId}
          >
            {busy ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="movement-form" onSubmit={submit} className="stack">
        <Field label={t('inventory.product')}>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.stock_qty} {p.unit_of_measure})
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={t('inventory.quantity')}
          hint={isIn ? undefined : t('inventory.quantityHint')}
        >
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min={isIn ? '1' : undefined}
            step="1"
          />
        </Field>
        {isIn && (
          <Field label={t('inventory.unitCost')}>
            <input
              type="number"
              min="0"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </Field>
        )}
        <Field label={t('inventory.reason')}>
          <input value={reason} onChange={(e) => setReason(e.target.value)} required={!isIn} />
        </Field>
      </form>
    </Modal>
  );
};
