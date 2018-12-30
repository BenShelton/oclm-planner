const express = require('express')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')

const auth = require('../database/auth')
const congregation = require('../database/congregation')
const schedule = require('../database/schedule')
const { APPOINTMENTS, GENDERS, LANGUAGE_GROUPS } = require('../src/constants')

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()

const handleErrors = res => error => {
  console.error('Error Message: ' + error.message)
  switch (error.message.toString()) {
    case '401':
      return res.status(401).json({ message: '401 - Unauthorized', error: { message: 'Invalid Password' } })
    case '404':
      return res.status(404).json({ message: '404 - Not Found', error })
    default:
      return res.status(500).json({ message: '500 - Server Error', error })
  }
}

router.post('/auth/login', (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ message: 'No password provided' })
  auth.createToken({ password })
    .then(result => res.status(200).json({ result }))
    .catch(handleErrors(res))
})

router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization
    if (!token) throw new Error('No token sent')
    const decoded = await auth.validateToken({ token })
    req.tokenID = decoded._id
    next()
  } catch (err) {
    res.status(403).json({ message: '403 - Not Authorised', err })
  }
})

router.get('/auth/logout', (req, res) => {
  auth.removeToken(req.tokenID)
    .then(() => res.status(200).json({ message: 'Logout Successful' }))
    .catch(handleErrors(res))
})

router.get('/congregation/members', (req, res) => {
  congregation.getMembers()
    .then(result => res.status(200).json({ result }))
    .catch(handleErrors(res))
})

router.post('/congregation/addMember', (req, res) => {
  const { name, abbreviation, appointment, gender, languageGroup, privileges, show } = req.body
  if (!name || !abbreviation) return res.status(400).json({ message: 'Name & Abbreviation are required' })
  if (!APPOINTMENTS.includes(appointment)) return res.status(400).json({ message: 'Appointment must be one of the following: ' + APPOINTMENTS.join(', ') })
  if (!GENDERS.includes(gender)) return res.status(400).json({ message: 'Gender must be one of the following: ' + GENDERS.join(', ') })
  if (!LANGUAGE_GROUPS.includes(languageGroup)) return res.status(400).json({ message: 'Language Group must be one of the following: ' + LANGUAGE_GROUPS.join(', ') })
  if (!privileges || typeof privileges !== 'object') return res.status(400).json({ message: 'Privileges must be an object' })
  if (typeof show !== 'boolean') return res.status(400).json({ message: 'Show must be a boolean' })
  const member = { name, abbreviation, appointment, gender, languageGroup, privileges, show }
  congregation.addMember(member)
    .then(result => res.status(200).json({ result }))
    .catch(handleErrors(res))
})

router.get('/schedule/week/:date', (req, res) => {
  const { date } = req.params
  if (!date) return res.status(400).json({ message: 'No date provided' })
  if (!(/^\d{4}-\d{2}-\d{2}$/.test(date))) return res.status(400).json({ message: 'Date should be in yyyy-mm-dd format' })
  if (new Date(Date.parse(date)).getDay() !== 1) return res.status(400).json({ message: 'Date must be a Monday' })
  schedule.getWeek({ date })
    .then(result => res.status(200).json({ result }))
    .catch(handleErrors(res))
})

router.put('/schedule/scrape', (req, res) => {
  const { weekID } = req.body
  if (!weekID) return res.status(400).json({ message: 'weekID is required' })
  schedule.scrapeWeek({ weekID })
    .then(result => res.json({ result }))
    .catch(handleErrors(res))
})

router.put('/schedule/updateAssignment', (req, res) => {
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
