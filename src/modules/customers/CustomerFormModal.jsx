import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { createCustomer, updateCustomer } from '../../api/customers.js';
import { apiMessage, apiFields } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

export const CustomerFormModal = ({ customer, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const editing = Boolean(customer);
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.address ?? '',
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
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
    };
    try {
      if (editing) await updateCustomer(customer.id, body);
      else await createCustomer(body);
      toast(t('customers.saved'), 'ok');
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
      title={editing ? t('common.edit') : t('customers.new')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="customer-form" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={submit} className="stack">
        <Field label={t('customers.name')} error={errors.name}>
          <input value={form.name} onChange={set('name')} required autoFocus />
        </Field>
        <Field label={t('customers.phone')} error={errors.phone}>
          <input value={form.phone} onChange={set('phone')} placeholder="0754…" />
        </Field>
        <Field label={t('customers.email')} error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label={t('customers.address')} error={errors.address}>
          <input value={form.address} onChange={set('address')} />
        </Field>
      </form>
    </Modal>
  );
};
