const logger = require('../config/winston')

const schemaValidator = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body)
      next()
    } catch (err) {
      const status = err.details ? 400 : 500
      const message = err.message || err.details.map(i => i.message).join(',')
      logger.error(`${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      res.status(status).send({ error: message })
    }
  }
}

module.exports = schemaValidator
