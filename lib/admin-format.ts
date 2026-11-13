// Fixed-time-zone formatters so server and browser render identical text
const dt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Toronto', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
})
const d = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', month: 'short', day: 'numeric', year: 'numeric' })

/** "Oct 24, 2026 8:29 PM" */
export const fmtDateTime = (iso?: string | null) => (iso ? dt.format(new Date(iso)).replace(/, (\d{1,2}:\d{2})/, ' $1') : '-')
/** "Oct 24, 2026" */
export const fmtDate = (iso?: string | null) => (iso ? d.format(new Date(iso)) : '-')
