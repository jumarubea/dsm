import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { createUser, updateUser } from '../../api/users.js';
import { apiMessage, apiFields } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

const ROLES = ['shop_admin', 'manager', 'sales_attendant', 'store_keeper'];

export const UserFormModal = ({ user, onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const editing = Boolean(user);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'sales_attendant',
    is_active: user ? String(user.is_active) : 'true',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      if (editing) {
        await updateUser(user.id, {
          name: form.name.trim(),
          role: form.role,
          is_active: form.is_active === 'true',
        });
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        });
      }
      toast(t('users.saved'), 'ok');
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
      title={editing ? t('common.edit') : t('users.new')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="user-form" disabled={busy}>
            {busy ? t('common.saving') : t('common.save')}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={submit} className="stack">
        <Field label={t('users.name')} error={errors.name}>
          <input value={form.name} onChange={set('name')} required autoFocus />
        </Field>
        <Field label={t('users.email')} error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            disabled={editing}
          />
        </Field>
        {!editing && (
          <Field label={t('users.password')} error={errors.password} hint="Min. 8 characters">
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: editing ? '1fr 1fr' : '1fr',
            gap: '0.75rem',
          }}
        >
          <Field label={t('users.role')} error={errors.role}>
            <select value={form.role} onChange={set('role')}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`users.role_${r}`)}
                </option>
              ))}
            </select>
          </Field>
          {editing && (
            <Field label={t('users.status')}>
              <select value={form.is_active} onChange={set('is_active')}>
                <option value="true">{t('users.active')}</option>
                <option value="false">{t('users.inactive')}</option>
              </select>
            </Field>
          )}
        </div>
      </form>
    </Modal>
  );
};
