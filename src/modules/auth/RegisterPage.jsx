import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { publicPlansRequest } from '../../api/auth.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { LanguageToggle } from '../../components/common/LanguageToggle.jsx';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    shop_name: '',
    owner_name: '',
    email: '',
    password: '',
    plan_id: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    publicPlansRequest()
      .then((res) => {
        const list = res.data.data;
        setPlans(list);
        setForm((f) => ({ ...f, plan_id: f.plan_id || list[0]?.id || '' }));
      })
      .catch((e) => setError(apiMessage(e)));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const seats = (n) => (n === -1 ? t('register.unlimited') : n);

  return (
    <div className="login">
      <div className="login-card login-card--wide">
        <div className="login-top">
          <LanguageToggle />
        </div>
        <h1>{t('common.appName')}</h1>
        <h2>{t('register.title')}</h2>
        <p className="muted register-lead">{t('register.lead')}</p>
        <form onSubmit={submit}>
          <label>
            {t('register.shopName')}
            <input value={form.shop_name} onChange={set('shop_name')} required minLength={2} />
          </label>
          <label>
            {t('register.ownerName')}
            <input value={form.owner_name} onChange={set('owner_name')} required minLength={2} />
          </label>
          <label>
            {t('auth.email')}
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              autoComplete="username"
            />
          </label>
          <label>
            {t('auth.password')}
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <span className="hint">{t('register.passwordHint')}</span>
          </label>

          <fieldset className="plan-pick">
            <legend>{t('register.choosePlan')}</legend>
            {plans.map((p) => (
              <label key={p.id} className={`plan-opt ${form.plan_id === p.id ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={form.plan_id === p.id}
                  onChange={set('plan_id')}
                />
                <span className="plan-opt-body">
                  <span className="plan-opt-name">{p.name}</span>
                  <span className="plan-opt-price">
                    {formatTZS(p.price_tzs)}
                    <small>/{t('register.month')}</small>
                  </span>
                  <span className="plan-opt-meta muted">
                    {t('register.seats', { n: seats(p.max_users) })} ·{' '}
                    {t('register.trialDays', { n: p.trial_days })}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          {error && <p className="error">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={busy || !form.plan_id}
          >
            {busy ? t('register.creating') : t('register.submit')}
          </button>
        </form>
        <p className="login-alt">
          {t('register.haveAccount')} <Link to="/login">{t('register.signInLink')}</Link>
        </p>
      </div>
    </div>
  );
};
