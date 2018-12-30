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

export const bulkAddMembers = async members => {
  const coll = await getCollection
  await coll.insertMany(members)
}
