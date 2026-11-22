/**
 * Excel / CSV Utility for Ohda ERP & Workshop Management
 * Provides UTF-8 BOM CSV generation (natively opens in Excel with Arabic RTL support)
 * and CSV parsing for bulk imports.
 */

export function exportToExcelCsv(filename, columns, data) {
  if (!data || !Array.isArray(data)) return;

  // UTF-8 BOM for Microsoft Excel Arabic compatibility
  let csvContent = "\uFEFF";

  // Headers row
  const headerLabels = columns.map(col => `"${(col.label || col.header || col.key).replace(/"/g, '""')}"`);
  csvContent += headerLabels.join(",") + "\r\n";

  // Data rows
  data.forEach(item => {
    const rowValues = columns.map(col => {
      let val = item[col.key || col.field];
      if (typeof col.formatter === "function") {
        val = col.formatter(val, item);
      }
      if (val === null || val === undefined) {
        val = "";
      }
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvContent += rowValues.join(",") + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const safeFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTemplateCsv(filename, columns, sampleRows = []) {
  exportToExcelCsv(filename, columns, sampleRows);
}

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("الملف غير موجود"));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          return resolve({ headers: [], rows: [] });
        }

        // Helper to parse CSV line taking quotes into account
        const parseLine = (line) => {
          const values = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          return values;
        };

        const headers = parseLine(lines[0]);
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const rowValues = parseLine(lines[i]);
          if (rowValues.length > 0 && rowValues.some(v => v.length > 0)) {
            const rowObj = {};
            headers.forEach((h, hIdx) => {
              rowObj[h] = rowValues[hIdx] || "";
            });
            rows.push(rowObj);
          }
        }

        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file, "UTF-8");
  });
}
