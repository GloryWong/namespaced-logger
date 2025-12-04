import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ENV_NAMESPACED_LOGGER_ENABLE, ENV_NAMESPACED_LOGGER_LEVEL } from '../src/constants.js'
import { createLogger } from '../src/index.js'

const { debugSpy, infoSpy, warnSpy, errorSpy } = vi.hoisted(() => ({
  debugSpy: vi.spyOn(globalThis.console, 'debug'),
  infoSpy: vi.spyOn(globalThis.console, 'info'),
  warnSpy: vi.spyOn(globalThis.console, 'warn'),
  errorSpy: vi.spyOn(globalThis.console, 'error'),
}))

beforeEach(() => {
  debugSpy.mockImplementation(vi.fn())
  infoSpy.mockImplementation(vi.fn())
  warnSpy.mockImplementation(vi.fn())
  errorSpy.mockImplementation(vi.fn())
})

afterEach(() => {
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

describe('transports', () => {
  beforeEach(() => {
    vi.stubEnv(ENV_NAMESPACED_LOGGER_ENABLE, 'test')
    vi.stubEnv(ENV_NAMESPACED_LOGGER_LEVEL, 'debug')
  })

  it('should run all transports by default', () => {
    const spyFn = vi.fn()
    const logger = createLogger('test', {
      transports: [{
        name: 'mock',
        enabled: true,
        level: 'debug',
        log({ namespace, level }) {
          spyFn(`${namespace} ${level}`)
        },
      }],
    })
    logger.debug('debug')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')
    expect(debugSpy).toHaveBeenCalledWith(expect.stringMatching(/test.+debug/))
    expect(spyFn).toHaveBeenCalledWith(expect.stringMatching(/test.+debug/))
    expect(infoSpy).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/test.+info/))
    expect(warnSpy).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/test.+warn/))
    expect(errorSpy).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/test.+error/))
  })

  it('should not run a built-in transport if it is disabled', () => {
    const spyFn = vi.fn()
    const logger = createLogger('test', {
      disableBuiltinTransports: ['console'],
      transports: [{
        name: 'mock',
        enabled: true,
        level: 'debug',
        log({ namespace, level }) {
          spyFn(`${namespace} ${level}`)
        },
      }],
    })
    logger.info('info')
    expect(infoSpy).not.toHaveBeenCalledWith(expect.stringMatching(/test.+info/))
    expect(spyFn).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/test.+info/))
  })
})

describe('environment variables control', () => {
  it('should not run transport when not enabled by env var', () => {
    const logger = createLogger('test')
    logger.info('info')
    expect(infoSpy).not.toHaveBeenCalledWith(expect.stringMatching(/test.+info/))
  })

  it('should run transport allowed namespaces when enabled by env var', () => {
    vi.stubEnv(ENV_NAMESPACED_LOGGER_ENABLE, 'test,test1')
    const logger = createLogger('test')
    logger.info('info')
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/test.+info/))

    const logger1 = createLogger('test1')
    logger1.info('info')
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/test1.+info/))

    const logger2 = createLogger('test2')
    logger2.info('info')
    expect(infoSpy).not.toHaveBeenCalledWith(expect.stringMatching(/test2.+info/))
  })

  it('should run transport with info level by default', () => {
    vi.stubEnv(ENV_NAMESPACED_LOGGER_ENABLE, 'test')
    const logger = createLogger('test')
    logger.debug('debug')
    logger.info('info')
    expect(debugSpy).not.toHaveBeenCalledWith(expect.stringMatching(/test.+debug/))
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/test.+info/))
  })

  it('should run transport with given level by env var', () => {
    vi.stubEnv(ENV_NAMESPACED_LOGGER_ENABLE, 'test')
    vi.stubEnv(ENV_NAMESPACED_LOGGER_LEVEL, 'warn')
    const logger = createLogger('test')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')
    expect(infoSpy).not.toHaveBeenCalledWith(expect.stringMatching(/test.+info/))
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/test.+warn/))
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/test.+error/))
  })

  it('should transport options override env var (enable and level)', () => {
    const spyFn = vi.fn()
    const logger = createLogger('test', {
      transports: [{
        name: 'mock',
        enabled: true,
        level: 'debug',
        log({ level }) {
          spyFn(`mock: ${level}`)
        },
      }],
    })
    logger.debug('debug')
    expect(spyFn).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/mock.+debug/))
  })
})

describe('child logger', () => {
  it('should run transport with namespace including child names', () => {
    vi.stubEnv(ENV_NAMESPACED_LOGGER_ENABLE, 'test')
    const logger = createLogger('test')
    const childLogger = logger.child('child')
    const grandchildLogger = childLogger.child('grandchild')
    logger.info('info')
    childLogger.info('info')
    grandchildLogger.info('info')
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/test.+info/))
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/test:child.+info/))
    expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/test:child:grandchild.+info/))
  })

  it('should run transport with namespace not including the child name if it is empty', () => {
    vi.stubEnv(ENV_NAMESPACED_LOGGER_ENABLE, 'test')
    createLogger('test').child('').info('info')
    expect(infoSpy).toHaveBeenCalledExactlyOnceWith(expect.stringMatching(/test.+info/))
  })
})
