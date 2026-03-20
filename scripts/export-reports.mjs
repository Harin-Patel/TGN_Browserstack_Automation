/**
 * Converts reports/client-test-matrix.csv → .xlsx and .pdf
 * Usage: node scripts/export-reports.mjs [path/to/file.csv]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DEFAULT_CSV = path.join(ROOT, 'reports', 'client-test-matrix.csv')

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function csvToRows(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8')
  return parse(text, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  })
}

function writeXlsx(rows, xlsxPath) {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const colWidths = (rows[0] || []).map((_, colIdx) => {
    let max = 10
    for (const row of rows) {
      const cell = row[colIdx]
      if (cell != null) max = Math.max(max, String(cell).length)
    }
    return { wch: Math.min(max + 2, 60) }
  })
  ws['!cols'] = colWidths
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Test Matrix')
  XLSX.writeFile(wb, xlsxPath)
}

async function writePdf(rows, pdfPath) {
  const [header, ...body] = rows.length ? rows : [[]]
  let table = '<thead><tr>'
  for (const h of header) {
    table += `<th>${escapeHtml(h)}</th>`
  }
  table += '</tr></thead><tbody>'
  for (const row of body) {
    table += '<tr>'
    for (let i = 0; i < header.length; i++) {
      table += `<td>${escapeHtml(row[i] ?? '')}</td>`
    }
    table += '</tr>'
  }
  table += '</tbody>'

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  body { font-family: system-ui, Segoe UI, Helvetica, Arial, sans-serif; font-size: 9px; color: #111; }
  h1 { font-size: 14px; margin: 0 0 12px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; text-align: left; word-break: break-word; }
  th { background: #f0f4f8; font-weight: 600; }
  tr:nth-child(even) td { background: #fafafa; }
</style></head><body>
<h1>TGN E2E — Client test matrix</h1>
<table>${table}</table>
</body></html>`

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'load' })
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
      printBackground: true,
    })
  } finally {
    await browser.close()
  }
}

async function main() {
  const csvPath = path.resolve(process.argv[2] || DEFAULT_CSV)
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`)
    console.error('Run npm run test:report first, or pass a path to client-test-matrix.csv')
    process.exit(1)
  }

  const base = csvPath.replace(/\.csv$/i, '')
  const xlsxPath = `${base}.xlsx`
  const pdfPath = `${base}.pdf`

  const rows = csvToRows(csvPath)
  if (!rows.length) {
    console.error('CSV is empty.')
    process.exit(1)
  }

  writeXlsx(rows, xlsxPath)
  console.log(`Wrote ${xlsxPath}`)

  await writePdf(rows, pdfPath)
  console.log(`Wrote ${pdfPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
