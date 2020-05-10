const express = require('express')
const chalk = require('chalk')
const helmet = require('helmet')
require('dotenv/config')
require('./db/mongoose')

const usersRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const boardsRoute = require('./routes/boards')
const cardsRoute = require('./routes/cards')
const profileRoute = require('./routes/profile')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(helmet())
app.use('/', authRoute)
app.use('/users', usersRoute)

app.use('/profile/boards', boardsRoute)
app.use('/profile/boards', cardsRoute)
app.use('/profile', profileRoute)

app.listen(port, () => {
  console.log(chalk.green(`\n - Server is running on port ${port}`))
})
