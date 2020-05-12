require('dotenv/config')
const path = require('path')
const { createLogger: CreateLogger, format, transports: { File, Console } } = require('winston')

const options = {
  errorFile: {
    level: 'error',
    filename: path.join(__dirname, '../../logs/errors.log'),
    handleRejections: true,
    handleExceptions: true,
    defaultMeta: { service: 'trello_api_back_end' },
    format: format.combine(
      format.json()
    )
  },
  infoFile: {
    level: 'info',
    filename: path.join(__dirname, '../../logs/info.log'),
    defaultMeta: { service: 'trello_api_back_end' },
    format: format.combine(
      format.json()
    )
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    handleRejections: true,
    format: format.combine(
      format.colorize(),
      format.printf(info => `${info.level}: ${info.message} [${info.label}] ${info.timestamp}`)
    )
  }
}

const logger = new CreateLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.label({ label: path.basename(process.mainModule.filename) })
  ),
  exitOnError: false
})

const productionLogger = [
  new File(options.infoFile),
  new File(options.errorFile)
]

if (process.env.NODE_ENV !== 'production') {
  logger.add(new Console(options.console))
} else {
  logger.add(...productionLogger)
}

module.exports = logger
