import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { exportExcel, exportPdf } from '../../utils/exportReport.js';

/**
 * Excel + PDF export for a report section. `build()` returns the export config
 * ({ title, meta, columns, rows, filename }) from the data already on screen,
 * so nothing is re-fetched. Writers are lazy-imported inside exportReport.
 */
export const ExportButtons = ({ build, disabled }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [busy, setBusy] = useState('');

  const run = async (kind, fn) => {
    setBusy(kind);
    try {
      const cfg = build();
      if (!cfg.rows || cfg.rows.length === 0) {
        toast(t('reports.nothingToExport'), 'err');
        return;
      }
      await fn(cfg);
    } catch {
      toast(t('reports.exportFailed'), 'err');
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <Button variant="ghost" disabled={disabled || !!busy} onClick={() => run('xlsx', exportExcel)}>
        {busy === 'xlsx' ? t('reports.exporting') : t('reports.downloadExcel')}
      </Button>
      <Button variant="ghost" disabled={disabled || !!busy} onClick={() => run('pdf', exportPdf)}>
        {busy === 'pdf' ? t('reports.exporting') : t('reports.downloadPdf')}
      </Button>
    </>
  );
};
