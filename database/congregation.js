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
  console.log(members)
  assert(members.length, 'No Members Found')
  return members
}

export const bulkAddMembers = async members => {
  const coll = await getCollection
  await coll.insertMany(members)
}
