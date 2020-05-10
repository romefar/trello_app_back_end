const express = require('express')
const router = new express.Router()
const logger = require('../config/winston')
const Board = require('../models/board')
const auth = require('../middleware/auth')
const schemaValidator = require('../middleware/schemaValidator')
const { boardSchemaCreate, boardSchemaUpdate } = require('../schemas/schemas')
const checkSchemaUpdate = require('../utils/checkSchemaUpdate')

router.get('/', auth, async (req, res) => {
  try {
    const { user } = req
    const boards = await Board.find({ owner: user._id })

    res.send(boards || [])
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.post('/', schemaValidator(boardSchemaCreate), auth, async (req, res) => {
  try {
    const { body, user } = req
    const board = new Board(body)
    board.owner = user._id
    await board.save()
    res.send(board)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.put('/:id', schemaValidator(boardSchemaUpdate), auth, async (req, res) => {
  try {
    const { body, user, params: { id } } = req
    const isValidUpdate = checkSchemaUpdate(Board.schema, req.body, ['owner'])

    if (!isValidUpdate) {
      logger.error(`400 - You are not allowed to change meta fields. - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(400).send({ error: 'You are not allowed to change meta fields.' })
    }

    const board = await Board.findOneAndUpdate({ _id: id, owner: user._id }, body, { new: true })

    if (!board) {
      logger.error(`404 - Unable to find a board - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a board.' })
    }

    res.send(board)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const { user, params: { id } } = req

    const removedBoard = await Board.findOneAndRemove({ _id: id, owner: user._id }, { new: true })

    if (!removedBoard) {
      logger.error(`404 - Unable to find a board - ${req.originalUrl} - ${req.method} - ${req.ip}`)
      return res.status(404).send({ error: 'Unable to find a board.' })
    }

    res.send(removedBoard)
  } catch (error) {
    logger.error(`500 - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
    res.status(500).send({ error: error.message })
  }
})

module.exports = router
