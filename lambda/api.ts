import express, { Response } from 'express'
import bodyParser from 'body-parser'
import serverless from 'serverless-http'

import * as auth from '../database/auth'
import * as congregation from '../database/congregation'
import * as schedule from '../database/schedule'
import { APPOINTMENTS, GENDERS, SUPPORTED_LANGUAGES, WEEK_TYPES } from '../src/constants'
import { ICongregationMember, APITypes } from 'types'

// Initialize express app
const app = express()
app.use(bodyParser.json())

const router = express.Router()

function returnResult<T> (res: Response) {
  return (result: T) => res.status(200).json({ result })
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
  const { password } = req.body as APITypes.Auth.Login.Data
  if (!password) return res.status(400).json({ message: 'No password provided' })
  auth.createToken(password)
    .then(returnResult<APITypes.Auth.Login.Result>(res))
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
    .then(() => res.status(200).json({ message: 'Logout Successful' } as APITypes.Auth.Logout.Result))
    .catch(handleErrors(res))
})

router.get('/congregation/members', (req, res) => {
  congregation.getMembers()
    .then(returnResult<APITypes.Congregation.GetMembers.Result>(res))
    .catch(handleErrors(res))
})

const languageCodes = SUPPORTED_LANGUAGES.map(({ value }) => value)
function validateMember (member: Omit<ICongregationMember, '_id'>): string | null {
  const { name, appointment, gender, languageGroup, privileges, languagePrivileges, show } = member
  if (!name) return 'Name is required'
  if (!APPOINTMENTS.includes(appointment)) return 'Appointment must be one of the following: ' + APPOINTMENTS.join(', ')
  if (!GENDERS.includes(gender)) return 'Gender must be one of the following: ' + GENDERS.join(', ')
  if (!languageCodes.includes(languageGroup)) return 'Language Group must be one of the following: ' + languageCodes.join(', ')
  if (!privileges || typeof privileges !== 'object') return 'Privileges must be an object'
  if (languagePrivileges && typeof languagePrivileges !== 'object') return 'Language Privileges must be an object'
  if (typeof show !== 'boolean') return 'Show must be a boolean'
  return null
}

router.post('/congregation/addMember', (req, res) => {
  const { name, appointment, gender, languageGroup, school, privileges, languagePrivileges, show } = req.body as APITypes.Congregation.AddMember.Data
  const member = { name, appointment, gender, languageGroup, school, privileges, languagePrivileges, show }
  const validationError = validateMember(member)
  if (validationError) return res.status(400).json({ message: validationError })
  congregation.addMember(member)
    .then(returnResult<APITypes.Congregation.AddMember.Result>(res))
    .catch(handleErrors(res))
})

router.post('/congregation/updateMember', (req, res) => {
  const { memberID, member } = req.body as APITypes.Congregation.UpdateMember.Data
  if (!memberID || !member) return res.status(400).json({ message: 'MemberID & Member are required' })
  const validationError = validateMember(member)
  if (validationError) return res.status(400).json({ message: 'Invalid Member: ' + validationError })
  congregation.updateMember(memberID, member)
    .then(returnResult<APITypes.Congregation.UpdateMember.Result>(res))
    .catch(handleErrors(res))
})

router.delete('/congregation/deleteMember/:memberID', (req, res) => {
  const { memberID } = req.params
  if (!memberID) return res.status(400).json({ message: 'No MemberID provided' })
  congregation.deleteMember(memberID)
    .then(() => res.status(200).json({ message: 'Member Successfully Deleted' } as APITypes.Congregation.DeleteMember.Result))
    .catch(handleErrors(res))
})

router.get('/schedule/week/:date', (req, res) => {
  const { date } = req.params
  if (!date) return res.status(400).json({ message: 'No date provided' })
  if (!(/^\d{4}-\d{2}-\d{2}$/.test(date))) return res.status(400).json({ message: 'Date should be in yyyy-mm-dd format' })
  if (new Date(Date.parse(date)).getDay() !== 1) return res.status(400).json({ message: 'Date must be a Monday' })
  schedule.getWeek(date)
    .then(returnResult<APITypes.Schedule.GetWeek.Result>(res))
    .catch(handleErrors(res))
})

router.get('/schedule/month/:month', (req, res) => {
  const { month } = req.params
  if (!month) return res.status(400).json({ message: 'No month provided' })
  if (!(/^\d{4}-\d{2}$/.test(month))) return res.status(400).json({ message: 'Month should be in yyyy-mm format' })
  schedule.getMonth(month)
    .then(returnResult<APITypes.Schedule.GetMonth.Result>(res))
    .catch(handleErrors(res))
})

router.put('/schedule/scrape', (req, res) => {
  const { weekID, language } = req.body as APITypes.Schedule.ScrapeWeek.Data
  if (!weekID) return res.status(400).json({ message: 'weekID is required' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.scrapeWeek(weekID, language)
    .then(returnResult<APITypes.Schedule.ScrapeWeek.Result>(res))
    .catch(err => {
      const errorHandler = handleErrors(res)
      if (err.status === 404) return errorHandler(new Error('404'))
      return errorHandler(err)
    })
})

router.put('/schedule/updateAssignment', (req, res) => {
  const { weekID, language, name, assignment } = req.body as APITypes.Schedule.UpdateAssignment.Data
  if (!weekID || !language || !name || !assignment) {
    return res.status(400).json({ message: 'Required Fields are: weekID, language, name, assignment' })
  }
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.updateAssignment(weekID, language, name, assignment)
    .then(returnResult<APITypes.Schedule.UpdateAssignment.Result>(res))
    .catch(handleErrors(res))
})

router.put('/schedule/deleteAssignment', (req, res) => {
  const { weekID, language, name } = req.body as APITypes.Schedule.DeleteAssignment.Data
  if (!weekID || !language || !name) {
    return res.status(400).json({ message: 'Required Fields are: weekID, language, name' })
  }
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.deleteAssignment(weekID, language, name)
    .then(returnResult<APITypes.Schedule.DeleteAssignment.Result>(res))
    .catch(handleErrors(res))
})

router.put('/schedule/updateWeekType', (req, res) => {
  const { weekID, language, type } = req.body as APITypes.Schedule.UpdateWeekType.Data
  if (!weekID || !language || type === undefined) return res.status(400).json({ message: 'Required Fields are: weekID, language, type' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  if (!(Object.values(WEEK_TYPES).some(t => t.value === type))) return res.status(400).json({ message: 'Invalid Type' })
  schedule.updateWeekType(weekID, language, type)
    .then(returnResult<APITypes.Schedule.UpdateWeekType.Result>(res))
    .catch(handleErrors(res))
})

router.put('/schedule/updateCOName', (req, res) => {
  const { weekID, language, name } = req.body as APITypes.Schedule.UpdateCOName.Data
  if (!weekID || !language || name === undefined) return res.status(400).json({ message: 'Required Fields are: weekID, language, name' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.updateCOName(weekID, language, name)
    .then(returnResult<APITypes.Schedule.UpdateCOName.Result>(res))
    .catch(handleErrors(res))
})

router.put('/schedule/updateCOTitle', (req, res) => {
  const { weekID, language, title } = req.body as APITypes.Schedule.UpdateCOTitle.Data
  if (!weekID || !language || title === undefined) return res.status(400).json({ message: 'Required Fields are: weekID, language, title' })
  if (!validLanguage(language)) return res.status(400).json({ message: 'Invalid language' })
  schedule.updateCOTitle(weekID, language, title)
    .then(returnResult<APITypes.Schedule.UpdateCOTitle.Result>(res))
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
