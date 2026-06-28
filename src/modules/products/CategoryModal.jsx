import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Field } from '../../components/common/Field.jsx';
import { createCategory } from '../../api/categories.js';
import { apiMessage } from '../../api/error.js';
import { useToast } from '../../contexts/ToastContext.jsx';

export const CategoryModal = ({ onClose, onSaved }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await createCategory({ name: name.trim() });
      toast(t('products.categorySaved'), 'ok');
      onSaved(data.data);
    } catch (err) {
      toast(apiMessage(err, t('common.error')), 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={t('products.newCategory')}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="category-form"
            disabled={busy || !name.trim()}
          >
            {busy ? t('common.saving') : t('common.create')}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit}>
        <Field label={t('products.categoryName')}>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
        </Field>
      </form>
    </Modal>
  );
};
