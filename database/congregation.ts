import { ObjectID, Collection, UpdateQuery } from 'mongodb'
import setup from './setup'

import { ICongregationMember, IMemberAssignment, MongoInterface } from 'types'

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
  return newMember as ICongregationMember
}

export const updateMember = async (memberID: string, member: ICongregationMember): Promise<ICongregationMember> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const updateMember = { ...member }
  delete updateMember._id
  const update: UpdateQuery<CollCongregationMember> = { $set: updateMember }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  if (!value) throw new Error('404')
  return value as ICongregationMember
}

// TODO: We also need to remove all assignments that a member is assigned to
export const deleteMember = async (memberID: string): Promise<void> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const { deletedCount } = await coll.deleteOne(query)
  if (deletedCount !== 1) throw new Error('404')
}

export const addAssignment = async (memberID: string, assignment: IMemberAssignment): Promise<ICongregationMember> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const update = { $addToSet: { assignments: assignment } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  if (!value) throw new Error('404')
  return value as ICongregationMember
}

export const removeAssignment = async (memberID: string, assignment: IMemberAssignment): Promise<ICongregationMember> => {
  const coll = await getCollection
  const query = { _id: new ObjectID(memberID) }
  const update = { $pull: { assignments: assignment } }
  const { value } = await coll.findOneAndUpdate(query, update, { returnOriginal: false })
  if (!value) throw new Error('404')
  return value as ICongregationMember
}

export const bulkAddMembers = async (members: ICongregationMember[]): Promise<void> => {
  const coll = await getCollection
  await coll.insertMany(members)
}
