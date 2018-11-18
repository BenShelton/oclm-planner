import express from 'express'
import bodyParser from 'body-parser'
import serverless from 'serverless-http'

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()
router.get('/', (req, res) => {
  res.send('Test')
})

app.use(router)
app.use((req, res) => {
  res.status(404).send('Not found')
})

// Export lambda handler
exports.handler = serverless(app)
