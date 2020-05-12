const express = require('express')
const router = new express.Router()
const logger = require('../config/winston')
const User = require('../models/user')
const Board = require('../models/board')
const auth = require('../middleware/auth')
const schemaValidator = require('../middleware/schemaValidator')
const { userSchemaUpdate } = require('../schemas/schemas')
const checkSchemaUpdate = require('../utils/checkSchemaUpdate')

router.get('/', auth, async (req, res) => {
  try {
    const { user } = req
    res.send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.get('/cards', auth, async (req, res) => {
  try {
    const { user } = req
    const cards = await Board.find({ 'cards.user': user._id }, 'cards')

    res.send(cards || [])
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.put('/', schemaValidator(userSchemaUpdate), auth, async (req, res) => {
  try {
    const isValidUpdate = checkSchemaUpdate(User.schema, req.body, ['role'])
    if (!isValidUpdate) {
      logger.error(`400 - You are not allowed to change meta fields. - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(400).send({ error: 'You are not allowed to change meta fields.' })
    }

    const user = await User.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true })

    if (!user) {
      logger.error(`404 - Unable to find a user - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a user.' })
    }
    logger.info(`200 - A user's profile (${user.email}) was succesfully updated - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.delete('/', auth, async (req, res) => {
  try {
    const { user } = req
    const removedUser = await User.findByIdAndRemove(user._id)

    if (!removedUser) {
      logger.error(`404 - Unable to find a user - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a user.' })
    }
    logger.info(`200 - A user's profile (${user.email}) was succesfully removed - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.send(removedUser)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

module.exports = router
