import type { LogLevel } from './types.js'

/**
 * Numerical ordering of log levels used for comparison and filtering.
 *
 * Higher numeric values represent more severe log levels.
 */
export const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

export const BUILTIN_TRANSPORT_NAMES = {
  console: 'builtin-console',
} as const

export const ENV_NAMESPACED_LOGGER_LEVEL = 'NAMESPACED_LOGGER_LEVEL'
export const ENV_NAMESPACED_LOGGER_ENABLE = 'NAMESPACED_LOGGER_ENABLE'
