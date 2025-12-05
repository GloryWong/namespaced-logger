/**
 * Perform minimal printf-style placeholder substitution for log
 * messages while preserving any unused arguments.
 *
 * Supported tokens:
 * - `%s`: Convert the next argument to a string.
 * - `%d`: Convert the next argument to a number and then string.
 * - `%o`: JSON-stringify the next argument.
 * - `%%`: Escaped percent sign, results in a literal `%`.
 *
 * Any extra arguments that are not consumed by placeholders are
 * returned separately in `restArgs` and can be forwarded to console
 * or other transports for richer inspection.
 *
 * @param first First argument passed to a log method, potentially a
 *              format string.
 * @param rest  Remaining arguments.
 * @returns An object containing the formatted message and any
 *          leftover raw arguments.
 */
export function formatArgs(
  first: unknown,
  rest: unknown[],
): { message: string, firstArg: unknown, placeholderArgs: unknown[], restArgs: unknown[] } {
  if (typeof first !== 'string') {
    return {
      message: String(first),
      firstArg: first,
      placeholderArgs: [],
      restArgs: rest,
    }
  }

  let idx = 0

  const str = first.replace(/%[sdjo%]/g, (token) => {
    if (token === '%%') {
      return '%'
    }

    const arg = rest[idx++]

    switch (token) {
      case '%s':
        return String(arg)
      case '%d':
        return typeof arg === 'number' ? String(arg) : Number(arg).toString()
      case '%o':
        try {
          return JSON.stringify(arg)
        }
        catch {
          return '[Circular]'
        }
      default:
        return token
    }
  })

  return {
    message: str,
    firstArg: first,
    placeholderArgs: rest.slice(0, idx),
    restArgs: idx >= rest.length ? [] : rest.slice(idx),
  }
}
