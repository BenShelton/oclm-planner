const express = require('express')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')

const schedule = require('../database/schedule')

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()

const handleErrors = res => error => {
  console.error('Error Message: ' + error.message)
  switch (error.message.toString()) {
    case '404':
      return res.status(404).json({ message: '404 - Not Found', error })
    default:
      return res.status(500).json({ message: '500 - An unknown error occured', error })
  }
}

router.get('/schedule/week/:date', (req, res) => {
  const { date } = req.params
  if (!date) return res.status(400).json({ message: 'No date provided' })
  if (!(/^\d{4}-\d{2}-\d{2}$/.test(date))) return res.status(400).json({ message: 'Date should be in yyyy-mm-dd format' })
  if (new Date(Date.parse(date)).getDay() !== 1) return res.status(400).json({ message: 'Date must be a Monday' })
  schedule.getWeek({ date })
    .then(result => res.json({ result }))
    .catch(handleErrors(res))
})

router.post('/schedule/updateAssignment', (req, res) => {
  const { weekID, name, assignment } = req.body
  if (!weekID || !name || !assignment) {
    return res.status(400).json({ message: 'Required Fields are: weekID, name, assignment' })
  }
  schedule.updateAssignment({ weekID, name, assignment })
    .then(result => res.json({ result }))
    .catch(handleErrors(res))
})

// The lambda function route must match the netlify path
app.use('/.netlify/functions/api', router)
app.use((req, res) => {
  const { path } = req
  res.status(404).json({ message: 'API Path Not Found', path })
})

// Export lambda handler
exports.handler = serverless(app)

// Test server for sanity checking
// app.listen(9000, () => console.log('Test app listening on port 9000'))
