function parseIsoParts(iso: string) {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)

  if (!match) return null

  const [, year, month, day, hour, minute] = match
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour,
    minute,
  }
}

export function formatIsoTime(iso: string) {
  const parts = parseIsoParts(iso)
  if (!parts) return iso
  return `${parts.hour}:${parts.minute}`
}

export function formatIsoDate(iso: string) {
  const parts = parseIsoParts(iso)
  if (!parts) return iso
  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${String(parts.year).slice(-2)}`
}

export function formatIsoDateTime(iso: string) {
  return `${formatIsoDate(iso)}, ${formatIsoTime(iso)}`
}

export function formatIsoDateMonthShort(iso: string) {
  const parts = parseIsoParts(iso)
  if (!parts) return iso

  const date = new Date(parts.year, parts.month - 1, parts.day, 12)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatIsoDateLong(iso: string) {
  const parts = parseIsoParts(iso)
  if (!parts) return iso

  const date = new Date(parts.year, parts.month - 1, parts.day, 12)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

export function isoDateKey(iso: string) {
  return iso.slice(0, 10)
}

export function compareIsoDateTime(a: string, b: string) {
  return a.localeCompare(b)
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
