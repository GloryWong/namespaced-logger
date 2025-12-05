/**
 * Represents the log level of a message.
 *
 * Log levels are ordered as:
 * - "debug" (lowest)
 * - "info"
 * - "warn"
 * - "error" (highest)
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Represents a fully-structured log event that has been accepted
 * for emission by a logger.
 *
 * Transports receive this structure and can decide how to persist,
 * display, or forward the event.
 */
export interface LogEvent {
  /**
   * Timestamp at which the log event was created.
   */
  ts: Date

  /**
   * Log level of the event.
   */
  level: LogLevel

  /**
   * Namespace of the logger that emitted the event. Namespaces are
   * hierarchical, e.g. "app:db:queries".
   */
  ns: string

  /**
   * Formatted message string produced by placeholder substitution
   * over the original arguments.
   */
  msg: string

  /**
   * Arguments that were substituted into the message.
   */
  pArgs: unknown[]

  /**
   * Remaining arguments that were not substituted into the message.
   * These are useful for transports that want to preserve full
   * structured context, stack traces, or additional metadata.
   */
  rArgs: unknown[]
}

/**
 * Describes a transport that can receive and handle log events.
 *
 * A transport could write to the console, store events in memory
 * for testing, send them over the network, or perform any other
 * custom behavior.
 */
export interface Transport {
  /**
   * Unique name
   */
  name: string

  /**
   * Handle a single log event.
   *
   * Implementations should avoid throwing whenever possible; any
   * errors thrown by transports are caught and ignored by the logger.
   *
   * @param event Log event containing structured information about
   *              the message that was emitted.
   */
  log: (event: LogEvent) => void

  /**
   * Set this to override the environment variable NAMESPACED_LOGGER_ENABLE.
   */
  enabled?: boolean

  /**
   * Set this to override the environment variable NAMESPACED_LOGGER_LEVEL.
   */
  level?: LogLevel
}
