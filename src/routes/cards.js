const express = require('express')
const router = new express.Router()
const logger = require('../config/winston')
const Board = require('../models/board')
const User = require('../models/user')
const auth = require('../middleware/auth')
const schemaValidator = require('../middleware/schemaValidator')
const { cardSchemaCreate, cardSchemaUpdate } = require('../schemas/schemas')
const checkSchemaUpdate = require('../utils/checkSchemaUpdate')

router.get('/:id/cards', auth, async (req, res) => {
  try {
    const { user, params: { id } } = req
    const board = await Board.findOne({ _id: id, owner: user._id }, 'cards')

    res.send(board || [])
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.post('/:id/cards', schemaValidator(cardSchemaCreate), auth, async (req, res) => {
  try {
    const { body, params: { id } } = req
    const user = await User.findOne({ _id: body.user })

    if (!user) {
      logger.error(`404 - Unable to find a user - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a user.' })
    }

    const cards = await Board.findByIdAndUpdate(id, {
      $push: {
        cards: body
      }
    }, { new: true })

    if (!cards) {
      logger.error(`404 - Unable to find a board - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a board.' })
    }

    res.send(cards)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.put('/:id/cards/:cardId', schemaValidator(cardSchemaUpdate), auth, async (req, res) => {
  try {
    const { body, user, params: { id, cardId } } = req
    const isValidUpdate = checkSchemaUpdate(Board.schema, req.body, [''])

    if (!isValidUpdate) {
      logger.error(`400 - You are not allowed to change meta fields. - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(400).send({ error: 'You are not allowed to change meta fields.' })
    }

    const updateObject = {}
    for (const [key, value] of Object.entries(body)) {
      updateObject[`cards.$.${key}`] = value
    }

    const card = await Board.findOneAndUpdate({
      _id: id,
      owner: user._id,
      'cards._id': cardId
    },
    {
      $set: updateObject

    }, { new: true })

    if (!card) {
      logger.error(`404 - Unable to find a card - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a card.' })
    }
    res.send(card)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.delete('/:id/cards/:cardId', auth, async (req, res) => {
  try {
    const { id, cardId } = req.params
    const removedCard = await Board.findOneAndUpdate({
      _id: id,
      owner: req.user._id,
      'cards._id': cardId
    },
    {
      $pull: {
        cards: {
          _id: cardId
        }
      }
    }, { new: true })

    if (!removedCard) {
      logger.error(`404 - Unable to find a board - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a board.' })
    }

    res.send(removedCard)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

module.exports = router
