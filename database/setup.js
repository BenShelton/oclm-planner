import { MongoClient } from 'mongodb'

const { MONGDB_CONNECTION } = process.env
const connectionOptions = {
  useNewUrlParser: true,
  validateOptions: true
}

export default MongoClient.connect(MONGDB_CONNECTION, connectionOptions)
  .then(client => client.db('oclm'))
