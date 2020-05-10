const { Schema, model } = require('mongoose')

const cardSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Card name is required.']
  },
  description: {
    type: String,
    required: [true, 'Card description is required.']
  },
  estimate: {
    type: String,
    required: [true, 'Estimated time is required.']
  },
  status: {
    type: String,
    enum: ['Todo', 'In progress', 'In review', 'Done'],
    default: 'Todo'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required.']
  },
  labels: [{
    type: String,
    trim: true
  }],
  user: {
    type: Schema.Types.ObjectId,
    required: [true, 'User is required.'],
    ref: 'Users'
  }
})

const boardSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'white'
  },
  description: {
    type: String
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  cards: [cardSchema]
}, { timestamps: true })

boardSchema.pre('save', async function (next) {
  const board = this
  const User = require('./user')
  const { role } = await User.findById(board.owner)
  if (role !== 'admin') throw new Error('You don\'t have permissions to create/update a board.')

  next()
})

boardSchema.pre('remove', async function (next) {
  const board = this
  const User = require('./user')
  const { role } = await User.findById(board.owner)
  if (role !== 'admin') throw new Error('You don\'t have permissions to delete a board.')

  next()
})

const Board = model('Board', boardSchema)

module.exports = Board
