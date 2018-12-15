import { ObjectID } from 'mongodb'
import jwt from 'jsonwebtoken'
import assert from 'assert'
import setup from './setup'

const { PASSWORD, JWT_SECRET } = process.env

const getCollection = new Promise(resolve => {
  setup
    .then(db => db.collection('auth'))
    .then(resolve)
})

const verifyToken = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err)
      if (!decoded) return reject(new Error('Decoded Token is null'))
      resolve(decoded)
    })
  })
}

export const createToken = async ({ password }) => {
  assert.strictEqual(password, PASSWORD, 401)
  const _id = new ObjectID()
  const token = jwt.sign({ _id }, JWT_SECRET, { expiresIn: '7d' })
  const coll = await getCollection
  await coll.insertOne({ _id })
  return token
}

export const validateToken = async ({ token }) => {
  const decoded = await verifyToken(token)
  const coll = await getCollection
  const query = { _id: ObjectID(decoded._id) }
  const existingToken = await coll.findOne(query)
  assert.notStrictEqual(null, existingToken, 'Token no longer valid')
  return decoded.data
}
