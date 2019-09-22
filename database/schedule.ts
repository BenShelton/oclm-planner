import { ObjectID, Collection } from 'mongodb'
import assert from 'assert'
import setup from './setup'
import scrapeWOL from './scraper'
import { addAssignment, removeAssignment } from './congregation'
import { WEEK_TYPES, SUPPORTED_LANGUAGES } from '../src/constants'
import { ScheduleWeek } from '../src/ts/types'
import { ICongregationMember } from '../src/ts/interfaces'

interface IWeekWithMembers {
  week: ScheduleWeek
  members: ICongregationMember[]
}

const ASSIGNEE_FIELDS = ['assignee', 'assistant']

const getCollection = new Promise<Collection<ScheduleWeek>>(resolve => {
  setup
    .then(db => db.collection('schedule'))
    .then(resolve)
})

export const getWeek = async (date: string): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { date }
  const existingWeek = await coll.findOne(query)
  if (existingWeek) return existingWeek
  // if week doesn't exist add it and return the added week
  const baseWeek = { date }
  for (const { value } of SUPPORTED_LANGUAGES) {
    baseWeek[value] = { assignments: {} }
  }
  const newWeekResult = await coll.insertOne(baseWeek)
  const newWeek = newWeekResult && newWeekResult.ops && newWeekResult.ops[0]
  assert.notStrictEqual(null, newWeek, 'Adding Missing Week was unsuccessful')
  return newWeek
}

export const getMonth = async ({ month }): Promise<ScheduleWeek[]> => {
  const coll = await getCollection
  // calculate the number of weeks in that month
  let weekCount = 0
  const checkDate = new Date(month + '-01')
  const checkMonth = checkDate.getMonth()
  const daysUntilMonday = (7 - (checkDate.getDay() - 1)) % 7
  checkDate.setDate(checkDate.getDate() + daysUntilMonday)
  while (checkDate.getMonth() === checkMonth) {
    weekCount++
    checkDate.setDate(checkDate.getDate() + 7)
  }
  assert([4, 5].includes(weekCount), 'Month should always have 4 or 5 weeks')
  // search for those weeks
  const query = { date: { $regex: '^' + month } }
  const weeks = await coll.find(query).sort({ date: 1 }).toArray()
  assert.strictEqual(weekCount, weeks.length, 'Month did not return the expected number of weeks')
  return weeks
}

export const scrapeWeek = async ({ weekID, language }): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }
  const week = await coll.findOne(query)
  assert.notStrictEqual(null, week, 'Week ID does not exist')
  const update = { $set: await scrapeWOL(week.date, language) }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, 'Update not successful')
  return value
}

export const updateAssignment = async ({ weekID, language, name, assignment }): Promise<IWeekWithMembers> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }

  // Remove existing assigned members
  const updatedMembers = []
  const baseWeek = await coll.findOne(query)
  assert.notStrictEqual(null, baseWeek, 404)
  const week = baseWeek[language] || null
  assert.notStrictEqual(null, week, 404)
  const previousAssignment = week.assignments[name]
  if (previousAssignment) {
    for (const field of ASSIGNEE_FIELDS) {
      const memberID = previousAssignment[field]
      if (memberID) {
        const member = await removeAssignment({ memberID, assignment: { type: previousAssignment.type, date: baseWeek.date } })
        updatedMembers.push(member)
      }
    }
  }

  // Update Assignment
  const update = {}
  const assignmentPath = language + '.assignments.' + name
  update.$set = { [assignmentPath]: assignment }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, 404)

  // Add newly assigned members
  for (const field of ASSIGNEE_FIELDS) {
    const memberID = value[language].assignments[name][field]
    if (memberID) {
      const member = await addAssignment({ memberID, assignment: { type: assignment.type, date: value.date } })
      updatedMembers.push(member)
    }
  }

  // Return assignment
  return { week: value, members: updatedMembers }
}

export const deleteAssignment = async ({ weekID, language, name }): Promise<IWeekWithMembers> => {
  const coll = await getCollection
  const query = { _id: ObjectID(weekID) }

  // Remove existing assigned members
  const updatedMembers = []
  const baseWeek = await coll.findOne(query)
  assert.notStrictEqual(null, baseWeek, 404)
  const week = baseWeek[language] || null
  assert.notStrictEqual(null, week, 404)
  const previousAssignment = week.assignments[name]
  if (previousAssignment) {
    for (const field of ASSIGNEE_FIELDS) {
      const memberID = previousAssignment[field]
      if (memberID) {
        const member = await removeAssignment({ memberID, assignment: { type: previousAssignment.type, date: baseWeek.date } })
        updatedMembers.push(member)
      }
    }
  }

  // Update Assignment
  const update = {}
  const assignmentPath = language + '.assignments.' + name
  update.$unset = { [assignmentPath]: '' }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, 404)

  // Return assignment
  return { week: value, members: updatedMembers }
}

export const updateWeekType = async ({ weekID, language, type }): Promise<IWeekWithMembers> => {
  const coll = await getCollection
  const query = { _id: ObjectID(weekID) }

  // Check the previous week didn't already have the same type
  const baseWeek = await coll.findOne(query)
  assert.notStrictEqual(null, baseWeek, 404)
  const week = baseWeek[language] || {}
  assert.notStrictEqual(type, week.type, 400)

  // Remove existing assigned members if necessary
  const update = { $set: {} }
  const updatedMembers = []
  switch (type) {
    case WEEK_TYPES.assembly.value:
    case WEEK_TYPES.memorial.value:
      for (const [k, v] of Object.entries(week.assignments || {})) {
        if (v) {
          for (const field of ASSIGNEE_FIELDS) {
            const memberID = v[field]
            if (memberID) {
              const member = await removeAssignment({ memberID, assignment: { type: v.type, date: baseWeek.date } })
              updatedMembers.push(member)
              const assignmentPath = `${language}.assignments.${k}.${field}`
              update.$set[assignmentPath] = null
            }
          }
        }
      }
      break

    case WEEK_TYPES.coVisit.value:
      for (const assignmentName of ['congregationBibleStudy', 'reader']) {
        const assignment = week.assignments[assignmentName]
        if (assignment) {
          for (const field of ASSIGNEE_FIELDS) {
            const memberID = assignment[field]
            if (memberID) {
              const member = await removeAssignment({ memberID, assignment: { type: assignment.type, date: baseWeek.date } })
              updatedMembers.push(member)
              const assignmentPath = `${language}.assignments.${assignmentName}.${field}`
              update.$set[assignmentPath] = null
            }
          }
        }
      }
  }

  // Update Type
  const updatePath = language + '.type'
  Object.assign(update.$set, { [updatePath]: type })
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, '404')

  // Return week and any removed assigned members
  return { week: value, members: updatedMembers }
}

export const updateCOName = async ({ weekID, language, name }): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }
  const updatePath = language + '.coName'
  const update = { $set: { [updatePath]: name } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, '404')
  return value
}

export const updateCOTitle = async ({ weekID, language, title }): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }
  const updatePath = language + '.coTitle'
  const update = { $set: { [updatePath]: title } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, '404')
  return value
}
