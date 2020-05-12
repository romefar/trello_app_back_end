const express = require('express')
const helmet = require('helmet')
const logger = require('./config/winston')
const connect = require('./db/mongoose')
require('dotenv/config')

const genericRoute = require('./routes/generic')
const authRoute = require('./routes/auth')
const boardsRoute = require('./routes/boards')
const cardsRoute = require('./routes/cards')
const profileRoute = require('./routes/profile')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(helmet())
app.use('/', authRoute)
app.use('/', genericRoute)

app.use('/profile/boards', boardsRoute)
app.use('/profile/boards', cardsRoute)
app.use('/profile', profileRoute)

connect()
  .then(() => {
    logger.info('Succesfully connected to the database.')
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}.`)
    })
  })
  .catch(err => {
    logger.error(`Couldn't connect to the database. - ${err.message}`)
  })
