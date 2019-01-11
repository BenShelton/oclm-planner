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

export const getMonth = async ({ month }) => {
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
  const weeks = await coll.find(query).toArray()
  assert.strictEqual(weekCount, weeks.length, 'Month did not return the expected number of weeks')
  return weeks
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
