/* eslint-disable no-console */
import type { LogEvent, LogLevel, Transport } from './types.js'
import { BUILTIN_TRANSPORT_NAMES } from './constants.js'
import { isBrowser, isNodeLike } from './env.js'
import { formatTimestamp } from './formatTimestamp.js'

/**
 * Create a console-based transport that writes log events to the
 * global console object.
 *
 * The transport formats each event into a single line prefix
 * incorporating timestamp, level, and namespace, followed by the
 * message and any remaining raw arguments.
 *
 * @returns A transport that logs events to the console.
 */
export function createConsoleTransport(): Transport {
  const levelColorsNode: Record<LogLevel, string> = {
    debug: '\x1B[90m', // gray
    info: '\x1B[36m', // cyan
    warn: '\x1B[33m', // yellow
    error: '\x1B[31m', // red
  }
  const boldNode = '\x1B[1m'
  const resetNode = '\x1B[0m'

  const levelColorsBrowser: Record<LogLevel, string> = {
    debug: 'color: gray;',
    info: 'color: #0ea5e9;', // sky-500
    warn: 'color: #facc15;', // yellow-400
    error: 'color: #ef4444;', // red-500
  }

  return {
    name: BUILTIN_TRANSPORT_NAMES.console,
    log(event: LogEvent): void {
      const { level, ns, msg, rArgs, ts } = event
      const timeStr = formatTimestamp(ts)

      const consoleFn = (...data: any[]) => {
        console[level](...data)
      }

      const levelFormatted = level.toUpperCase().padEnd(5, ' ')

      if (isBrowser) {
        const prefix
          = `%c${timeStr} %c${levelFormatted} %c${ns} %c- %c${msg}`
        const args: any[] = [
          prefix,
          'color: gray;',
          levelColorsBrowser[level],
          'color: inherit; font-weight: bold;',
          'color: gray;',
          'color: inherit;',
          ...rArgs,
        ]

        consoleFn(...args)
      }
      else if (isNodeLike) {
        const lvlColor = levelColorsNode[level]
        const grayColor = '\x1B[90m'

        const prefix = `${grayColor}${timeStr}${resetNode} ${lvlColor}${levelFormatted}${resetNode} ${boldNode}${ns}${resetNode} ${grayColor}-${resetNode} ${msg}`

        consoleFn(prefix, ...rArgs)
      }
      else {
        consoleFn(
          `${timeStr} ${levelFormatted} ${ns} - ${msg}`,
          ...rArgs,
        )
      }
    },
  }
}
