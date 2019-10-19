import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'

dotenv.config()

const { MONGODB_URI = '' } = process.env
const connectionOptions = {
  useNewUrlParser: true,
  validateOptions: true
}

export default MongoClient.connect(MONGODB_URI, connectionOptions)
  .then(async (client: MongoClient) => {
    const { SETTINGS } = await import('../src/constants')
    return client.db(SETTINGS.db)
  })
