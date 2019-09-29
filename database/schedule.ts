import { ObjectID, Collection, UpdateQuery } from 'mongodb'
import assert from 'assert'
import setup from './setup'
import scrapeWOL from './scraper'
import { addAssignment, removeAssignment } from './congregation'
import { WEEK_TYPES, SUPPORTED_LANGUAGES } from '../src/constants'
import {
  IScheduleAssignment,
  IScheduleWeekLanguage,
  IWeekWithMembers,
  ScheduleWeek,
  MongoInterface,
  Languages,
  Assignments
} from 'types'

const ASSIGNEE_FIELDS = ['assignee', 'assistant'] as const

type CollScheduleWeek = MongoInterface<ScheduleWeek>

const getCollection = new Promise<Collection<CollScheduleWeek>>(resolve => {
  setup
    .then(db => db.collection('schedule'))
    .then(resolve)
})

export const getWeek = async (date: string): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { date }
  const existingWeek = await coll.findOne(query)
  if (existingWeek) return existingWeek as ScheduleWeek
  // if week doesn't exist add it and return the added week
  const languageAssignments = SUPPORTED_LANGUAGES
    .reduce((acc, { value }) => Object.assign(acc, { [value]: { assignments: {} } }), {}) as { [key in Languages]: IScheduleWeekLanguage }
  const baseWeek: CollScheduleWeek = { date, ...languageAssignments }
  const newWeekResult = await coll.insertOne(baseWeek)
  const newWeek: ScheduleWeek | null = newWeekResult && newWeekResult.ops && newWeekResult.ops[0]
  if (!newWeek) throw new Error('Adding Missing Week was unsuccessful')
  return newWeek as ScheduleWeek
}

export const getMonth = async (month: string): Promise<ScheduleWeek[]> => {
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
  return weeks as ScheduleWeek[]
}

export const scrapeWeek = async (weekID: string, language: Languages): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }
  const week = await coll.findOne(query)
  if (!week) throw new Error('Week ID does not exist')
  const update: UpdateQuery<CollScheduleWeek> = { $set: await scrapeWOL(week.date, language) }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false }) as { value?: ScheduleWeek }
  if (!value) throw new Error('Update not successful')
  return value
}

export const updateAssignment = async (weekID: string, language: Languages, name: Assignments, assignment: IScheduleAssignment): Promise<IWeekWithMembers> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }

  // Remove existing assigned members
  const updatedMembers = []
  const baseWeek = await coll.findOne(query)
  if (!baseWeek) throw new Error('404')
  const week = baseWeek[language] || null
  if (!week) throw new Error('404')
  const previousAssignment = week.assignments[name]
  if (previousAssignment) {
    for (const field of ASSIGNEE_FIELDS) {
      const memberID = previousAssignment[field]
      if (memberID) {
        const member = await removeAssignment(memberID, { type: previousAssignment.type, date: baseWeek.date })
        updatedMembers.push(member)
      }
    }
  }

  // Update Assignment
  const update: UpdateQuery<CollScheduleWeek> = {}
  const assignmentPath = language + '.assignments.' + name
  update.$set = { [assignmentPath]: assignment }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false }) as { value?: ScheduleWeek }
  if (!value) throw new Error('404')

  // Add newly assigned members
  for (const field of ASSIGNEE_FIELDS) {
    const addedMemberAssignment = value[language].assignments[name]
    const memberID = addedMemberAssignment && addedMemberAssignment[field]
    if (memberID) {
      const member = await addAssignment(memberID, { type: assignment.type, date: value.date })
      updatedMembers.push(member)
    }
  }

  // Return assignment
  return { week: value, members: updatedMembers }
}

export const deleteAssignment = async (weekID: string, language: Languages, name: Assignments): Promise<IWeekWithMembers> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }

  // Remove existing assigned members
  const updatedMembers = []
  const baseWeek = await coll.findOne(query)
  if (!baseWeek) throw new Error('404')
  const week = baseWeek[language]
  if (!week) throw new Error('404')
  const previousAssignment = week.assignments[name]
  if (previousAssignment) {
    for (const field of ASSIGNEE_FIELDS) {
      const memberID = previousAssignment[field]
      if (memberID) {
        const member = await removeAssignment(memberID, { type: previousAssignment.type, date: baseWeek.date })
        updatedMembers.push(member)
      }
    }
  }

  // Update Assignment
  const update: UpdateQuery<CollScheduleWeek> = {}
  const assignmentPath = language + '.assignments.' + name
  update.$unset = { [assignmentPath]: '' }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false }) as { value?: ScheduleWeek }
  if (!value) throw new Error('404')

  // Return assignment
  return { week: value, members: updatedMembers }
}

export const updateWeekType = async (weekID: string, language: Languages, type: number): Promise<IWeekWithMembers> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }

  // Check the previous week didn't already have the same type
  const baseWeek = await coll.findOne(query)
  if (!baseWeek) throw new Error('404')
  const week = baseWeek[language] || {}
  if (type === week.type) throw new Error('400')

  // Remove existing assigned members if necessary
  const update: UpdateQuery<CollScheduleWeek> = { $set: {} }
  const updatedMembers = []
  switch (type) {
    case WEEK_TYPES.assembly.value:
    case WEEK_TYPES.memorial.value:
      for (const [k, v] of Object.entries(week.assignments || {})) {
        if (v) {
          for (const field of ASSIGNEE_FIELDS) {
            const memberID = v[field]
            if (memberID) {
              const member = await removeAssignment(memberID, { type: v.type, date: baseWeek.date })
              updatedMembers.push(member)
              const assignmentPath = `${language}.assignments.${k}.${field}`
              Object.assign(update.$set, { [assignmentPath]: null })
            }
          }
        }
      }
      break

    case WEEK_TYPES.coVisit.value:
      for (const assignmentName of ['congregationBibleStudy', 'reader'] as const) {
        const assignment = week.assignments[assignmentName]
        if (assignment) {
          for (const field of ASSIGNEE_FIELDS) {
            const memberID = assignment[field]
            if (memberID) {
              const member = await removeAssignment(memberID, { type: assignment.type, date: baseWeek.date })
              updatedMembers.push(member)
              const assignmentPath = `${language}.assignments.${assignmentName}.${field}`
              Object.assign(update.$set, { [assignmentPath]: null })
            }
          }
        }
      }
  }

  // Update Type
  const updatePath = language + '.type'
  Object.assign(update.$set, { [updatePath]: type })
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false }) as { value?: ScheduleWeek }
  if (!value) throw new Error('404')

  // Return week and any removed assigned members
  return { week: value, members: updatedMembers }
}

export const updateCOName = async (weekID: string, language: Languages, name: string): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }
  const updatePath = language + '.coName'
  const update: UpdateQuery<CollScheduleWeek> = { $set: { [updatePath]: name } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false }) as { value?: ScheduleWeek }
  if (!value) throw new Error('404')
  return value
}

export const updateCOTitle = async (weekID: string, language: Languages, title: string): Promise<ScheduleWeek> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(weekID) }
  const updatePath = language + '.coTitle'
  const update: UpdateQuery<CollScheduleWeek> = { $set: { [updatePath]: title } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false }) as { value?: ScheduleWeek }
  if (!value) throw new Error('404')
  return value
}
