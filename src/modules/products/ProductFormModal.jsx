import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { createProduct, updateProduct } from '../../api/products.js';
import { apiMessage, apiFields } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

const two = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };

export const ProductFormModal = ({ product, categories, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const editing = Boolean(product);
  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category_id: product?.category_id ?? categories[0]?.id ?? '',
    unit_of_measure: product?.unit_of_measure ?? '',
    retail_price: product?.retail_price ?? '',
    wholesale_price: product?.wholesale_price ?? '',
    cost_price: product?.cost_price ?? '',
    min_stock_level: product?.min_stock_level ?? '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const body = {
      name: form.name.trim(),
      sku: form.sku.trim() || undefined,
      category_id: form.category_id,
      unit_of_measure: form.unit_of_measure.trim(),
      retail_price: Number(form.retail_price),
      wholesale_price: Number(form.wholesale_price),
      cost_price: Number(form.cost_price),
      min_stock_level: form.min_stock_level === '' ? undefined : Number(form.min_stock_level),
    };
    try {
      if (editing) await updateProduct(product.id, body);
      else await createProduct(body);
      toast(t('products.saved'), 'ok');
      onSaved();
    } catch (err) {
      setErrors(apiFields(err) || {});
      toast(apiMessage(err, t('common.error')), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={editing ? t('common.edit') : t('products.new')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="product-form" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="stack">
        <Field label={t('products.name')} error={errors.name}>
          <input value={form.name} onChange={set('name')} required autoFocus />
        </Field>
        <div style={two}>
          <Field label={t('products.category')} error={errors.category_id}>
            <select value={form.category_id} onChange={set('category_id')} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('products.unit')} error={errors.unit_of_measure}>
            <input
              value={form.unit_of_measure}
              onChange={set('unit_of_measure')}
              placeholder="kg, pc…"
              required
            />
          </Field>
        </div>
        <Field label={t('products.sku')} error={errors.sku} hint="Optional">
          <input value={form.sku} onChange={set('sku')} />
        </Field>
        <div style={two}>
          <Field label={t('products.retail')} error={errors.retail_price}>
            <input
              type="number"
              min="0"
              value={form.retail_price}
              onChange={set('retail_price')}
              required
            />
          </Field>
          <Field label={t('products.wholesale')} error={errors.wholesale_price}>
            <input
              type="number"
              min="0"
              value={form.wholesale_price}
              onChange={set('wholesale_price')}
              required
            />
          </Field>
        </div>
        <div style={two}>
          <Field label={t('products.cost')} error={errors.cost_price}>
            <input
              type="number"
              min="0"
              value={form.cost_price}
              onChange={set('cost_price')}
              required
            />
          </Field>
          <Field label={t('products.minStock')} error={errors.min_stock_level}>
            <input
              type="number"
              min="0"
              value={form.min_stock_level}
              onChange={set('min_stock_level')}
              placeholder="5"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
};
