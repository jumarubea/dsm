import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { LanguageToggle } from '../../components/common/LanguageToggle.jsx';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError(t('auth.invalid'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-top">
          <LanguageToggle />
        </div>
        <h1>{t('common.appName')}</h1>
        <h2>{t('auth.title')}</h2>
        <form onSubmit={submit}>
          <label>
            {t('auth.email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? t('auth.signingIn') : t('auth.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};
