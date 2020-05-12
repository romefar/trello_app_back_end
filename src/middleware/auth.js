const logger = require('../config/winston')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv/config')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      logger.error(`401 - User is not authenticated - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(401).send({ error: 'User is not authenticated.' })
    }

    req.token = token
    req.user = user
    logger.info(`200 - An authorized request was made by ${user.email} to - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    next()
  } catch (err) {
    logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: err.message })
  }
}

module.exports = auth
