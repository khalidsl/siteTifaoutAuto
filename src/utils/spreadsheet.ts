import ExcelJS from 'exceljs';

const csvCell = (value: unknown): string => {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const downloadExcel = async (rows: Record<string, unknown>[], filename: string): Promise<void> => {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TIFAOUT AUTO';
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet('Export');

  worksheet.columns = headers.map(header => {
    const longest = Math.max(header.length, ...rows.map(row => String(row[header] ?? '').length));
    return { header, key: header, width: Math.min(Math.max(longest + 2, 14), 48) };
  });

  rows.forEach(row => worksheet.addRow(headers.map(header => row[header] ?? '')));
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + headers.length)}${rows.length + 1}` };

  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF123B63' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'thick', color: { argb: 'FF0B2440' } } };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 24;
    row.eachCell((cell, columnNumber) => {
      const header = headers[columnNumber - 1].toLowerCase();
      cell.font = { name: 'Arial', color: { argb: 'FF172B4D' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
      if (rowNumber % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF2F8' } };
      }
      if (header.includes('mad') && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00 [$MAD-3]';
        cell.font = { name: 'Arial', bold: true, color: { argb: 'FF0B5D3B' } };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
};

export const parseCsv = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const headers = (rows.shift() || []).map(header => header.trim());
  return rows.filter(values => values.some(Boolean)).map(values => Object.fromEntries(
    headers.map((header, index) => [header, values[index] || ''])
  ));
};
