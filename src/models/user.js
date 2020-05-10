const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Schema, model } = require('mongoose')
const Board = require('./board')
require('dotenv/config')

const userSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'Email address is required.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, { timestamps: true })

userSchema.methods.generateAuthToken = async function () {
  const user = this

  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY, { expiresIn: '7d' })
  user.tokens = [...user.tokens, { token }]
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = { ...user.toObject() }
  delete userObject.password
  delete userObject.tokens
  return userObject
}

userSchema.statics.findUserByCred = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) return null

  const isAuth = await bcrypt.compare(password, user.password)
  if (!isAuth) return null

  return user
}

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

userSchema.pre('remove', async function (next) {
  const user = this

  await Board.deleteMany({ owner: user._id })

  next()
})

const User = model('User', userSchema)

module.exports = User
