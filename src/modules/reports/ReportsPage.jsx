import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  reportDaily,
  reportMonthly,
  reportProfit,
  reportFastMoving,
  reportDeadStock,
  downloadReportCsv,
} from '../../api/reports.js';
import { apiMessage } from '../../api/error.js';
import { formatTZS } from '../../utils/formatTZS.js';
import { formatDate } from '../../utils/formatDate.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Loading } from '../../components/common/Spinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ExportButtons } from './ExportButtons.jsx';

const today = () => new Date().toISOString().slice(0, 10);
const thisMonth = () => new Date().toISOString().slice(0, 7);

const Card = ({ label, value }) => (
  <div className="card">
    <span className="card-label">{label}</span>
    <span className="card-value num">{value}</span>
  </div>
);

const useReport = (fetcher, deps) => {
  const toast = useToast();
  const [data, setData] = useState(null);
  useEffect(() => {
    setData(null);
    fetcher()
      .then((r) => setData(r.data.data))
      .catch((e) => toast(apiMessage(e), 'err'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
};

const DailyReport = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState(today());
  const data = useReport(() => reportDaily({ date }), [date]);
  return (
    <div>
      <div className="row" style={{ margin: '1rem 0', gap: '0.6rem' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ maxWidth: 180 }}
        />
        <Button
          variant="ghost"
          onClick={() => downloadReportCsv('daily', { date }, `daily-${date}.csv`)}
        >
          {t('reports.downloadCsv')}
        </Button>
        <ExportButtons
          disabled={!data}
          build={() => ({
            title: `${t('reports.daily')} — ${date}`,
            meta: [
              { label: t('reports.transactions'), value: data.count },
              { label: t('reports.totalSales'), value: formatTZS(data.total) },
            ],
            columns: [
              { header: t('reports.method'), key: 'payment_method' },
              { header: t('reports.count'), key: 'count' },
              { header: t('reports.totalSales'), key: 'total', money: true },
            ],
            rows: data.by_method ?? [],
            filename: `daily-${date}`,
          })}
        />
      </div>
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="cards" style={{ marginTop: 0 }}>
            <Card label={t('reports.transactions')} value={data.count} />
            <Card label={t('reports.totalSales')} value={formatTZS(data.total)} />
          </div>
          <MethodTable rows={data.by_method} />
        </>
      )}
    </div>
  );
};

const MonthlyReport = () => {
  const { t } = useTranslation();
  const [month, setMonth] = useState(thisMonth());
  const data = useReport(() => reportMonthly({ month }), [month]);
  return (
    <div>
      <div className="row" style={{ margin: '1rem 0', gap: '0.6rem' }}>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ maxWidth: 180 }}
        />
        <Button
          variant="ghost"
          onClick={() => downloadReportCsv('monthly', { month }, `monthly-${month}.csv`)}
        >
          {t('reports.downloadCsv')}
        </Button>
        <ExportButtons
          disabled={!data}
          build={() => ({
            title: `${t('reports.monthly')} — ${month}`,
            meta: [
              { label: t('reports.transactions'), value: data.count },
              { label: t('reports.totalSales'), value: formatTZS(data.total) },
            ],
            columns: [
              { header: t('reports.method'), key: 'payment_method' },
              { header: t('reports.count'), key: 'count' },
              { header: t('reports.totalSales'), key: 'total', money: true },
            ],
            rows: data.by_method ?? [],
            filename: `monthly-${month}`,
          })}
        />
      </div>
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="cards" style={{ marginTop: 0 }}>
            <Card label={t('reports.transactions')} value={data.count} />
            <Card label={t('reports.totalSales')} value={formatTZS(data.total)} />
          </div>
          <MethodTable rows={data.by_method} />
        </>
      )}
    </div>
  );
};

const MethodTable = ({ rows }) => {
  const { t } = useTranslation();
  if (!rows || rows.length === 0) return null;
  return (
    <div className="table-wrap" style={{ marginTop: '1.25rem' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>{t('reports.method')}</th>
            <th className="right">{t('reports.count')}</th>
            <th className="right">{t('reports.totalSales')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.payment_method}>
              <td>{t(`pos.${r.payment_method}`)}</td>
              <td className="right num">{r.count}</td>
              <td className="right num">{formatTZS(r.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProfitReport = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState({ from: '', to: '' });
  const data = useReport(
    () => reportProfit(Object.fromEntries(Object.entries(range).filter(([, v]) => v))),
    [range]
  );
  return (
    <div>
      <div className="row" style={{ margin: '1rem 0', gap: '0.6rem', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={range.from}
          onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          aria-label={t('reports.from')}
          style={{ maxWidth: 170 }}
        />
        <input
          type="date"
          value={range.to}
          onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          aria-label={t('reports.to')}
          style={{ maxWidth: 170 }}
        />
        <span className="spacer" />
        <ExportButtons
          disabled={!data}
          build={() => ({
            title: t('reports.profit'),
            meta: [
              { label: t('reports.from'), value: range.from || '—' },
              { label: t('reports.to'), value: range.to || '—' },
            ],
            columns: [
              { header: t('reports.revenue'), key: 'revenue', money: true },
              { header: t('reports.cost'), key: 'cost', money: true },
              { header: t('reports.profitAmount'), key: 'profit', money: true },
            ],
            rows: data ? [data] : [],
            filename: `profit-${range.from || 'all'}-${range.to || 'all'}`,
          })}
        />
      </div>
      {!data ? (
        <Loading />
      ) : (
        <div className="cards" style={{ marginTop: 0 }}>
          <Card label={t('reports.revenue')} value={formatTZS(data.revenue)} />
          <Card label={t('reports.cost')} value={formatTZS(data.cost)} />
          <Card label={t('reports.profitAmount')} value={formatTZS(data.profit)} />
        </div>
      )}
    </div>
  );
};

const FastMovingReport = () => {
  const { t } = useTranslation();
  const data = useReport(() => reportFastMoving(), []);
  if (!data) return <Loading />;
  return (
    <div>
      <div className="row" style={{ margin: '1rem 0' }}>
        <span className="spacer" />
        <Button
          variant="ghost"
          onClick={() => downloadReportCsv('fast-moving', {}, 'fast-moving.csv')}
        >
          {t('reports.downloadCsv')}
        </Button>
        <ExportButtons
          disabled={!data}
          build={() => ({
            title: t('reports.fastMoving'),
            columns: [
              { header: t('reports.product'), key: 'name' },
              { header: t('reports.unitsSold'), key: 'units_sold' },
            ],
            rows: data ?? [],
            filename: 'fast-moving',
          })}
        />
      </div>
      {data.length === 0 ? (
        <EmptyState title={t('reports.noData')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('reports.product')}</th>
                <th className="right">{t('reports.unitsSold')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="right num">{p.units_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const DeadStockReport = () => {
  const { t } = useTranslation();
  const data = useReport(() => reportDeadStock(), []);
  if (!data) return <Loading />;
  return (
    <div>
      <div className="row" style={{ margin: '1rem 0' }}>
        <span className="spacer" />
        <Button
          variant="ghost"
          onClick={() => downloadReportCsv('dead-stock', {}, 'dead-stock.csv')}
        >
          {t('reports.downloadCsv')}
        </Button>
        <ExportButtons
          disabled={!data}
          build={() => ({
            title: t('reports.deadStock'),
            columns: [
              { header: t('reports.product'), key: 'name' },
              { header: t('reports.stock'), key: 'stock_qty' },
              { header: t('reports.lastSold'), key: 'last_sold' },
            ],
            rows: (data ?? []).map((p) => ({
              ...p,
              last_sold: p.last_sold_at ? formatDate(p.last_sold_at) : t('reports.never'),
            })),
            filename: 'dead-stock',
          })}
        />
      </div>
      {data.length === 0 ? (
        <EmptyState title={t('reports.noData')} />
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('reports.product')}</th>
                <th className="right">{t('reports.stock')}</th>
                <th>{t('reports.lastSold')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="right num">{p.stock_qty}</td>
                  <td className="muted num">
                    {p.last_sold_at ? formatDate(p.last_sold_at) : t('reports.never')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const ReportsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canProfit = ['shop_admin', 'manager'].includes(user?.role);
  const tabs = [
    { key: 'daily', el: DailyReport },
    { key: 'monthly', el: MonthlyReport },
    ...(canProfit ? [{ key: 'profit', el: ProfitReport }] : []),
    { key: 'fastMoving', el: FastMovingReport },
    { key: 'deadStock', el: DeadStockReport },
  ];
  const [tab, setTab] = useState('daily');
  const Active = tabs.find((x) => x.key === tab)?.el ?? DailyReport;

  return (
    <section>
      <div className="page-head">
        <h1>{t('reports.title')}</h1>
      </div>
      <div className="tabs">
        {tabs.map((x) => (
          <button
            key={x.key}
            className={`tab ${tab === x.key ? 'on' : ''}`}
            onClick={() => setTab(x.key)}
          >
            {t(`reports.${x.key}`)}
          </button>
        ))}
      </div>
      <Active />
    </section>
  );
};
