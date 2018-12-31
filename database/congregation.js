import { ObjectID } from 'mongodb'
import assert from 'assert'
import setup from './setup'

const getCollection = new Promise(resolve => {
  setup
    .then(db => db.collection('congregation'))
    .then(resolve)
})

export const getMembers = async () => {
  const coll = await getCollection
  const members = await coll.find().toArray()
  return members
}

export const addMember = async member => {
  const coll = await getCollection
  const newMemberResult = await coll.insertOne(member)
  const newMember = newMemberResult && newMemberResult.ops && newMemberResult.ops[0]
  assert.notStrictEqual(null, newMember, 'Adding New Member was unsuccessful')
  return newMember
}

export const updateMember = async ({ memberID, member }) => {
  const coll = await getCollection
  const query = { _id: ObjectID(memberID) }
  const update = { $set: member }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, 404)
  return value
}

// TODO: We also need to remove all assignments that a member is assigned to
export const deleteMember = async ({ memberID }) => {
  const coll = await getCollection
  const query = { _id: ObjectID(memberID) }
  const { deletedCount } = await coll.deleteOne(query)
  assert.strictEqual(deletedCount, 1, 404)
}

export const bulkAddMembers = async members => {
  const coll = await getCollection
  await coll.insertMany(members)
}
