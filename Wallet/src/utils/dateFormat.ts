/**
 * Format date to MM/DD/YY (no time)
 */
export function formatDateMMDDYY(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return ''
  const d = typeof dateStr === 'string' ? new Date(dateStr.replace(' ', 'T')) : dateStr
  if (isNaN(d.getTime())) return String(dateStr)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const y = String(d.getFullYear()).slice(-2)
  return `${m}/${day}/${y}`
}
