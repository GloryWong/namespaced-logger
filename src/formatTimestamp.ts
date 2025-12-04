/**
 * Convert a date to the format `YYYY-MM-DD HH:MM:SS,mmm`
 */
export function formatTimestamp(date: Date) {
  const pad = (n: any, len = 2) => String(n).padStart(len, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // 0-based
  const day = pad(date.getDate())

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  const millis = pad(date.getMilliseconds(), 3)

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds},${millis}`
}
