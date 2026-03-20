/**
 * Reads reports/playwright-results.json (Playwright JSON reporter) and writes:
 * - reports/client-test-matrix.csv — client-style matrix (ID, Category, Scenario, …)
 * - reports/e2e-run-cover.md — run summary for email / PDF cover
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const REPORTS = path.join(ROOT, 'reports')
const JSON_PATH = path.join(REPORTS, 'playwright-results.json')
const CSV_PATH = path.join(REPORTS, 'client-test-matrix.csv')
const COVER_PATH = path.join(REPORTS, 'e2e-run-cover.md')

const BASE_URL = process.env.E2E_BASE_URL || 'https://tgn-staging.staffbot.com/'

function escapeCsv(value) {
  if (value === null || value === undefined) return '""'
  const s = String(value)
  return `"${s.replace(/"/g, '""')}"`
}

function categoryFromFile(filePath) {
  const norm = filePath.replace(/\\/g, '/').toLowerCase()
  if (norm.startsWith('auth/') || norm.includes('/auth/')) return 'Authentication'
  if (norm.startsWith('jobs/') || norm.includes('/jobs/')) return 'Jobs'
  if (norm.startsWith('profile/') || norm.includes('/profile/')) return 'Profile'
  if (norm.startsWith('dashboard/') || norm.includes('/dashboard/')) return 'Marketing / Home & hub'
  return 'Other'
}

function collectRows(suite, describeStack, rows) {
  const stack =
    suite.line > 0 && suite.title ? [...describeStack, suite.title] : [...describeStack]

  for (const spec of suite.specs || []) {
    for (const t of spec.tests || []) {
      const scenario = [...stack, spec.title].filter(Boolean).join(' — ')
      rows.push({
        file: spec.file,
        line: spec.line,
        scenario,
        test: t,
      })
    }
  }
  for (const child of suite.suites || []) {
    collectRows(child, stack, rows)
  }
}

function mapStatus(test) {
  switch (test.status) {
    case 'expected':
      return 'pass'
    case 'unexpected':
      return 'fail'
    case 'flaky':
      return 'flaky'
    case 'skipped':
      return 'skip'
    default: {
      const last = test.results?.at(-1)
      if (!last) return 'fail'
      if (last.status === 'passed') return 'pass'
      if (last.status === 'skipped') return 'skip'
      return 'fail'
    }
  }
}

function durationSeconds(test) {
  const ms = test.results?.reduce((acc, r) => acc + (r.duration || 0), 0) ?? 0
  if (!ms) return test.results?.at(-1)?.duration != null ? (test.results.at(-1).duration / 1000).toFixed(1) : '—'
  return (ms / 1000).toFixed(1)
}

function errorFirstLine(test) {
  const results = test.results || []
  for (let i = results.length - 1; i >= 0; i--) {
    const r = results[i]
    const msg = r.error?.message || r.errors?.[0]?.message
    if (msg) return String(msg).split('\n')[0].trim()
  }
  return ''
}

function main() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Missing ${JSON_PATH} — run Playwright with JSON reporter first.`)
    process.exit(1)
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf8')
  const data = JSON.parse(raw)

  const rows = []
  for (const suite of data.suites || []) {
    collectRows(suite, [], rows)
  }

  rows.sort((a, b) => {
    const fa = a.file || ''
    const fb = b.file || ''
    if (fa !== fb) return fa.localeCompare(fb)
    return (a.line || 0) - (b.line || 0)
  })

  const header = ['ID', 'Category', 'Scenario', 'Route / Setup', 'Expected Result', 'Status', 'Notes']

  const csvLines = [header.map(escapeCsv).join(',')]

  rows.forEach((row, i) => {
    const id = `TGN-${String(i + 1).padStart(3, '0')}`
    const rel = row.file ? path.join('tests', row.file).replace(/\\/g, '/') : ''
    const category = categoryFromFile(row.file || '')
    const scenario = row.scenario
    const routeSetup = `Staging ${BASE_URL.trim()}; ${rel}:${row.line || 0}`
    const expected =
      'Automated assertions — see Playwright HTML report (`playwright-report/index.html`)'
    const status = mapStatus(row.test)
    let notes = `Playwright ${rel}:${row.line || 0}; duration: ${durationSeconds(row.test)}s`
    const err = errorFirstLine(row.test)
    if (status === 'fail' && err) notes += `; Error: ${err}`

    csvLines.push(
      [id, category, scenario, routeSetup, expected, status, notes].map(escapeCsv).join(',')
    )
  })

  fs.mkdirSync(REPORTS, { recursive: true })
  fs.writeFileSync(CSV_PATH, csvLines.join('\n') + '\n', 'utf8')

  const stats = data.stats || {}
  const started = stats.startTime || '—'
  const durSec = stats.duration != null ? (stats.duration / 1000).toFixed(1) : '—'
  const pwVer = data.config?.version || '—'
  const browserstack = process.env.BROWSERSTACK_BUILD_URL || process.env.BUILD_URL || ''

  const cover = `# E2E run summary (TGN)

- **Generated (UTC):** ${new Date().toISOString()}
- **Target:** ${BASE_URL.trim()}
- **Playwright:** ${pwVer}
- **Results JSON:** \`reports/playwright-results.json\`
- **Client matrix (CSV):** \`reports/client-test-matrix.csv\`
- **Excel / PDF:** run \`npm run reports:export\` → \`reports/client-test-matrix.xlsx\` and \`.pdf\`
- **HTML report:** \`playwright-report/index.html\` (run \`npx playwright show-report\`)

## Counts

| Metric | Value |
|--------|------:|
| Passed (expected) | ${stats.expected ?? '—'} |
| Failed (unexpected) | ${stats.unexpected ?? '—'} |
| Skipped | ${stats.skipped ?? '—'} |
| Flaky | ${stats.flaky ?? '—'} |
| Run start (from report) | ${started} |
| Wall duration (s) | ${durSec} |
| Rows in matrix | ${rows.length} |

${browserstack ? `**BrowserStack build:** ${browserstack}\n` : ''}
Share **\`client-test-matrix.csv\`**, or **\`.xlsx\` / \`.pdf\`** after \`npm run reports:export\`, matching the client reference matrix layout.
`

  fs.writeFileSync(COVER_PATH, cover, 'utf8')

  console.log(`Wrote ${CSV_PATH}`)
  console.log(`Wrote ${COVER_PATH}`)
}

main()
