import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { createPlan, updatePlan } from '../../api/admin.js';
import { apiMessage, apiFields } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

const two = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' };

export const PlanFormModal = ({ plan, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const editing = Boolean(plan);
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    price_tzs: plan?.price_tzs ?? '',
    billing_cycle: plan?.billing_cycle ?? 'monthly',
    trial_days: plan?.trial_days ?? '',
    max_users: plan?.max_users ?? '',
    max_products: plan?.max_products ?? '',
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
      price_tzs: Number(form.price_tzs),
      billing_cycle: form.billing_cycle,
      max_users: Number(form.max_users),
      max_products: Number(form.max_products),
    };
    if (form.trial_days !== '') body.trial_days = Number(form.trial_days);
    try {
      if (editing) await updatePlan(plan.id, body);
      else await createPlan(body);
      toast(t('admin.planSaved'), 'ok');
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
      title={editing ? t('common.edit') : t('admin.newPlan')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="plan-form" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="plan-form" onSubmit={submit} className="stack">
        <Field label={t('admin.planName')} error={errors.name}>
          <input value={form.name} onChange={set('name')} required autoFocus />
        </Field>
        <div style={two}>
          <Field label={t('admin.price')} error={errors.price_tzs}>
            <input
              type="number"
              min="0"
              value={form.price_tzs}
              onChange={set('price_tzs')}
              required
            />
          </Field>
          <Field label={t('admin.billingCycle')} error={errors.billing_cycle}>
            <select value={form.billing_cycle} onChange={set('billing_cycle')}>
              <option value="monthly">{t('reports.monthly')}</option>
              <option value="annual">{t('admin.annual') || 'Annual'}</option>
            </select>
          </Field>
        </div>
        <div style={two}>
          <Field
            label={t('admin.maxUsers')}
            error={errors.max_users}
            hint={t('admin.unlimitedHint')}
          >
            <input type="number" value={form.max_users} onChange={set('max_users')} required />
          </Field>
          <Field
            label={t('admin.maxProducts')}
            error={errors.max_products}
            hint={t('admin.unlimitedHint')}
          >
            <input
              type="number"
              value={form.max_products}
              onChange={set('max_products')}
              required
            />
          </Field>
        </div>
        <Field label={t('admin.trialDays')} error={errors.trial_days}>
          <input
            type="number"
            min="0"
            value={form.trial_days}
            onChange={set('trial_days')}
            placeholder="14"
          />
        </Field>
      </form>
    </Modal>
  );
};
