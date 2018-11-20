require('dotenv').config()
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

const { MONGDB_CONNECTION } = process.env
const connectionOptions = {
  useNewUrlParser: true,
  validateOptions: true
}

module.exports = new Promise(resolve => {
  MongoClient.connect(MONGDB_CONNECTION, connectionOptions, (err, db) => {
    assert.equal(null, err)
    resolve(db)
  })
})
