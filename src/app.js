const express = require('express')
const chalk = require('chalk')
const helmet = require('helmet')
require('dotenv/config')
require('./db/mongoose')

const usersRoute = require('./routes/users')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(helmet())
app.use('/api/v1/users', usersRoute)

app.listen(port, () => {
  console.log(chalk.green(`Server is running on port ${port}`))
})
