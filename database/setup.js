import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config()

const { MONGODB_URI, MONGODB_NAME } = process.env
const connectionOptions = {
  useNewUrlParser: true,
  validateOptions: true
}

export default MongoClient.connect(MONGODB_URI, connectionOptions)
  .then(client => client.db(MONGODB_NAME))
