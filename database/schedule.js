import { ObjectID } from 'mongodb'
import assert from 'assert'
import setup from './setup'
import scrapeWOL from './scraper'
import { addAssignment, removeAssignment } from './congregation'

const getCollection = new Promise(resolve => {
  setup
    .then(db => db.collection('schedule'))
    .then(resolve)
})

export const getWeek = async ({ date }) => {
  const coll = await getCollection
  const query = { date }
  const existingWeek = await coll.findOne(query)
  if (existingWeek) return existingWeek
  // if week doesn't exist add it and return the added week
  const newWeekResult = await coll.insertOne({ date, assignments: {} })
  const newWeek = newWeekResult && newWeekResult.ops && newWeekResult.ops[0]
  assert.notStrictEqual(null, newWeek, 'Adding Missing Week was unsuccessful')
  return newWeek
}

export const scrapeWeek = async ({ weekID }) => {
  const coll = await getCollection
  const query = { _id: ObjectID(weekID) }
  const week = await coll.findOne(query)
  assert.notStrictEqual(null, week, 'Week ID does not exist')
  const update = { $set: await scrapeWOL(week.date) }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, 'Update not successful')
  return value
}

export const updateAssignment = async ({ weekID, name, assignment }) => {
  const assigneeFields = ['assignee', 'assistant']
  const coll = await getCollection
  const query = { _id: ObjectID(weekID) }

  // Remove existing assigned members
  const updatedMembers = []
  const week = await coll.findOne(query)
  assert.notStrictEqual(null, week, 404)
  const previousAssignment = week.assignments[name]
  if (previousAssignment) {
    for (const field of assigneeFields) {
      const memberID = previousAssignment[field]
      if (memberID) {
        const member = await removeAssignment({ memberID, assignment: { type: previousAssignment.type, date: week.date } })
        updatedMembers.push(member)
      }
    }
  }

  // Update Assignment
  const update = {}
  const assignmentPath = 'assignments.' + name
  update.$set = { [assignmentPath]: assignment }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, 404)

  // Add newly assigned members
  for (const field of assigneeFields) {
    const memberID = value.assignments[name][field]
    if (memberID) {
      const member = await addAssignment({ memberID, assignment: { type: assignment.type, date: value.date } })
      updatedMembers.push(member)
    }
  }

  // Return assignment
  return { week: value, members: updatedMembers }
}
