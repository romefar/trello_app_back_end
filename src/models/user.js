const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Schema, model } = require('mongoose')
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
    required: [true, 'Email address is required.'],
    validate (value) {
      if (!validator.isEmail(value)) throw new Error('Email is invalid.')
      return true
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    validate (value) {
      if (value.length <= 8) throw new Error('Password is too short.')
      if (value.toLowerCase().includes('password')) throw new Error('Password cannot contain itself.')
    }
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

  user.tokens = [...user.tokens, token]
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
  if (!user) throw new Error('Unable to login')

  const isAuth = await bcrypt.compare(password, user.password)
  if (!isAuth) throw new Error('Unable to login')

  return user
}

userSchema.pre('save', async function (next) {
  const user = this
  console.log(user)
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

const User = model('User', userSchema)

module.exports = User
