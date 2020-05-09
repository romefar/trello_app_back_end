const express = require('express')
const router = new express.Router()
const logger = require('../config/winston')
const User = require('../models/user')
const schemaValidator = require('../middleware/schemaValidator')
const { userSchema } = require('../schemas/schemas')

router.post('/', schemaValidator(userSchema), async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()

    res.status(201).send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({})
  }
})

module.exports = router
