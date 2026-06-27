import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const { updateLanguage, isAuthenticated } = useAuth();
  const next = i18n.language === 'en' ? 'sw' : 'en';
  const toggle = () => (isAuthenticated ? updateLanguage(next) : i18n.changeLanguage(next));
  return (
    <button type="button" className="lang-toggle" onClick={toggle} aria-label="Switch language">
      {next.toUpperCase()}
    </button>
  );
};
