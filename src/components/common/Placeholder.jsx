import { useTranslation } from 'react-i18next';

export const Placeholder = ({ titleKey }) => {
  const { t } = useTranslation();
  return (
    <section>
      <h1>{t(`nav.${titleKey}`)}</h1>
      <p className="muted">{t('common.comingSoon')}</p>
    </section>
  );
};
