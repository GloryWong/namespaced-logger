export interface FormatTimestampOptions {
  /** Whether to wrap the date in square brackets. Default: false */
  includeDate?: boolean
}

/**
 * Convert a date to the format `HH:MM:SS.mmm`
 * or `YYYY-MM-DD HH:MM:SS.mmm` if `includeDate` is true.
 *
 * @param date Date to format.
 * @param options Formatting {@link FormatTimestampOptions | options}.
 * @returns Formatted timestamp string.
 */
export function formatTimestamp(date: Date, options: FormatTimestampOptions = {}): string {
  const { includeDate = false } = options
  const pad = (n: any, len = 2) => String(n).padStart(len, '0')

  let dateStr = ''
  if (includeDate) {
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1) // 0-based
    const day = pad(date.getDate())
    dateStr = `${year}-${month}-${day} `
  }

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  const millis = pad(date.getMilliseconds(), 3)

  return `${dateStr}${hours}:${minutes}:${seconds}.${millis}`
}
