import express from 'express'
import bodyParser from 'body-parser'
import serverless from 'serverless-http'

import db from '../database'

// Initialize express app
const app = express()
app.use(bodyParser.json())

app.get('/test', (req, res) => {
  res.send('Test')
  console.log(db)
})
app.use((req, res) => {
  res.status(404).send('Not found')
})

// Export lambda handler
exports.handler = serverless(app)
