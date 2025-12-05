<h1 align="center">Welcome to namespaced-logger 👋</h1>

![GitHub License](https://img.shields.io/github/license/GloryWong/namespaced-logger)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/GloryWong/namespaced-logger)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/GloryWong/namespaced-logger/release.yml)
![GitHub Release](https://img.shields.io/github/v/release/GloryWong/namespaced-logger)
![GitHub Release Date](https://img.shields.io/github/release-date/GloryWong/namespaced-logger)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/GloryWong/namespaced-logger)
![GitHub watchers](https://img.shields.io/github/watchers/GloryWong/namespaced-logger)
![GitHub forks](https://img.shields.io/github/forks/GloryWong/namespaced-logger)
![GitHub Repo stars](https://img.shields.io/github/stars/GloryWong/namespaced-logger)
![NPM Version](https://img.shields.io/npm/v/namespaced-logger)
![NPM Type Definitions](https://img.shields.io/npm/types/namespaced-logger)
![NPM Downloads](https://img.shields.io/npm/dw/namespaced-logger)
![Node Current](https://img.shields.io/node/v/namespaced-logger)

Small, clean, zero-dependency, namespace-aware logger with env-based enablement and pluggable transports.

`namespaced-logger` is inspired by tools like `debug` and `pino`, but keeps things intentionally simple:

- **Namespaced loggers** – create loggers with namespaces and unlimited nested child loggers (`"app"`, `"app:db"`, `"worker:queue"`, …).
- **Popular runtimes support** – works in `Node.js`, `Deno`, `Bun`, and modern `browsers`.
- **Environment Variable-based control** – enable/disable loggers via `NAMESPACED_LOGGER_ENABLE` and set level via `NAMESPACED_LOGGER_LEVEL`.
- **Multiple log levels** – `debug`, `info`, `warn`, `error`.
- **Pluggable transports** – built‑in `console` transport, plus custom transports support.
- **Colorized output for Console** – human‑friendly colors in TTYs, plain text when not.
- **ESM‑first** – designed for modern JavaScript/TypeScript projects.
- **TypeScript types included** – written in TS entirely, with types included.
- **Zero dependencies** – no runtime dependencies, tiny bundle size.

---

## Installation

```bash
npm install namespaced-logger
# or
pnpm add namespaced-logger
# or
yarn add namespaced-logger
```

## Quick start

```ts
import { createLogger } from 'namespaced-logger'

const log = createLogger('app')
log.info('App initialized!')

const serverLog = log.child('server')
serverLog.info('server starting on port %d', 3000)
serverLog.warn('deprecated option %s used', '--foo')
serverLog.error('unexpected error: %j', { code: 'E_FAIL', retry: false })

const dbLog = log.child('db')
dbLog.debug('connecting to database at %s', 'localhost:5432')
dbLog.info('database connected')
```

Example output (colors in a TTY; simplified here):

```text
02:03:15.345 INFO  app - App initialized!
02:03:15.346 INFO  app:server - server starting on port 3000
02:03:15.347 WARN  app:server - deprecated option --foo used
02:03:15.348 ERROR app:server - unexpected error: {"code":"E_FAIL","retry":false}
02:03:15.349 DEBUG app:db - connecting to database at localhost:5432
02:03:15.350 INFO  app:db - database connected
```

## API

### `createLogger(namespace: string, options?: Options): Logger`

Create a namespaced logger instance.

* `namespace`: The namespace for the logger (e.g., `"app"`).
* `options` (optional): Configuration options for the logger.
  - `transports` (optional): Array of personalized transports to use.
  - `disableBuiltinTransports` (optional): Array of built-in transport names to disable. For example, `['console']` disables the built-in console transport.

A `Logger` instance exposes:

- `log.info(message: unknown, ...args: unknown[]): void`
- `log.warn(message: unknown, ...args: unknown[]): void`
- `log.error(message: unknown, ...args: unknown[]): void`
- `log.debug(message: unknown, ...args: unknown[]): void`
- `log.child(name: string): Logger` – create a child logger with an extended namespace. A child logger inherits the parent's configuration and can have its own child.

## Message formatting

`namespaced-logger` supports basic printf-style formatting:
- `%s` - String
- `%d` - Number
- `%j` - JSON-stringify the next argument.
- `%%` – escaped percent sign (literal %)

Any extra arguments that are not consumed by placeholders in the first argument are preserved.
When the first argument is not a string, it’s converted to a string, and all other arguments are preserved as extra arguments. In console, extra arguments are logged as they are after the formatted message.:

```ts
log.info('User %s logged in from %s', 'alice', '192.168.1.1')
log.debug('Processing data: %j', { id: 123, value: 'test' })
log.warn('Disk space low: %d%% remaining', 5)
log.error('Unexpected error occurred: %s', 'Connection timed out')
log.info('Server started on port %d', 8080)
log.info('Simple message without formatting')
log.info('Show %s', 'data', { event: 'user_login', user: 'alice' }) // Extra args preserved and logged as it is in console
log.info({ event: 'user_login', user: 'alice' }, 'alice') // first arg not string
```

Example output:

```text
02:03:15.345 INFO  app - User alice logged in from 192.168.1.1
02:03:15.346 DEBUG app - Processing data: {"id":123,"value":"test"}
02:03:15.347 WARN  app - Disk space low: 5% remaining
02:03:15.348 ERROR app - Unexpected error occurred: Connection timed out
02:03:15.349 INFO  app - Server started on port 8080
02:03:15.350 INFO  app - Simple message without formatting
02:03:15.351 INFO  app - Show data { event: 'user_login', user: 'alice' }
02:03:15.351 INFO  app - [object Object] alice
```

## Colors

When process.stdout.isTTY is true (running in a real terminal), namespaced-logger uses ANSI colors to colorize log levels for better readability:
- `DEBUG` - Cyan
- `INFO` - Green
- `WARN` - Yellow
- `ERROR` - Red

In non‑TTY environments (piped to a file, many CI systems, etc.), colors are automatically disabled so logs stay clean and parseable.

## Log enabling and levels

> Environment variables `NAMESPACED_LOGGER_ENABLE` and `NAMESPACED_LOGGER_LEVEL` can be used to control which namespace loggers are enabled and the minimum log level.

### Environment Variable Set

* Browser
  ```js
  localStorage.setItem('NAMESPACED_LOGGER_ENABLE', 'app')
  localStorage.setItem('NAMESPACED_LOGGER_LEVEL', 'debug')
  ```

* Node.js / Deno / Bun
  ```bash
  export NAMESPACED_LOGGER_ENABLE='app'
  export NAMESPACED_LOGGER_LEVEL='debug'
  ```

### Namespace enabling

You can control which loggers are enabled via the `NAMESPACED_LOGGER_ENABLE` environment variable. It supports glob-style patterns to match namespaces:
- `'*'` enables loggers of all namespaces.
- `''` (empty string) disables all loggers.
- `'app1,app2'` enables loggers for the specified namespaces app1 and app2 only.

### Log levels
You can set the minimum log level via the `NAMESPACED_LOGGER_LEVEL` environment variable. Supported levels are:
- `debug`: all log messages are shown.
- `info`: only `info`, `warn`, and `error` messages are shown.
- `warn`: only `warn` and `error` messages are shown.
- `error`: only `error` messages are shown.

> Default level is `info` if not set.

## Error logging

You can log errors directly:
```ts
try {
  await doWork()
}
catch (err) {
  log.error('work failed: %s', (err as Error).message, err)
}
```

Because extra arguments are preserved, you typically get:
- a readable message (work failed: <message>)
- the full Error object (with stack) available as an extra argument for inspection or log collection

## Pluggable transports

You can create custom transports by providing a `log` function in the transport configuration:

```ts
import { createLogger } from 'namespaced-logger'

const log = createLogger('app', {
  transports: [{
    name: 'customTransport',
    enable: true, // Override environment variable NAMESPACED_LOGGER_ENABLE
    level: 'debug', // Override environment variable NAMESPACED_LOGGER_LEVEL
    log: (event: LogEvent) => {
      // Custom transport logic here
      // e.g., send logs to a remote server
    }
  }]
})
```

## Contributing

Contributions are welcome! If you have ideas, bug fixes, or improvements, please open an issue or submit a pull request on the
[GitHub repository](https://github.com/GloryWong/namespaced-logger).

Give a ⭐️ if this project helped you!

## License

This project is licensed under the MIT License. See the LICENSE file for more
details.
