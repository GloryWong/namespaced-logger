import type { LogLevel } from './types.js'
import { ENV_NAMESPACED_LOGGER_ENABLE, ENV_NAMESPACED_LOGGER_LEVEL } from './constants.js'

/**
 * Indicates whether the current runtime environment appears to be
 * a browser (i.e. `window` and `document` are defined).
 */
export const isBrowser
  = typeof window !== 'undefined' && typeof window.document !== 'undefined'

/**
 * Indicates whether the current runtime environment appears to be
 * Node-like (i.e. `process` and `process.stdout` are defined).
 */
export const isNodeLike
  = typeof process !== 'undefined' && typeof process.stdout !== 'undefined'

/**
 * Read a configuration string from either browser storage or
 * environment variables.
 *
 * Precedence:
 * 1. `window.localStorage[key]` when running in a browser.
 * 2. `process.env[key]` when running in a Node-like environment.
 *
 * @param key Name of the configuration variable to read.
 * @returns The string value when found, `null` when explicitly not
 *          present, or `undefined` when reading fails unexpectedly.
 */
export function readConfigString(key: string): string | null | undefined {
  let value: string | null | undefined

  if (isBrowser) {
    try {
      value = window.localStorage.getItem(key)
    }
    catch {
      // Ignore storage access issues (e.g. privacy mode).
    }
  }

  if (!value && typeof process !== 'undefined' && process.env) {
    value = process.env[key] ?? null
  }

  return value
}

/**
 * Determine the minimum log level from the `NAMESPACED_LOGGER_LEVEL`
 * configuration variable, falling back to a default when absent
 * or invalid.
 *
 * @param defaultLevel Level to use when `NAMESPACED_LOGGER_LEVEL` is not set
 *                     or does not contain a recognized value.
 * @returns A valid `LogLevel` string.
 */
export function detectLevel(defaultLevel: LogLevel = 'info'): LogLevel {
  const raw = readConfigString(ENV_NAMESPACED_LOGGER_LEVEL)
  if (!raw)
    return defaultLevel

  const lower = raw.toLowerCase() as LogLevel
  if (['debug', 'info', 'warn', 'error'].includes(lower)) {
    return lower
  }

  return defaultLevel
}

/**
 * Read enabled namespaces from the `NAMESPACED_LOGGER_ENABLE` configuration
 * variable.
 *
 * Semantics:
 * - Returns `null` when `NAMESPACED_LOGGER_ENABLE` is not defined at all,
 *   indicating that no environment override is in effect.
 * - Returns an empty array when the variable is defined but empty,
 *   indicating that all namespaces are disabled.
 * - Returns a list of namespace roots when the value contains one
 *   or more comma-separated entries (e.g. `"app,api"`).
 *
 * A special value `"*"` in the list indicates that all namespaces
 * are enabled.
 *
 * @returns `null` when no override is present, an empty array when
 *          all namespaces are disabled, or a non-empty array of
 *          enabled namespace roots.
 */
export function detectEnabledNamespacesFromEnv(): string[] | null {
  const raw = readConfigString(ENV_NAMESPACED_LOGGER_ENABLE)
  if (raw == null)
    return null

  if (!raw.trim())
    return []

  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}
