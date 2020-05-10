const express = require('express')
const router = new express.Router()
const logger = require('../config/winston')
const User = require('../models/user')
const auth = require('../middleware/auth')
const schemaValidator = require('../middleware/schemaValidator')
const { userSchemaCreate } = require('../schemas/schemas')

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findUserByCred(email, password)

    if (!user) {
      logger.error(`400 - Unable to login - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(400).send({ error: 'Unable to login.' })
    }

    const token = await user.generateAuthToken()
    const responseObj = { message: `User ${user.email} succesfully authorized.`, user }

    if (process.env.NODE_ENV === 'development') {
      responseObj.token = token
    }

    res.send(responseObj)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({})
  }
})

router.post('/logout', auth, async (req, res) => {
  try {
    const { token, user } = req
    user.tokens = user.tokens.filter(item => item.token !== token)
    await user.save()
    res.send({ message: `User ${user.email} succesfully logout.`, user })
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.post('/signup', schemaValidator(userSchemaCreate), async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()

    res.status(201).send(user)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

module.exports = router
