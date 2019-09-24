import { ObjectID, Collection } from 'mongodb'
import assert from 'assert'
import setup from './setup'

import { ICongregationMember } from '../src/ts/interfaces'
import { MongoInterface } from '@/ts/types'

type CollCongregationMember = MongoInterface<ICongregationMember>

const getCollection = new Promise<Collection<CollCongregationMember>>((resolve): void => {
  setup
    .then(db => db.collection('congregation'))
    .then(resolve)
})

export const getMembers = async (): Promise<ICongregationMember[]> => {
  const coll = await getCollection
  const members = await coll.find().toArray()
  return members as ICongregationMember[]
}

export const addMember = async (member: CollCongregationMember): Promise<ICongregationMember> => {
  const coll = await getCollection
  const newMemberResult = await coll.insertOne(member)
  const newMember: ICongregationMember | null = newMemberResult && newMemberResult.ops && newMemberResult.ops[0]
  if (!newMember) throw new Error('Adding New Member was unsuccessful')
  return newMember
}

export const updateMember = async ({ memberID, member }): Promise<ICongregationMember> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const update = { $set: member }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, '404')
  return value
}

// TODO: We also need to remove all assignments that a member is assigned to
export const deleteMember = async ({ memberID }): Promise<void> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const { deletedCount } = await coll.deleteOne(query)
  assert.strictEqual(deletedCount, 1, '404')
}

export const addAssignment = async ({ memberID, assignment }): Promise<ICongregationMember> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const update = { $addToSet: { assignments: assignment } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, '404')
  return value
}

export const removeAssignment = async ({ memberID, assignment }): Promise<ICongregationMember> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const update = { $pull: { assignments: assignment } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  assert.notStrictEqual(null, value, '404')
  return value
}

export const bulkAddMembers = async (members): Promise<void> => {
  const coll = await getCollection
  await coll.insertMany(members)
}
