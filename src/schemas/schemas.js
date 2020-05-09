const Joi = require('@hapi/joi')
const validator = require('validator')

const boardSchema = Joi.object({
  name: Joi.string().trim().min(5).pattern(/^[a-zA-Z -]+$/).required(),
  description: Joi.string().trim().max(255).required(),
  color: Joi.string().trim().pattern(/(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^)]*\)/).default('#FFF'),
  owner: Joi.string().trim().pattern(/a-zA-Z0-9/).required()
})

const cardSchema = Joi.object({
  name: Joi.string().trim().min(5).pattern(/^[a-zA-Z -]+$/).required(),
  description: Joi.string().trim().max(255).required(),
  estimate: Joi.string().trim().required(),
  status: Joi.string().trim().valid('Todo', 'In progress', 'In review', 'Done').default('Todo'),
  dueDate: Joi.date().min('now').required(),
  labels: Joi.array().sparse().items(Joi.string().trim()),
  user: Joi.string().trim().pattern(/a-zA-Z0-9/).required()
})

const checkPassword = (value, helpers) => {
  if (value.toLowerCase().includes('password')) throw new Error('Password cannot contain itself.')
  return value
}

const userSchema = Joi.object({
  name: Joi.string().trim().pattern(/^[a-zA-Z -]+$/),
  password: Joi.string().min(8).max(30).custom(checkPassword).required(),
  email: Joi.string().trim().email().required(),
  role: Joi.string().valid('admin', 'user').default('user')
})

module.exports = {
  boardSchema,
  cardSchema,
  userSchema
}
