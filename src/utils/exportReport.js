import { formatTZS } from './formatTZS.js';

// Excel/PDF writers are heavy and only the reports screen needs them, so they
// are dynamically imported on demand — they never load into the POS bundle.

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const cell = (row, col) => {
  const v = row[col.key];
  return col.money ? Number(v) || 0 : (v ?? '');
};

const withExt = (name, ext) => (name.endsWith(`.${ext}`) ? name : `${name}.${ext}`);

/**
 * Build a formatted .xlsx: title, optional summary lines, then a header row and
 * the data. `columns` is [{ header, key, money }]; money cells are real numbers
 * with a TZS number format. `meta` is [{ label, value }].
 */
export const exportExcel = async ({ title, meta = [], columns, rows, filename }) => {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Report');

  const titleRow = ws.addRow([title]);
  titleRow.font = { bold: true, size: 14 };
  ws.mergeCells(1, 1, 1, Math.max(columns.length, 2));

  meta.forEach(({ label, value }) => ws.addRow([label, value]));
  if (meta.length) ws.addRow([]);

  const header = ws.addRow(columns.map((c) => c.header));
  header.font = { bold: true };
  header.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFECE6' } };
  });

  rows.forEach((r) => {
    const row = ws.addRow(columns.map((c) => cell(r, c)));
    columns.forEach((c, i) => {
      if (c.money) row.getCell(i + 1).numFmt = '#,##0';
    });
  });

  columns.forEach((c, i) => {
    const width = Math.max(c.header.length + 2, c.money ? 14 : 18);
    ws.getColumn(i + 1).width = width;
  });

  const buf = await wb.xlsx.writeBuffer();
  triggerDownload(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    withExt(filename, 'xlsx')
  );
};

/** Build a print-ready PDF: title, summary lines, then a striped data table. */
export const exportPdf = async ({ title, meta = [], columns, rows, filename }) => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();

  doc.setFontSize(15);
  doc.text(title, 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(110);
  let y = 26;
  meta.forEach(({ label, value }) => {
    doc.text(`${label}: ${value}`, 14, y);
    y += 5;
  });
  doc.setTextColor(0);

  autoTable(doc, {
    startY: meta.length ? y + 2 : 24,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => (c.money ? formatTZS(r[c.key]) : (r[c.key] ?? '')))),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [12, 122, 94], textColor: 255 },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, { halign: c.money ? 'right' : 'left' }])
    ),
  });

  doc.save(withExt(filename, 'pdf'));
};
