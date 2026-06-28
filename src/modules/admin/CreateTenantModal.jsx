import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { createTenant } from '../../api/admin.js';
import { apiMessage, apiFields } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

export const CreateTenantModal = ({ plans, onClose, onCreated }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    owner_email: '',
    plan_id: plans[0]?.id ?? '',
    trial_days: '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const body = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      owner_email: form.owner_email.trim(),
      plan_id: form.plan_id,
    };
    if (form.trial_days !== '') body.trial_days = Number(form.trial_days);
    try {
      const { data } = await createTenant(body);
      toast(t('admin.tenantCreated'), 'ok');
      setResult(data.data);
    } catch (err) {
      setErrors(apiFields(err) || {});
      toast(apiMessage(err, t('common.error')), 'err');
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <Modal
        title={t('admin.tenantCreated')}
        onClose={() => {
          onCreated();
          onClose();
        }}
        footer={
          <Button
            variant="primary"
            onClick={() => {
              onCreated();
              onClose();
            }}
          >
            {t('common.close')}
          </Button>
        }
      >
        <p className="muted" style={{ marginTop: 0 }}>
          {t('admin.credsNote')}
        </p>
        <div className="panel panel-pad stack" style={{ gap: '0.5rem' }}>
          <div className="between">
            <span className="muted">{t('admin.shop')}</span>
            <strong>{result.tenant.name}</strong>
          </div>
          <div className="between">
            <span className="muted">{t('admin.ownerEmail')}</span>
            <strong className="num">{result.owner.email}</strong>
          </div>
          <div className="between">
            <span className="muted">{t('admin.tempPassword')}</span>
            <strong className="num" style={{ fontSize: '1.1rem' }}>
              {result.temp_password}
            </strong>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={t('admin.newTenant')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="tenant-form" disabled={busy}>
            {busy ? t('common.saving') : t('common.create')}
          </Button>
        </>
      }
    >
      <form id="tenant-form" onSubmit={submit} className="stack">
        <Field label={t('admin.shopName')} error={errors.name}>
          <input value={form.name} onChange={set('name')} required autoFocus />
        </Field>
        <Field label={t('admin.slug')} error={errors.slug} hint="lowercase, e.g. duka-moja">
          <input value={form.slug} onChange={set('slug')} required />
        </Field>
        <Field label={t('admin.ownerEmail')} error={errors.owner_email}>
          <input type="email" value={form.owner_email} onChange={set('owner_email')} required />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Field label={t('admin.plan')} error={errors.plan_id}>
            <select value={form.plan_id} onChange={set('plan_id')} required>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.trialDays')} error={errors.trial_days}>
            <input
              type="number"
              min="0"
              value={form.trial_days}
              onChange={set('trial_days')}
              placeholder="14"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
};
