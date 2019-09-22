import express, { Response } from 'express'
import bodyParser from 'body-parser'
import serverless from 'serverless-http'

import * as auth from '../database/auth'
import * as congregation from '../database/congregation'
import * as schedule from '../database/schedule'
import { APPOINTMENTS, GENDERS, SUPPORTED_LANGUAGES, WEEK_TYPES } from '../src/constants'

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()

function returnResult (res: Response) {
  return (result: object) => res.status(200).json({ result })
}

function handleErrors (res: Response) {
  return (error: Error) => {
    console.error('Error Message: ' + error.message)
    switch (error.message) {
      case '401':
        return res.status(401).json({ message: '401 - Unauthorized', error: { message: 'Invalid Password' } })
      case '404':
        return res.status(404).json({ message: '404 - Not Found', error })
      default:
        return res.status(500).json({ message: '500 - Server Error', error })
    }
  }
}

function validLanguage (language: string): boolean {
  return SUPPORTED_LANGUAGES.some(({ value }): boolean => value === language)
}

router.post('/auth/login', (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ message: 'No password provided' })
  auth.createToken(password)
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization
    if (!token) throw new Error('No token sent')
    const decoded = await auth.validateToken(token)
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
    .then(returnResult(res))
    .catch(handleErrors(res))
})

const languageCodes = SUPPORTED_LANGUAGES.map(({ value }) => value)
function validateMember (member: any): string | null {
  const { name, appointment, gender, languageGroup, privileges, show } = member
  if (!name) return 'Name is required'
  if (!APPOINTMENTS.includes(appointment)) return 'Appointment must be one of the following: ' + APPOINTMENTS.join(', ')
  if (!GENDERS.includes(gender)) return 'Gender must be one of the following: ' + GENDERS.join(', ')
  if (!languageCodes.includes(languageGroup)) return 'Language Group must be one of the following: ' + languageCodes.join(', ')
  if (!privileges || typeof privileges !== 'object') return 'Privileges must be an object'
  if (typeof show !== 'boolean') return 'Show must be a boolean'
  return null
}

router.post('/congregation/addMember', (req, res) => {
  const { name, appointment, gender, languageGroup, privileges, show } = req.body
  const member = { name, appointment, gender, languageGroup, privileges, show }
  const validationError = validateMember(member)
  if (validationError) return res.status(400).json({ message: validationError })
  congregation.addMember(member)
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.post('/congregation/updateMember', (req, res) => {
  const { memberID, member } = req.body
  if (!memberID || !member) return res.status(400).json({ message: 'MemberID & Member are required' })
  const validationError = validateMember(member)
  if (validationError) return res.status(400).json({ message: 'Invalid Member: ' + validationError })
  congregation.updateMember({ memberID, member })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.delete('/congregation/deleteMember/:memberID', (req, res) => {
  const { memberID } = req.params
  if (!memberID) return res.status(400).json({ message: 'No MemberID provided' })
  congregation.deleteMember({ memberID })
    .then(() => res.status(200).json({ message: 'Member Successfully Deleted' }))
    .catch(handleErrors(res))
})

router.get('/schedule/week/:date', (req, res) => {
  const { date } = req.params
  if (!date) return res.status(400).json({ message: 'No date provided' })
  if (!(/^\d{4}-\d{2}-\d{2}$/.test(date))) return res.status(400).json({ message: 'Date should be in yyyy-mm-dd format' })
  if (new Date(Date.parse(date)).getDay() !== 1) return res.status(400).json({ message: 'Date must be a Monday' })
  schedule.getWeek({ date })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.get('/schedule/month/:month', (req, res) => {
  const { month } = req.params
  if (!month) return res.status(400).json({ message: 'No month provided' })
  if (!(/^\d{4}-\d{2}$/.test(month))) return res.status(400).json({ message: 'Month should be in yyyy-mm format' })
  schedule.getMonth({ month })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.put('/schedule/scrape', (req, res) => {
  const { weekID, language } = req.body
  if (!weekID) return res.status(400).json({ message: 'weekID is required' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.scrapeWeek({ weekID, language })
    .then(returnResult(res))
    .catch(err => {
      const errorHandler = handleErrors(res)
      if (err.status === 404) return errorHandler(new Error('404'))
      return errorHandler(err)
    })
})

router.put('/schedule/updateAssignment', (req, res) => {
  const { weekID, language, name, assignment } = req.body
  if (!weekID || !language || !name || !assignment) {
    return res.status(400).json({ message: 'Required Fields are: weekID, language, name, assignment' })
  }
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.updateAssignment({ weekID, language, name, assignment })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.put('/schedule/deleteAssignment', (req, res) => {
  const { weekID, language, name } = req.body
  if (!weekID || !language || !name) {
    return res.status(400).json({ message: 'Required Fields are: weekID, language, name' })
  }
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.deleteAssignment({ weekID, language, name })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.put('/schedule/updateWeekType', (req, res) => {
  const { weekID, language, type } = req.body
  if (!weekID || !language || type === undefined) return res.status(400).json({ message: 'Required Fields are: weekID, language, type' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  if (!(Object.values(WEEK_TYPES).some(t => t.value === type))) return res.status(400).json({ message: 'Invalid Type' })
  schedule.updateWeekType({ weekID, language, type })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.put('/schedule/updateCOName', (req, res) => {
  const { weekID, language, name } = req.body
  if (!weekID || !language || name === undefined) return res.status(400).json({ message: 'Required Fields are: weekID, language, name' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.updateCOName({ weekID, language, name })
    .then(returnResult(res))
    .catch(handleErrors(res))
})

router.put('/schedule/updateCOTitle', (req, res) => {
  const { weekID, language, title } = req.body
  if (!weekID || !language || title === undefined) return res.status(400).json({ message: 'Required Fields are: weekID, language, title' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.updateCOTitle({ weekID, language, title })
    .then(returnResult(res))
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
