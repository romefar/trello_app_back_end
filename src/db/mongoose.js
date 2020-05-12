const mongoose = require('mongoose')
require('dotenv/config')

module.exports = () => {
  const connection = mongoose.connect(`mongodb://${process.env.DB_DEV_HOST}:${process.env.DB_DEV_DB_PORT}/${process.env.DB_DEV_NAME}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  mongoose.set('useCreateIndex', true)
  return connection
}
