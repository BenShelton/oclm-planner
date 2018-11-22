const express = require('express')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')

const setupDB = require('../database')

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()
router.get('/', (req, res) => {
  setupDB
    .then(db => {
      console.log(db)
      res.send('DB Setup!')
    })
    .catch(err => {
      res.status(500).send(err.message)
      console.error(err)
    })
})

// The lambda function route starts with api so account for that here
app.use('/api', router)
app.use((req, res) => {
  res.status(404).send('Not found')
})

// Export lambda handler
exports.handler = serverless(app)

// Test server for sanity checking
// app.listen(9000, () => console.log('Test app listening on port 9000'))
