const mongoose = require('mongoose')
const chalk = require('chalk')
require('dotenv/config')

mongoose.connect(`mongodb://${process.env.DB_DEV_HOST}:${process.env.DB_DEV_DB_PORT}/${process.env.DB_DEV_NAME}`, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
})
  .then(() => {
    console.log(chalk.green('Succesfully connected to the database.'))
  })
  .catch(err => {
    console.log(chalk.red('An error was occured.'))
    console.log(err)
  })

mongoose.set('useCreateIndex', true)
