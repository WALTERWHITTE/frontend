export function downloadCSV(filename, rows) {
  if (!rows || rows.length === 0) {
    alert("No data to export.");
    return;
  }

  const replacer = (key, value) => (value === null ? '' : value);
  const header = Object.keys(rows[0]);

  const csv = [
    header.join(','), 
    ...rows.map(row => header.map(fieldName => 
      JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
