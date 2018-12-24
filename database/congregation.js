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

export const bulkAddMembers = async members => {
  const coll = await getCollection
  await coll.insertMany(members)
}
