import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/common/Modal.jsx';
import { getCustomerHistory } from '../../api/customers.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { formatDate } from '../../utils/formatDate.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { SaleStatusBadge } from '../../components/common/StatusBadge.jsx';

export const CustomerHistoryModal = ({ customer, onClose }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [sales, setSales] = useState(null);

  useEffect(() => {
    getCustomerHistory(customer.id)
      .then((r) => setSales(r.data.data))
      .catch((e) => toast(apiMessage(e), 'err'));
  }, [customer.id, toast]);

  return (
    <Modal title={`${t('customers.purchaseHistory')} — ${customer.name}`} onClose={onClose} wide>
      {!sales ? (
        <Loading label={t('common.loading')} />
      ) : sales.length === 0 ? (
        <EmptyState title={t('customers.noHistory')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('sales.date')}</th>
                <th>{t('sales.status')}</th>
                <th className="right">{t('sales.total')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="muted num">{formatDate(s.created_at)}</td>
                  <td>
                    <SaleStatusBadge status={s.status} />
                  </td>
                  <td className="right num">{formatTZS(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};
