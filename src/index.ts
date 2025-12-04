import type { LoggerOptions } from './logger.js'
import type { LogEvent, LogLevel, Transport } from './types.js'
import { Logger } from './logger.js'

/**
 * Create a new root logger with the given namespace.
 *
 * The root logger forms the top of a logger tree and may be used to
 * create child loggers with nested namespaces. Environment variables
 * such as `NAMESPACED_LOGGER_ENABLE` and `NAMESPACED_LOGGER_LEVEL` are consulted when
 * determining enabled state and minimum log level.
 *
 * @param namespace Namespace associated with the logger. Namespaces
 *                  are typically short strings like `"app"` or
 *                  `"app:server"`.
 * @param options   Optional configuration {@link LoggerOptions} for the logger.
 * @returns A root logger instance.
 */
export function createLogger(
  namespace: string,
  options?: LoggerOptions,
) {
  return new Logger(namespace, options)
}

export type {
  LogEvent,
  Logger,
  LoggerOptions,
  LogLevel,
  Transport,
}

export { isBrowser, isNodeLike } from './env.js'
export { formatTimestamp } from './formatTimestamp.js'
