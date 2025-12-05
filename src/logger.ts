import type { LogEvent, LogLevel, Transport } from './types.js'
import { BUILTIN_TRANSPORT_NAMES, LEVEL_ORDER } from './constants.js'
import { createConsoleTransport } from './createConsoleTransport.js'
import {
  detectEnabledNamespacesFromEnv,
  detectLevel,
} from './env.js'
import { formatArgs } from './formatArgs.js'
import { isNamespaceEnabledByEnv } from './isNamespaceEnabledByEnv.js'

export interface LoggerOptions {
  /**
   * Disable built-in transports. All built-ins are enabled by default.
   */
  disableBuiltinTransports?: Array<keyof typeof BUILTIN_TRANSPORT_NAMES>
  /**
   * Transports that should receive log events from this logger.
   * If omitted, a default console transport is installed.
   */
  transports?: Transport[]
}

interface LoggerConfig {
  transports: Transport[]
  enabledNamespaces: string[] | null
  enabledMinLevel: LogLevel
}

export class Logger {
  private readonly config: LoggerConfig

  constructor(
    private readonly namespace: string,
    options?: LoggerOptions,
    config?: LoggerConfig,
  ) {
    if (config) {
      this.config = config
      return
    }

    const disableBuiltinTransports = options?.disableBuiltinTransports ?? []
    const transports: Transport[] = []

    if (!disableBuiltinTransports.includes(BUILTIN_TRANSPORT_NAMES.console)) {
      transports.push(createConsoleTransport())
    }

    if (options?.transports) {
      transports.push(...options.transports)
    }

    this.config = {
      transports,
      enabledNamespaces: detectEnabledNamespacesFromEnv(),
      enabledMinLevel: detectLevel(),
    }
  }

  child(name: string): Logger {
    const trimmed = name.trim()
    const ns = trimmed ? `${this.namespace}:${trimmed}` : this.namespace

    return new Logger(ns, undefined, this.config)
  }

  private shouldLog(level: LogLevel, transport: Transport): boolean {
    if (transport.enabled !== undefined) {
      return transport.enabled
    }

    if (this.config.enabledNamespaces === null) {
      return false
    }

    return isNamespaceEnabledByEnv(this.namespace, this.config.enabledNamespaces) && (LEVEL_ORDER[level] >= LEVEL_ORDER[transport.level ?? this.config.enabledMinLevel])
  }

  private log(level: LogLevel, allArgs: unknown[]): void {
    if (allArgs.length === 0)
      return

    const [first, ...rest] = allArgs
    const { message, firstArg, placeholderArgs, restArgs } = formatArgs(first, rest)

    const event: LogEvent = {
      ts: new Date(),
      level,
      ns: this.namespace,
      msg: message,
      fArg: firstArg,
      pArgs: placeholderArgs,
      rArgs: restArgs,
    }

    for (const transport of this.config.transports) {
      try {
        if (this.shouldLog(level, transport)) {
          transport.log(event)
        }
      }
      catch {
        // Swallow transport errors to avoid impacting application flow.
      }
    }
  }

  debug(...args: unknown[]): void {
    this.log('debug', args)
  }

  info(...args: unknown[]): void {
    this.log('info', args)
  }

  warn(...args: unknown[]): void {
    this.log('warn', args)
  }

  error(...args: unknown[]): void {
    this.log('error', args)
  }
}
