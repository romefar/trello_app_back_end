const express = require('express')
const router = new express.Router()
const logger = require('../config/winston')
const User = require('../models/user')
const schemaValidator = require('../middleware/schemaValidator')
const { userSchemaCreate } = require('../schemas/schemas')

router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users || [])
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.find({ _id: id })

    if (!user) {
      logger.error(`404 - Unable to find a user - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a user.' })
    }
    res.send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.put('/:id', schemaValidator(userSchemaCreate), async (req, res) => {
  try {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = Object.keys(User.schema.obj)
    const isValidUpdate = updates.every(item => allowedUpdates.includes(item))

    if (!isValidUpdate) {
      logger.error(`400 - You are not allowed to change meta fields. - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(400).send({ error: 'You are not allowed to change meta fields.' })
    }

    const user = await User.findOneAndUpdate({ _id: id }, req.body)

    if (!user) {
      logger.error(`404 - Unable to find a user - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: ' Unable to find a user.' })
    }
    res.send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findOneAndRemove({ _id: id })

    if (!user) {
      logger.error(`404 - Unable to find a user - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: ' Unable to find a user.' })
    }
    res.send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

module.exports = router
