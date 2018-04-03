import config from 'config'

const logLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error'
]

const Logger = {
  shouldLog(method) {
    if (logLevels.indexOf(method) > -1) {
      return logLevels.indexOf(config.logger.level) <= logLevels.indexOf(method)
    } else {
      return true
    }
  },

  consoleMethodDefined(method) {
    /* eslint-disable no-console */
    return typeof console !== 'undefined'
      && console !== null
      && typeof console[method] !== 'undefined'
      && typeof console[method].apply !== 'undefined'
    /* eslint-enable no-console */
  },

  writeLogs(method, args) {
    /* eslint-disable no-console */
    if (Logger.shouldLog(method) && Logger.consoleMethodDefined(method)) {
      console[method].apply(console, args)
    }
    /* eslint-enable no-console */
  },

  log() {
    Logger.writeLogs('log', arguments)
  },

  debug() {
    Logger.writeLogs('debug', arguments)
  },

  error() {
    Logger.writeLogs('error', arguments)
  },

  warn() {
    Logger.writeLogs('warn', arguments)
  },

  info() {
    Logger.writeLogs('info', arguments)
  },

  time() {
    Logger.writeLogs('time', arguments)
  },

  timeEnd() {
    Logger.writeLogs('timeEnd', arguments)
  }

}

export default Logger
