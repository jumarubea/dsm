import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDashboardSummary } from '../../api/dashboard.js';
import { formatTZS } from '../../utils/formatTZS.js';

const Card = ({ label, value }) => (
  <div className="card">
    <span className="card-label">{label}</span>
    <span className="card-value">{value}</span>
  </div>
);

export const DashboardPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDashboardSummary()
      .then((r) => active && setData(r.data.data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <p className="error">{t('common.error')}</p>;
  if (!data) return <p className="muted">{t('common.loading')}</p>;

  return (
    <section>
      <h1>{t('dashboard.title')}</h1>
      <div className="cards">
        <Card label={t('dashboard.todaySales')} value={formatTZS(data.today_sales_total)} />
        <Card label={t('dashboard.todayCount')} value={data.today_sales_count} />
        <Card label={t('dashboard.stockValue')} value={formatTZS(data.stock_value)} />
        {data.monthly_profit !== undefined && (
          <Card label={t('dashboard.monthlyProfit')} value={formatTZS(data.monthly_profit)} />
        )}
      </div>
    </section>
  );
};
