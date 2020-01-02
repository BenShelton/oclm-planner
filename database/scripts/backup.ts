import dotenv from 'dotenv'
import { exec } from 'child_process'

dotenv.config()

const { MONGODB_URI } = process.env
if (!MONGODB_URI) throw new Error('No MONGODB_URI set in .env')
const command = 'mongodump --uri ' + MONGODB_URI

exec(command, (err, stdout) => {
  if (err) throw err
  console.log(stdout)
})
