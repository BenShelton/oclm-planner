require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

const { MONGDB_CONNECTION } = process.env
const connectionOptions = {
  useNewUrlParser: true,
  validateOptions: true
}

module.exports = MongoClient.connect(MONGDB_CONNECTION, connectionOptions)
  .then(client => client.db('oclm'))
