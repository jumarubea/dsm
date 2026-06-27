import { useTranslation } from 'react-i18next';
import { useOffline } from '../../contexts/OfflineContext.jsx';

export const ConnectionStatus = () => {
  const { t } = useTranslation();
  const { isOnline, queueCount } = useOffline();
  const label = !isOnline
    ? t('connection.offline')
    : queueCount > 0
      ? t('connection.syncing', { count: queueCount })
      : t('connection.online');
  return <span className={`conn ${isOnline ? 'online' : 'offline'}`}>{label}</span>;
};
